import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

const interTight = Inter_Tight({
  variable: "--font-cursorgothic",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-berkeleymono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tracko - Expense Tracker",
  description: "A premium, auto-importing expense tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-[var(--color-ember-orange)] selection:text-white">
        <NavBar />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
