import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { generateToken, sha256 } from "@/lib/crypto";
import { isProd } from "@/lib/env";

export const SESSION_COOKIE = "vyper_session";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_MS = 15 * 24 * 60 * 60 * 1000; // refresh when <15 days remain

export interface SessionContext {
  ipHash?: string | null;
  userAgent?: string | null;
  country?: string | null;
}

/** Create a DB-backed session; returns the raw token to store in the cookie. */
export async function createSession(userId: string, ctx: SessionContext = {}) {
  const token = generateToken();
  const id = sha256(token);
  const expiresAt = new Date(Date.now() + TTL_MS);
  await db.session.create({
    data: {
      id,
      userId,
      expiresAt,
      ipHash: ctx.ipHash ?? null,
      userAgent: ctx.userAgent?.slice(0, 400) ?? null,
      country: ctx.country ?? null,
    },
  });
  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function invalidateSession(sessionId: string) {
  await db.session.deleteMany({ where: { id: sessionId } });
}

export async function invalidateUserSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}

/** Log the user in end-to-end: create session + set cookie. */
export async function startSession(userId: string, ctx: SessionContext = {}) {
  const { token, expiresAt } = await createSession(userId, ctx);
  await setSessionCookie(token, expiresAt);
  return { token, expiresAt };
}

async function readSession(): Promise<{ user: User; sessionId: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const id = sha256(token);
  const session = await db.session.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await invalidateSession(id);
    return null;
  }

  const { user } = session;
  if (user.status === "BANNED" || user.status === "DELETED" || user.deletedAt) {
    await invalidateSession(id);
    return null;
  }

  // Sliding expiration: extend when close to expiry.
  if (session.expiresAt.getTime() - Date.now() < REFRESH_MS) {
    const expiresAt = new Date(Date.now() + TTL_MS);
    await db.session.update({
      where: { id },
      data: { expiresAt, lastUsedAt: new Date() },
    });
    // Best-effort cookie refresh; setting cookies is a no-op in RSC render.
    try {
      await setSessionCookie(token, expiresAt);
    } catch {
      /* not in a mutable context — will refresh on next action */
    }
  }

  return { user, sessionId: id };
}

/**
 * Memoized per request. Returns the authenticated user + session id, or null.
 */
export const getAuth = cache(readSession);

export async function getCurrentUser(): Promise<User | null> {
  const auth = await getAuth();
  return auth?.user ?? null;
}
