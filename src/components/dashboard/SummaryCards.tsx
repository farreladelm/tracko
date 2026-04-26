import { getSummary } from "@/app/actions/dashboard/get-summary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatRupiah } from "@/lib/utils/format"
import { AlertCircle } from "lucide-react"

export async function SummaryCards() {
  const result = await getSummary()

  if (result.error) {
    return (
      <Alert variant="destructive" className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Gagal memuat ringkasan</AlertDescription>
      </Alert>
    )
  }

  const { thisMonth, lastMonth, percentageChange } = result.data!

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      {/* Card 1 — Total This Month */}
      <Card className="border shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-500">Pengeluaran Bulan Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{formatRupiah(thisMonth.total)}</div>
          <p className="text-xs text-zinc-500 mt-1">{thisMonth.count} transaksi</p>
        </CardContent>
      </Card>

      {/* Card 2 — vs Last Month */}
      <Card className="border shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-500">Dibanding Bulan Lalu</CardTitle>
        </CardHeader>
        <CardContent>
          {percentageChange === null ? (
            <Badge variant="secondary">Belum ada data</Badge>
          ) : (
            <div className={`text-2xl font-bold tracking-tight ${percentageChange < 0 ? 'text-green-600' : 'text-red-500'}`}>
              {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(2)}%
            </div>
          )}
          <p className="text-xs text-zinc-500 mt-1">vs {formatRupiah(lastMonth.total)}</p>
        </CardContent>
      </Card>

      {/* Card 3 — Mandiri */}
      <Card className="border shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-zinc-500">Mandiri</CardTitle>
          <Badge variant="outline" className="text-[10px] px-1 py-0">MANDIRI</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{formatRupiah(thisMonth.bySource.MANDIRI)}</div>
          <p className="text-xs text-zinc-500 mt-1">Bulan ini</p>
        </CardContent>
      </Card>

      {/* Card 4 — BLU by BCA */}
      <Card className="border shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-zinc-500">BLU by BCA</CardTitle>
          <Badge variant="outline" className="text-[10px] px-1 py-0">BLU</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{formatRupiah(thisMonth.bySource.BCA_BLU || 0)}</div>
          <p className="text-xs text-zinc-500 mt-1">Bulan ini</p>
        </CardContent>
      </Card>
    </div>
  )
}
