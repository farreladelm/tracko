import Link from 'next/link'
import { Button } from './ui/button'

export function NavBar() {
  return (
    <header className="w-full h-20 flex items-center justify-between px-6 md:px-10 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        {/* Placeholder Logo Icon */}
        <div className="w-5 h-5 bg-[var(--color-espresso-ink)] mask-cursor" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%, 25% 50%)' }} />
        <span className="font-normal text-[var(--color-espresso-ink)] tracking-[0.01em] text-base uppercase">Tracko</span>
      </div>
      
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/dashboard" className="text-sm font-normal text-[var(--color-espresso-ink)] hover:text-[var(--color-ember-orange)]">Dashboard</Link>
        <Link href="/accounts" className="text-sm font-normal text-[var(--color-espresso-ink)] hover:text-[var(--color-ember-orange)]">Accounts</Link>
        <Link href="/transactions" className="text-sm font-normal text-[var(--color-espresso-ink)] hover:text-[var(--color-ember-orange)]">Transactions</Link>
        <Link href="/budgets" className="text-sm font-normal text-[var(--color-espresso-ink)] hover:text-[var(--color-ember-orange)]">Budgets</Link>
        <Link href="/settings" className="text-sm font-normal text-[var(--color-espresso-ink)] hover:text-[var(--color-ember-orange)]">Settings</Link>
      </nav>
      
      <div className="flex items-center gap-6">
        <Link href="/auth/signin" className="text-sm font-normal text-[var(--color-espresso-ink)] hover:text-[var(--color-ember-orange)]">Sign in</Link>
        <Button className="bg-[var(--color-espresso-ink)] text-[var(--color-page-parchment)] hover:opacity-90 rounded-full px-5 h-10">
          Get Started
        </Button>
      </div>
    </header>
  )
}
