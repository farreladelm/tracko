import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { SummaryCardsSkeleton } from "@/components/dashboard/SummaryCardsSkeleton"
import { DashboardClient } from "@/components/dashboard-client"
import { getTransactionsAction } from "@/app/actions"
import { Suspense } from "react"
import { Expense } from "@/lib/parsers"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/")
  }

  // Fetch initial transactions
  let initialExpenses: Expense[] = []
  const result = await getTransactionsAction()
  if (result.success && result.data) {
    initialExpenses = result.data as Expense[]
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Header user={session.user} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4">Ringkasan Pengeluaran</h2>
            <Suspense fallback={<SummaryCardsSkeleton />}>
              <SummaryCards />
            </Suspense>
          </section>

          <DashboardClient initialExpenses={initialExpenses} />
        </div>
      </main>
    </div>
  )
}
