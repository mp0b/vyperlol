import "server-only";
import { randomBytes, createHash, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/** URL-safe random token (default 32 bytes → 43 chars base64url). */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Deterministic SHA-256 hex — used to store only hashes of secrets. */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** HMAC-SHA256 hex, keyed by a secret (webhook signatures, signed values). */
export function hmac(input: string, secret: string): string {
  return createHmac("sha256", secret).update(input).digest("hex");
}

/**
 * Privacy-preserving visitor hash: never store raw IPs. Salted with the app
 * secret so hashes aren't reversible via a rainbow table of IPs.
 */
export function visitorHash(ip: string, userAgent = ""): string {
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${env.AUTH_SECRET}`)
    .digest("hex")
    .slice(0, 32);
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
