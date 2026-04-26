import { auth, signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function Home() {
  const session = await auth()
  
  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-12 text-center">
        
        <div className="space-y-6 fade-in slide-in-from-bottom-4 animate-in duration-700">
          <div className="flex justify-center mb-8">
            <div className="relative h-40 w-40">
              <Image
                src="/tracko-logo.png"
                alt="Tracko Logo"
                fill
                sizes="160px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500 pb-2">
            Tracko
          </h1>
          
          <p className="text-zinc-500 max-w-[700px] text-xl md:text-2xl mx-auto leading-relaxed">
            Solusi pelacak pengeluaran otomatis untuk gaya hidup modern. Hubungkan dengan Gmail untuk pencatatan transaksi Mandiri & BLU yang akurat dan instan.
          </p>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
          >
            <Button type="submit" size="lg" className="rounded-full px-12 py-7 text-lg shadow-xl hover:scale-105 transition-transform bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              Masuk dengan Google
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left w-full max-w-4xl">
          <div className="p-6 rounded-2xl border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-2">Otomatis</h3>
            <p className="text-zinc-500">Tarik data transaksi langsung dari email tanpa input manual.</p>
          </div>
          <div className="p-6 rounded-2xl border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-2">Akurat</h3>
            <p className="text-zinc-500">Parsing data QRIS Mandiri & BLU dengan presisi tinggi.</p>
          </div>
          <div className="p-6 rounded-2xl border bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-2">Ekspor CSV</h3>
            <p className="text-zinc-500">Unduh semua data pengeluaran Anda untuk analisis lebih lanjut.</p>
          </div>
        </div>
      </div>
    </main>
  )
}


