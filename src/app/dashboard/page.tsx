import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      financialAccounts: true,
      gmailCredential: true,
    }
  });

  if (!user) redirect("/auth/signin");

  // Calculate stats
  const totalBalance = user.financialAccounts.reduce((acc, account) => acc + account.balance, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth },
      amount: { lt: 0 } // expenses are negative
    }
  });

  const monthlyExpenses = monthlyTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Fetch Pending Review transactions
  const pendingTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      categoryId: null, // No category assigned yet
    },
    include: { account: true },
    orderBy: { date: 'desc' },
    take: 5
  });

  // Fetch recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { account: true, category: true },
    orderBy: { date: 'desc' },
    take: 5
  });

  const isGmailConnected = !!user.gmailCredential;

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium text-[var(--color-espresso-ink)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-muted-clay)]">Welcome back, {session.user.name || 'User'}</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-card-stone)] rounded-xl p-6 border border-[var(--color-border-sand)]">
          <h3 className="text-sm font-medium text-[var(--color-muted-clay)] uppercase tracking-wider mb-2">Total Balance</h3>
          <p className="text-3xl font-normal text-[var(--color-espresso-ink)]">Rp {totalBalance.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-[var(--color-card-stone)] rounded-xl p-6 border border-[var(--color-border-sand)]">
          <h3 className="text-sm font-medium text-[var(--color-muted-clay)] uppercase tracking-wider mb-2">Monthly Expenses</h3>
          <p className="text-3xl font-normal text-[var(--color-ember-orange)]">-Rp {monthlyExpenses.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-[var(--color-card-stone)] rounded-xl p-6 border border-[var(--color-border-sand)] flex flex-col justify-center items-start">
          <h3 className="text-sm font-medium text-[var(--color-muted-clay)] mb-2">Auto-Import Status</h3>
          <div className="flex items-center gap-2">
            {isGmailConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[var(--color-signal-green)] animate-pulse"></span>
                <span className="text-sm text-[var(--color-espresso-ink)] font-medium">Active & Monitoring</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[var(--color-trace-smoke)]"></span>
                <Link href="/settings" className="text-sm text-[var(--color-espresso-ink)] font-medium hover:underline">Connect Gmail</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Pending Review Section */}
        <section className="flex flex-col">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-medium text-[var(--color-espresso-ink)]">Pending Review</h2>
            <Link href="/transactions" className="text-sm text-[var(--color-muted-clay)] hover:text-[var(--color-ember-orange)]">View all</Link>
          </div>
          
          <div className="bg-[var(--color-page-parchment)] rounded-xl border border-[var(--color-border-sand)] overflow-hidden shadow-subtle flex-1">
            {pendingTransactions.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <span className="text-2xl mb-2">✨</span>
                <p className="text-[var(--color-muted-clay)] text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border-sand)]">
                {pendingTransactions.map(t => (
                  <div key={t.id} className="p-4 flex justify-between items-center hover:bg-white/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--color-espresso-ink)]">{t.note}</span>
                      <span className="text-xs text-[var(--color-muted-clay)]">{t.date.toLocaleDateString()} &middot; {t.account.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-[var(--color-espresso-ink)]">
                        {t.amount < 0 ? `-Rp ${Math.abs(t.amount).toLocaleString('id-ID')}` : `+Rp ${t.amount.toLocaleString('id-ID')}`}
                      </span>
                      <Link href="/transactions" className="text-xs bg-[var(--color-ember-orange)] text-white px-3 py-1 rounded-full hover:opacity-90">
                        Categorize
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Transactions Section */}
        <section className="flex flex-col">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-medium text-[var(--color-espresso-ink)]">Recent Transactions</h2>
            <Link href="/transactions" className="text-sm text-[var(--color-muted-clay)] hover:text-[var(--color-ember-orange)]">View all</Link>
          </div>
          
          <div className="bg-[var(--color-card-stone)] rounded-xl border border-[var(--color-border-sand)] overflow-hidden flex-1">
            {recentTransactions.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <p className="text-[var(--color-muted-clay)] text-sm">No recent transactions.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border-sand)]">
                {recentTransactions.map(t => (
                  <div key={t.id} className="p-4 flex justify-between items-center hover:bg-[var(--color-page-parchment)]/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--color-espresso-ink)]">{t.note}</span>
                      <span className="text-xs text-[var(--color-muted-clay)]">
                        {t.category ? t.category.name : 'Uncategorized'}
                      </span>
                    </div>
                    <span className={`font-mono text-sm ${t.amount < 0 ? 'text-[var(--color-espresso-ink)]' : 'text-[var(--color-signal-green)]'}`}>
                      {t.amount < 0 ? `-Rp ${Math.abs(t.amount).toLocaleString('id-ID')}` : `+Rp ${t.amount.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
