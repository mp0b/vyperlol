import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HalftoneBg } from "@/components/marketing/halftone-bg";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col text-white">
      <HalftoneBg />
      <header className="relative z-10 flex items-center justify-between p-5 lg:p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white group-hover:text-orange-500 transition-colors">
            <path d="M10 20 L50 40 L90 10 L80 50 L95 85 L50 60 L15 90 L25 50 Z" fill="currentColor"/>
          </svg>
          <span className="font-semibold text-lg tracking-tight">Vyper</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
        >
          <ArrowLeft className="size-4" /> Back home
        </Link>
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
