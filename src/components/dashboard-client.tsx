"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { syncReceiptsAction } from "@/app/actions";
import { exportToCsv } from "@/lib/csv";
import { Expense } from "@/lib/parsers";
import { Download, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export function DashboardClient({ initialExpenses = [] }: { initialExpenses?: Expense[] }) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(initialExpenses.length > 0);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    
    // Call server action
    const result = await syncReceiptsAction();
    
    if (result.success && result.data) {
      setExpenses(result.data);
      setSynced(true);
    } else {
      setError(result.error || "Failed to fetch receipts.");
    }
    setLoading(false);
  };

  const handleExport = () => {
    if (expenses.length > 0) {
      exportToCsv(expenses);
    }
  };

  // Safe formatting for the date, allowing for strings passed from Server Action
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Tanggal Tidak Diketahui";
    return new Intl.DateTimeFormat("id-ID", {
      month: "short", day: "numeric", year: "numeric"
    }).format(d);
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Transaksi Terakhir</CardTitle>
            <CardDescription className="text-zinc-500">
              Sinkronisasi dan ekspor struk QRIS Anda dari Gmail.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleExport} 
              disabled={expenses.length === 0 || loading}
              className="flex-1 sm:flex-none group transition-all"
            >
              <Download className="mr-2 h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
              CSV
            </Button>
            <Button 
              onClick={handleSync} 
              disabled={loading}
              className="flex-1 sm:flex-none bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 group transition-all"
            >
              <RefreshCw className={`mr-2 h-4 w-4 transition-transform ${loading ? 'animate-spin' : 'group-hover:-translate-y-0.5'}`} />
              {loading ? "Sinkronisasi..." : "Sinkronisasi Gmail"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-3 border border-red-100 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead className="w-[120px]">Tanggal</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses.map((expense, idx) => (
                    <TableRow key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                      <TableCell className="font-medium text-zinc-600 dark:text-zinc-400">
                        {formatDate(expense.transactionDate)}
                      </TableCell>
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {expense.merchantName}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                          {expense.source}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium tracking-tight">
                        {formatIDR(expense.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                      {synced && !loading 
                        ? "Tidak ada struk QRIS baru. Coba lakukan transaksi!"
                        : "Klik 'Sinkronisasi Gmail' untuk mengambil struk QRIS terbaru Anda."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {synced && !loading && expenses.length > 0 && (
            <div className="mt-4 flex items-center justify-end text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Berhasil sinkronisasi {expenses.length} struk
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
