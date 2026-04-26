import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Filter, 
  Database, 
  EyeOff, 
  Trash2, 
  Shield, 
  Minimize, 
  ChevronDown,
  ArrowLeft,
  Mail
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans py-12 px-4 md:py-20">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Navigation */}
        <div className="flex justify-start">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>

        {/* 1. Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500">
            Privasi Anda, Prioritas Tracko
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Tracko hanya membaca email notifikasi transaksi bank Anda. Email pribadi Anda tidak akan pernah disentuh.
          </p>
        </div>

        {/* 2. What We Access - Permission Breakdown */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold font-heading">Transparansi Akses</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-100 bg-white dark:bg-zinc-900 dark:border-green-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Yang Tracko BACA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <p className="flex items-start gap-2 text-sm italic mb-4">Email dari pengirim resmi:</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Mandiri (no-reply@bankmandiri.co.id)
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    BLU by BCA (noreply@blubybcadigital.id)
                  </li>
                  <li className="flex items-center gap-3 border-t pt-3 dark:border-zinc-800">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Nominal transaksi, nama merchant, dan tanggal
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-100 bg-white dark:bg-zinc-900 dark:border-red-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <XCircle className="w-5 h-5" />
                  Yang TIDAK PERNAH Disentuh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    Email pribadi (keluarga, teman, pekerjaan)
                  </li>
                  <li className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    Lampiran atau file (PDF, gambar, dll)
                  </li>
                  <li className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    Email dari pengirim lain di luar daftar putih
                  </li>
                  <li className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    Draft, kontak, atau email yang Anda kirim
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. How It Works */}
        <section className="space-y-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold font-heading">Cara Kerja</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">1. Login Google</h3>
                <p className="text-sm text-zinc-500">Anda masuk dengan Google — Tracko meminta akses Gmail "read-only".</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <Filter className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">2. Filter Otomatis</h3>
                <p className="text-sm text-zinc-500">Tracko hanya memfilter email dari Mandiri dan BLU — email lain diabaikan.</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">3. Ekstraksi Data</h3>
                <p className="text-sm text-zinc-500">Tracko mengambil tanggal, merchant, dan nominal — lalu menyimpannya di akun Anda.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Your Data, Your Control */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold font-heading">Data Anda, Kendali Anda</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 bg-white dark:bg-zinc-900 border rounded-2xl flex gap-4">
              <EyeOff className="w-6 h-6 text-zinc-400 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-bold">Akses Read-Only</h3>
                <p className="text-sm text-zinc-500">Tracko tidak bisa mengirim, menghapus, atau mengubah email Anda.</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 border rounded-2xl flex gap-4">
              <Trash2 className="w-6 h-6 text-zinc-400 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-bold">Hapus Kapan Saja</h3>
                <p className="text-sm text-zinc-500">Putuskan akses atau hapus semua data Anda dengan satu klik.</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 border rounded-2xl flex gap-4">
              <Shield className="w-6 h-6 text-zinc-400 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-bold">Data Tetap Milik Anda</h3>
                <p className="text-sm text-zinc-500">Tracko tidak pernah menjual atau membagikan data Anda ke pihak ketiga.</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 border rounded-2xl flex gap-4">
              <Minimize className="w-6 h-6 text-zinc-400 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-bold">Izin Minimal</h3>
                <p className="text-sm text-zinc-500">Tracko hanya meminta izin Gmail terkecil yang dibutuhkan agar aplikasi berfungsi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Technical Transparency */}
        <section className="pt-8 border-t dark:border-zinc-800">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none py-4">
              <h2 className="text-xl font-bold font-heading">Transparansi Teknis</h2>
              <ChevronDown className="w-5 h-5 text-zinc-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="pt-4 pb-8 space-y-6 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="space-y-2">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">OAuth Scope (Izin Google)</p>
                <code className="block p-3 bg-zinc-100 dark:bg-zinc-800 rounded-md font-mono">
                  https://www.googleapis.com/auth/gmail.readonly
                </code>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">Daftar Putih Pengirim (Whitelisted Senders)</p>
                <ul className="list-disc pl-5 space-y-1 font-mono">
                  <li>no-reply@bankmandiri.co.id</li>
                  <li>noreply@blubybcadigital.id</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">Data yang Disimpan di Database</p>
                <code className="block p-3 bg-zinc-100 dark:bg-zinc-800 rounded-md font-mono">
                  date, merchant_name, amount, bank_source, user_id
                </code>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">Data yang TIDAK Disimpan</p>
                <p>Isi email lengkap (body), subjek email, data setelah parsing selesai.</p>
              </div>
            </div>
          </details>
        </section>

        {/* 6. CTA Section */}
        <section className="text-center pt-16 pb-24">
          <div className="flex flex-col items-center gap-4">
            <Link href="/">
              <Button size="lg" className="rounded-full px-12 h-12 shadow-md mb-2">
                Kembali ke Dashboard
              </Button>
            </Link>
            <a 
              href="https://myaccount.google.com/permissions" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="text-zinc-500 hover:text-red-600 hover:bg-transparent hover:underline rounded-full px-8 underline-offset-4 transition-all">
                Putuskan Akses Gmail (Google Account)
              </Button>
            </a>
            <div className="flex items-center gap-2 text-xs text-zinc-400 pt-8">
              <Mail className="w-3 h-3" />
              <span>Ada pertanyaan? Hubungi kami di [email]</span>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
