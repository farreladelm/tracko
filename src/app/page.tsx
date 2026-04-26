import { auth, signIn, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { DashboardClient } from "@/components/dashboard-client"
import { getTransactionsAction } from "@/app/actions"

export default async function Home() {
  const session = await auth()
  
  // Fetch initial transactions if user is logged in
  let initialExpenses = []
  if (session) {
    const result = await getTransactionsAction()
    if (result.success && result.data) {
      initialExpenses = result.data
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8">
        
        <div className="text-center space-y-4 fade-in slide-in-from-bottom-4 animate-in duration-700">
          <div className="inline-flex items-center justify-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>QRIS Extraction Active</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500 pb-2">
            Expense Tracker
          </h1>
          <p className="text-zinc-500 max-w-[600px] text-lg mx-auto">
            Automatically pull your Mandiri and BLU QRIS transaction receipts directly from Gmail and export to CSV.
          </p>
        </div>
        
        {session ? (
          <div className="w-full flex flex-col items-center gap-8">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl p-4 border rounded-2xl bg-white/60 dark:bg-zinc-900/60 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                {session.user?.image && (
                  <img src={session.user.image} alt="Profile" className="w-12 h-12 rounded-full border-2 border-zinc-100 dark:border-zinc-800" />
                )}
                <div className="text-left">
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{session.user?.name}</p>
                  <p className="text-sm text-zinc-500">{session.user?.email}</p>
                </div>
              </div>
              <form
                action={async () => {
                  "use server"
                  await signOut()
                }}
              >
                <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                  Sign Out
                </Button>
              </form>
            </div>

            <DashboardClient initialExpenses={initialExpenses} />
            
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <form
              action={async () => {
                "use server"
                await signIn("google", { redirectTo: "/" })
              }}
            >
              <Button type="submit" size="lg" className="rounded-full px-8 shadow-md">
                Sign In with Google
              </Button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
