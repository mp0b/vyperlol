"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/explore", label: "Explore" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/status", label: "Status" },
];

export function SiteHeader({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 w-full pointer-events-none">
      <motion.header 
        layout
        initial={false}
        animate={{
          width: scrolled ? "850px" : "1280px",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(24px)",
          paddingTop: scrolled ? "12px" : "20px",
          paddingBottom: scrolled ? "12px" : "20px",
          paddingLeft: scrolled ? "24px" : "32px",
          paddingRight: scrolled ? "24px" : "32px",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        className="pointer-events-auto rounded-[2rem] border border-white/10 flex items-center justify-between shadow-2xl relative overflow-hidden"
      >
        <AnimatePresence>
          {scrolled && (
            <motion.div
              layoutId="header-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <motion.div layout className="flex items-center gap-3 group relative z-10 whitespace-nowrap">
          <Link href="/" className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white group-hover:text-orange-500 transition-colors shrink-0">
              <path d="M10 20 L50 40 L90 10 L80 50 L95 85 L50 60 L15 90 L25 50 Z" fill="currentColor"/>
            </svg>
            <AnimatePresence mode="popLayout">
              {!scrolled && (
                <motion.span 
                  initial={{ opacity: 0, filter: "blur(8px)", y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(8px)", y: -10, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="font-semibold text-lg text-white tracking-tight"
                >
                  Vyper
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>

        <motion.nav layout className="hidden md:flex items-center gap-8 relative z-10 whitespace-nowrap">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </motion.nav>

        <motion.div layout className="flex items-center gap-3 relative z-10 whitespace-nowrap">
          {authed ? (
            <Button asChild size="sm" className="rounded-full bg-white text-black hover:bg-gray-200">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {!scrolled && (
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(8px)", scale: 0.9, width: "auto" }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1, width: "auto" }}
                    exit={{ opacity: 0, filter: "blur(8px)", scale: 0.9, width: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden mr-1"
                  >
                    <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-gray-300 hover:text-white hover:bg-white/10 rounded-full w-full">
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button asChild size="sm" className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:opacity-90 border-0 shadow-lg shrink-0">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white rounded-full shrink-0" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-black/95 border-white/10 text-white p-6">
              <SheetTitle className="text-white flex items-center gap-3 mb-8">
                <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500">
                  <path d="M10 20 L50 40 L90 10 L80 50 L95 85 L50 60 L15 90 L25 50 Z" fill="currentColor"/>
                </svg>
                Vyper
              </SheetTitle>
              <nav className="flex flex-col gap-4">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-gray-300 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-8 flex flex-col gap-3">
                {authed ? (
                  <Button asChild className="rounded-full bg-white text-black">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>
      </motion.header>
    </div>
  );
}
