"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { createProfileForUser } from "@/lib/profile/create";
import { isUsernameAvailable } from "@/lib/username-server";
import { validateUsernameFormat, normalizeUsername } from "@/lib/username";
import { ACTIVE_COOKIE } from "@/lib/dashboard/active-profile";
import { ok, fail, type ActionResult } from "@/lib/action-result";

export async function setActiveProfileAction(profileId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.");
  const profile = await db.profile.findFirst({
    where: { id: profileId, userId: user.id, deletedAt: null },
    select: { id: true },
  });
  if (!profile) return fail("Profile not found.");
  const store = await cookies();
  store.set(ACTIVE_COOKIE, profileId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return ok(undefined);
}

const MAX_PROFILES = 3;

export async function createProfileAction(
  usernameInput: string,
): Promise<ActionResult<{ username: string }>> {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.");

  const fmt = validateUsernameFormat(usernameInput);
  if (!fmt.ok) return fail(fmt.reason);

  const count = await db.profile.count({ where: { userId: user.id, deletedAt: null } });
  if (count >= MAX_PROFILES) return fail(`You can have at most ${MAX_PROFILES} profiles.`);

  if (!(await isUsernameAvailable(usernameInput))) return fail("That username is taken.");

  const profile = await createProfileForUser(user.id, usernameInput, { makeDefault: count === 0 });

  const store = await cookies();
  store.set(ACTIVE_COOKIE, profile.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });

  return ok({ username: normalizeUsername(usernameInput) });
}
