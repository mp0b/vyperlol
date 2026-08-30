import "server-only";
import { env } from "@/lib/env";
import { getRedis } from "@/lib/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix ms when the window resets. */
  reset: number;
}

// ── In-memory fixed-window store (dev / no-Redis fallback) ───────────────────
const memory = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    memory.set(key, { count: 1, resetAt });
    return { success: true, limit, remaining: limit - 1, reset: resetAt };
  }
  entry.count += 1;
  const success = entry.count <= limit;
  return {
    success,
    limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.resetAt,
  };
}

// Opportunistic cleanup so the map can't grow unbounded.
let lastSweep = 0;
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
}

async function redisLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return memoryLimit(key, limit, windowMs);
  try {
    const windowSec = Math.ceil(windowMs / 1000);
    const redisKey = `rl:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) await redis.expire(redisKey, windowSec);
    const ttl = await redis.pttl(redisKey);
    const reset = Date.now() + (ttl > 0 ? ttl : windowMs);
    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch {
    // Degrade to memory rather than failing open on a Redis outage.
    return memoryLimit(key, limit, windowMs);
  }
}

/**
 * Core limiter. `key` should already include the dimension (e.g. `login:ip:x`).
 */
export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  sweep();
  if (env.RATE_LIMIT_DRIVER === "redis") {
    return redisLimit(key, opts.limit, opts.windowMs);
  }
  return Promise.resolve(memoryLimit(key, opts.limit, opts.windowMs));
}

const MIN = 60_000;

/** Named presets for the platform's rate-limited surfaces. */
export const limiters = {
  login: (id: string) => rateLimit(`login:${id}`, { limit: 8, windowMs: 10 * MIN }),
  register: (id: string) => rateLimit(`register:${id}`, { limit: 5, windowMs: 30 * MIN }),
  passwordReset: (id: string) => rateLimit(`pwreset:${id}`, { limit: 5, windowMs: 30 * MIN }),
  api: (id: string) => rateLimit(`api:${id}`, { limit: 120, windowMs: MIN }),
  upload: (id: string) => rateLimit(`upload:${id}`, { limit: 40, windowMs: 10 * MIN }),
  search: (id: string) => rateLimit(`search:${id}`, { limit: 60, windowMs: MIN }),
  view: (id: string) => rateLimit(`view:${id}`, { limit: 30, windowMs: MIN }),
  report: (id: string) => rateLimit(`report:${id}`, { limit: 10, windowMs: 30 * MIN }),
  usernameCheck: (id: string) => rateLimit(`uname:${id}`, { limit: 60, windowMs: MIN }),
};
