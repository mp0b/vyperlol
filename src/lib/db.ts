import "server-only";
import { PrismaClient } from "@prisma/client";
import { isProd } from "@/lib/env";

/**
 * Prisma client singleton — a fresh client per module reload in dev would
 * exhaust the connection pool, so we cache it on `globalThis`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ["error"] : ["error", "warn"],
  });

if (!isProd) globalForPrisma.prisma = db;

export type { Prisma } from "@prisma/client";
