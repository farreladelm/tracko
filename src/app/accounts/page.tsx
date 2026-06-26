import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createAccount } from "@/app/actions/accounts";
import { Button } from "@/components/ui/button";

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { financialAccounts: true }
  });

  if (!user) redirect("/auth/signin");

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium text-[var(--color-espresso-ink)]">Accounts</h1>
        <p className="text-sm text-[var(--color-muted-clay)]">Manage your bank accounts and wallets</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Account List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-medium text-[var(--color-espresso-ink)]">Your Accounts</h2>
          {user.financialAccounts.length === 0 ? (
            <div className="p-8 border border-dashed border-[var(--color-border-sand)] rounded-xl flex items-center justify-center text-[var(--color-muted-clay)]">
              No accounts added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {user.financialAccounts.map(acc => (
                <div key={acc.id} className="bg-[var(--color-card-stone)] p-5 rounded-xl border border-[var(--color-border-sand)] flex justify-between items-center shadow-subtle">
                  <div className="flex flex-col">
                    <span className="font-medium text-[var(--color-espresso-ink)]">{acc.name}</span>
                    <span className="text-sm text-[var(--color-muted-clay)] capitalize">{acc.type}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-lg text-[var(--color-espresso-ink)]">Rp {acc.balance.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Account Form */}
        <div className="bg-[var(--color-card-stone)] p-6 rounded-xl border border-[var(--color-border-sand)] shadow-subtle h-fit">
          <h2 className="text-xl font-medium text-[var(--color-espresso-ink)] mb-6">Add New Account</h2>
          <form action={createAccount} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm text-[var(--color-espresso-ink)]">Account Name</label>
              <input required id="name" name="name" type="text" placeholder="e.g. Chase Checking" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="type" className="text-sm text-[var(--color-espresso-ink)]">Account Type</label>
              <select required id="type" name="type" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm">
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="investment">Investment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="balance" className="text-sm text-[var(--color-espresso-ink)]">Current Balance</label>
                <input required id="balance" name="balance" type="number" step="0.01" placeholder="0.00" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="currency" className="text-sm text-[var(--color-espresso-ink)]">Currency</label>
                <input id="currency" name="currency" type="text" defaultValue="IDR" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm" />
              </div>
            </div>

            <Button type="submit" className="mt-4 bg-[var(--color-espresso-ink)] text-[var(--color-page-parchment)] rounded-full hover:opacity-90">
              Create Account
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
