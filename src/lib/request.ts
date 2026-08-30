import "server-only";
import { headers } from "next/headers";
import { visitorHash } from "@/lib/crypto";

export interface RequestMeta {
  ip: string;
  ipHash: string;
  userAgent: string;
  country: string | null;
  referrer: string | null;
}

/** Extract client metadata from proxy headers (Vercel / Cloudflare aware). */
export async function getRequestMeta(): Promise<RequestMeta> {
  const h = await headers();
  const xff = h.get("x-forwarded-for") ?? "";
  const ip =
    xff.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
  const userAgent = h.get("user-agent") ?? "";
  const country =
    h.get("cf-ipcountry") ??
    h.get("x-vercel-ip-country") ??
    null;
  const referrer = h.get("referer");
  return {
    ip,
    ipHash: visitorHash(ip, userAgent),
    userAgent,
    country: country && country !== "XX" ? country : null,
    referrer,
  };
}

/** Very small UA classifier for privacy-friendly analytics (no fingerprinting). */
export function classifyUserAgent(ua: string): {
  device: string;
  os: string;
  browser: string;
} {
  const s = ua.toLowerCase();
  const device = /mobile|iphone|android(?!.*tablet)/.test(s)
    ? "Mobile"
    : /ipad|tablet/.test(s)
      ? "Tablet"
      : "Desktop";
  const os = /windows/.test(s)
    ? "Windows"
    : /mac os|macintosh/.test(s)
      ? "macOS"
      : /android/.test(s)
        ? "Android"
        : /iphone|ipad|ios/.test(s)
          ? "iOS"
          : /linux/.test(s)
            ? "Linux"
            : "Other";
  const browser = /edg\//.test(s)
    ? "Edge"
    : /opr\/|opera/.test(s)
      ? "Opera"
      : /chrome|crios/.test(s)
        ? "Chrome"
        : /firefox|fxios/.test(s)
          ? "Firefox"
          : /safari/.test(s)
            ? "Safari"
            : "Other";
  return { device, os, browser };
}
