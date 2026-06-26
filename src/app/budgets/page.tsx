import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createCategory, createBudget } from "@/app/actions/budgets";
import { Button } from "@/components/ui/button";

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      categories: true,
      budgets: {
        include: { category: true }
      }
    }
  });

  if (!user) redirect("/auth/signin");

  const expensesCategories = user.categories.filter(c => c.type === "expense");

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium text-[var(--color-espresso-ink)]">Categories & Budgets</h1>
        <p className="text-sm text-[var(--color-muted-clay)]">Organize your spending and set limits</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Categories Column */}
        <section className="flex flex-col gap-6">
          <div className="bg-[var(--color-card-stone)] p-6 rounded-xl border border-[var(--color-border-sand)] shadow-subtle">
            <h2 className="text-xl font-medium text-[var(--color-espresso-ink)] mb-4">Add Category</h2>
            <form action={createCategory} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm text-[var(--color-espresso-ink)]">Category Name</label>
                  <input required id="name" name="name" type="text" placeholder="e.g. Dining Out" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="type" className="text-sm text-[var(--color-espresso-ink)]">Type</label>
                  <select required id="type" name="type" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>
              <Button type="submit" variant="outline" className="mt-2 rounded-full border-[var(--color-espresso-ink)] text-[var(--color-espresso-ink)]">
                Create Category
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-medium text-[var(--color-espresso-ink)]">Your Categories</h3>
            {user.categories.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-clay)] italic">No categories yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.categories.map(cat => (
                  <span key={cat.id} className="px-3 py-1.5 bg-[var(--color-card-stone)] border border-[var(--color-border-sand)] rounded-full text-sm text-[var(--color-espresso-ink)]">
                    {cat.name} <span className="text-[10px] text-[var(--color-muted-clay)] ml-1 uppercase">{cat.type}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Budgets Column */}
        <section className="flex flex-col gap-6">
          <div className="bg-[var(--color-card-stone)] p-6 rounded-xl border border-[var(--color-border-sand)] shadow-subtle">
            <h2 className="text-xl font-medium text-[var(--color-espresso-ink)] mb-4">Set Budget Limit</h2>
            <form action={createBudget} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="categoryId" className="text-sm text-[var(--color-espresso-ink)]">Category</label>
                <select required id="categoryId" name="categoryId" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm">
                  <option value="">Select an expense category...</option>
                  {expensesCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="amount" className="text-sm text-[var(--color-espresso-ink)]">Amount</label>
                  <input required id="amount" name="amount" type="number" step="0.01" placeholder="500.00" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="period" className="text-sm text-[var(--color-espresso-ink)]">Period</label>
                  <select required id="period" name="period" className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] outline-none focus:border-[var(--color-muted-clay)] text-sm">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <Button type="submit" className="mt-2 bg-[var(--color-espresso-ink)] text-[var(--color-page-parchment)] rounded-full">
                Save Budget
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-medium text-[var(--color-espresso-ink)]">Active Budgets</h3>
            {user.budgets.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-clay)] italic">No budgets set yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {user.budgets.map(b => (
                  <div key={b.id} className="flex justify-between items-center p-4 bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--color-espresso-ink)]">{b.category.name}</span>
                      <span className="text-xs text-[var(--color-muted-clay)] capitalize">{b.month}</span>
                    </div>
                    <span className="font-mono font-medium text-[var(--color-espresso-ink)]">Rp {b.amount.toLocaleString('id-ID')}</span>
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
