import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center pt-20 md:pt-32 pb-20">
      <div className="text-center max-w-3xl flex flex-col items-center">
        <h1 className="text-5xl md:text-[72px] leading-[1.00] tracking-[-0.03em] text-[var(--color-espresso-ink)] mb-6 font-normal">
          Expense tracking that feels like magic.
        </h1>
        <p className="text-[16px] md:text-[18px] leading-[1.50] text-[var(--color-muted-clay)] max-w-[540px] mb-10">
          Connect your Gmail and let Tracko automatically parse your bank receipts into beautifully categorized transactions. No manual entry required.
        </p>
        
        <div className="flex items-center gap-4">
          <Button size="lg" className="bg-[var(--color-espresso-ink)] text-[var(--color-page-parchment)] hover:opacity-90 rounded-full px-8">
            Get Started for free
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8 text-[var(--color-espresso-ink)] border-[var(--color-espresso-ink)] hover:bg-[var(--color-card-stone)] bg-transparent group">
            See how it works
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="w-full mt-24">
        {/* Placeholder for Product Screenshot Card */}
        <div className="w-full aspect-[16/9] bg-[var(--color-card-stone)] rounded-xl border border-[var(--color-border-sand)] flex items-center justify-center" style={{
          boxShadow: 'rgba(0, 0, 0, 0.14) 0px 28px 70px 0px, rgba(0, 0, 0, 0.1) 0px 14px 32px 0px, oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px'
        }}>
          <p className="text-[var(--color-muted-clay)] font-mono text-sm">Product Dashboard Mockup</p>
        </div>
      </div>

      <div className="mt-24 flex flex-col items-center w-full">
        <p className="text-sm text-[var(--color-muted-clay)] mb-8 tracking-widest uppercase">Trusted by your favorite banks</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale">
          {/* Bank Logos Placeholders */}
          <span className="text-xl font-bold text-[var(--color-espresso-ink)]">BCA</span>
          <span className="text-xl font-bold text-[var(--color-espresso-ink)]">GoPay</span>
          <span className="text-xl font-bold text-[var(--color-espresso-ink)]">Mandiri</span>
          <span className="text-xl font-bold text-[var(--color-espresso-ink)]">OVO</span>
          <span className="text-xl font-bold text-[var(--color-espresso-ink)]">Dana</span>
        </div>
      </div>
    </div>
  );
}
