"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-32">
      <div className="w-full max-w-md bg-[var(--color-card-stone)] rounded-2xl border border-[var(--color-border-sand)] p-8 shadow-subtle">
        <div className="flex flex-col items-center mb-8">
          <div className="w-8 h-8 bg-[var(--color-espresso-ink)] mask-cursor mb-4" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%, 25% 50%)' }} />
          <h1 className="text-2xl font-medium text-[var(--color-espresso-ink)] mb-2 tracking-[-0.01em]">Welcome back</h1>
          <p className="text-[var(--color-muted-clay)] text-center text-sm">
            Sign in to access your automated expense tracking dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full bg-[var(--color-page-parchment)] text-[var(--color-espresso-ink)] hover:bg-[var(--color-warm-highlight)] border border-[var(--color-border-sand)] rounded-full h-12 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--color-border-sand)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--color-card-stone)] px-2 text-[var(--color-muted-clay)]">Or</span>
            </div>
          </div>

          <form 
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const email = (e.target as any).email.value;
              const password = (e.target as any).password.value;
              signIn("credentials", { email, password, callbackUrl: "/dashboard" });
            }}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm text-[var(--color-espresso-ink)]">Email address</label>
              <input 
                id="email" 
                name="email"
                type="email" 
                placeholder="you@example.com" 
                className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] text-[var(--color-espresso-ink)] placeholder:text-[var(--color-muted-clay)] outline-none focus:border-[var(--color-muted-clay)] text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm text-[var(--color-espresso-ink)]">Password</label>
              <input 
                id="password" 
                name="password"
                type="password" 
                placeholder="••••••••" 
                className="h-10 px-3 rounded-md bg-[var(--color-page-parchment)] border border-[var(--color-border-sand)] text-[var(--color-espresso-ink)] placeholder:text-[var(--color-muted-clay)] outline-none focus:border-[var(--color-muted-clay)] text-sm"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full mt-2 bg-[var(--color-espresso-ink)] text-[var(--color-page-parchment)] hover:opacity-90 rounded-full h-10 text-sm font-medium"
            >
              Sign in with Email
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
