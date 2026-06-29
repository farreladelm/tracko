import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createTransaction, confirmTransactionForm, deleteTransactionForm } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      financialAccounts: true,
      categories: true,
      transactions: {
        orderBy: { date: 'desc' },
        include: { category: true, account: true }
      }
    }
  });

  if (!user) redirect("/auth/signin");

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium text-[var(--color-espresso-ink)]">Transactions</h1>
        <p className="text-sm text-[var(--color-muted-clay)]">View and manage your transaction history</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Transaction Form */}
        <section className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-[var(--color-card-stone)] p-6 rounded-xl border border-[var(--color-border-sand)] shadow-subtle sticky top-6">
            <h2 className="text-xl font-medium text-[var(--color-espresso-ink)] mb-4">Add Transaction</h2>
            <form action={createTransaction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="accountId" className="text-sm text-[var(--color-espresso-ink)]">Account</label>
                <select required id="accountId" name="accountId" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm">
                  <option value="">Select Account...</option>
                  {user.financialAccounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="amount" className="text-sm text-[var(--color-espresso-ink)]">Amount</label>
                  <input required id="amount" name="amount" type="number" step="0.01" placeholder="-50.00" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm font-mono" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="date" className="text-sm text-[var(--color-espresso-ink)]">Date</label>
                  <input required id="date" name="date" type="date" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="merchant" className="text-sm text-[var(--color-espresso-ink)]">Merchant / Note</label>
                <input required id="merchant" name="merchant" type="text" placeholder="e.g. Starbucks" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="categoryId" className="text-sm text-[var(--color-espresso-ink)]">Category</label>
                <select id="categoryId" name="categoryId" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm">
                  <option value="">No Category</option>
                  {user.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <Button type="submit" className="mt-2 bg-[var(--color-espresso-ink)] text-[var(--color-page-parchment)] rounded-full h-10">
                Add Transaction
              </Button>
            </form>
          </div>
        </section>

        {/* Transaction History Table */}
        <section className="lg:col-span-2 flex flex-col">
          <div className="bg-[var(--color-page-parchment)] rounded-xl border border-[var(--color-border-sand)] overflow-hidden shadow-subtle">
            {user.transactions.length === 0 ? (
              <div className="p-12 text-center text-[var(--color-muted-clay)]">
                No transactions found.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-card-stone)] border-b border-[var(--color-border-sand)]">
                  <tr>
                    <th className="px-5 py-3 font-medium text-[var(--color-muted-clay)]">Date</th>
                    <th className="px-5 py-3 font-medium text-[var(--color-muted-clay)]">Details</th>
                    <th className="px-5 py-3 font-medium text-[var(--color-muted-clay)]">Account</th>
                    <th className="px-5 py-3 font-medium text-[var(--color-muted-clay)] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-sand)]">
                  {user.transactions.map((t) => {
                    const isDraft = t.status === "DRAFT";

                    if (isDraft) {
                      return (
                        <tr key={t.id} className="bg-amber-50/40 hover:bg-amber-50/60 transition-colors border-l-2 border-amber-500">
                          <td className="px-5 py-4 text-[var(--color-muted-clay)] whitespace-nowrap">
                            {t.date.toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-[var(--color-espresso-ink)] flex items-center gap-2">
                                {t.note}
                                <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                  Pending Sync
                                </span>
                              </span>
                              {t.category && (
                                <span className="text-xs text-[var(--color-muted-clay)] mt-0.5">{t.category.name}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <form action={confirmTransactionForm} className="flex items-center gap-2">
                              <input type="hidden" name="transactionId" value={t.id} />
                              <select required name="accountId" defaultValue={t.accountId} className="h-9 px-2 max-w-[150px] rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none text-xs">
                                {user.financialAccounts.map((acc) => (
                                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                              </select>
                              <button type="submit" className="h-9 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer transition-colors">
                                Confirm
                              </button>
                            </form>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className={`font-mono font-medium ${t.amount < 0 ? 'text-[var(--color-espresso-ink)]' : 'text-[var(--color-signal-green)]'}`}>
                                {t.amount > 0 ? '+Rp ' : '-Rp '}{Math.abs(t.amount).toLocaleString('id-ID')}
                              </span>
                              <form action={deleteTransactionForm}>
                                <input type="hidden" name="transactionId" value={t.id} />
                                <button type="submit" className="text-xs text-rose-600 hover:text-rose-800 hover:underline cursor-pointer">
                                  Discard
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={t.id} className="hover:bg-white/50 transition-colors">
                        <td className="px-5 py-4 text-[var(--color-muted-clay)] whitespace-nowrap">
                          {t.date.toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-[var(--color-espresso-ink)]">{t.note}</span>
                            {t.category && (
                              <span className="text-xs text-[var(--color-muted-clay)] mt-0.5">{t.category.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[var(--color-muted-clay)]">
                          {t.account.name}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={`font-mono font-medium ${t.amount < 0 ? 'text-[var(--color-espresso-ink)]' : 'text-[var(--color-signal-green)]'}`}>
                            {t.amount > 0 ? '+Rp ' : '-Rp '}{Math.abs(t.amount).toLocaleString('id-ID')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
