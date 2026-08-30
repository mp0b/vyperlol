import "server-only";
import IORedis, { type Redis } from "ioredis";
import { env } from "@/lib/env";

/**
 * Lazily-connected ioredis singleton. Returns null when Redis isn't configured
 * so callers can fall back (in-memory cache / rate-limit). Importing the driver
 * doesn't open a socket; we only construct a client on first use. Never throws.
 */
const globalForRedis = globalThis as unknown as { redis?: Redis | null };

export function getRedis(): Redis | null {
  if (globalForRedis.redis !== undefined) return globalForRedis.redis;

  const shouldUse =
    (env.RATE_LIMIT_DRIVER === "redis" || env.CACHE_DRIVER === "redis") &&
    Boolean(env.REDIS_URL);

  if (!shouldUse) {
    globalForRedis.redis = null;
    return null;
  }

  try {
    const client = new IORedis(env.REDIS_URL!, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    });
    client.on("error", () => {
      /* swallow; callers degrade gracefully */
    });
    globalForRedis.redis = client;
    return client;
  } catch {
    globalForRedis.redis = null;
    return null;
  }
}
