"use client";

import { usePathname } from "next/navigation";
import { HalftoneBg } from "@/components/marketing/halftone-bg";

export function GlobalBg() {
  const pathname = usePathname();
  // Assume user profiles are at /[username] and don't match other known routes
  const knownRoutes = ["/dashboard", "/explore", "/leaderboard", "/login", "/register", "/status", "/api", "/onboarding"];
  const isMarketing = pathname === "/" || pathname === "/pricing" || pathname === "/about";
  const isKnownRoute = knownRoutes.some(route => pathname.startsWith(route));
  
  if (isMarketing || isKnownRoute) {
    return <HalftoneBg />;
  }
  
  return null;
}
