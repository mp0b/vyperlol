"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { isProd } from "@/lib/env";
import { profileUnlockCookie, profileUnlockToken } from "@/lib/profile/access";
import { ok, fail, type ActionResult } from "@/lib/action-result";

export async function unlockProfileAction(
  profileId: string,
  password: string,
): Promise<ActionResult> {
  const p = await db.profile.findUnique({
    where: { id: profileId },
    select: { passwordHash: true },
  });
  if (!p?.passwordHash) return fail("This profile isn't password protected.");

  const valid = await verifyPassword(password, p.passwordHash);
  if (!valid) return fail("Incorrect password.");

  const store = await cookies();
  store.set(profileUnlockCookie(profileId), profileUnlockToken(profileId), {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return ok(undefined);
}
