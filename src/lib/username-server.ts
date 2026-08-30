import "server-only";
import { db } from "@/lib/db";
import { normalizeUsername, isReservedUsername } from "@/lib/username";
import { slugify } from "@/lib/utils";

/** True when a username is free (not reserved, not a profile, not an alias). */
export async function isUsernameAvailable(input: string): Promise<boolean> {
  const username = normalizeUsername(input);
  if (isReservedUsername(username)) return false;
  const [profile, alias] = await Promise.all([
    db.profile.findUnique({ where: { username }, select: { id: true } }),
    db.alias.findUnique({ where: { alias: username }, select: { id: true } }),
  ]);
  return !profile && !alias;
}

/** True when an alias is free (same namespace as usernames). */
export async function isAliasAvailable(input: string): Promise<boolean> {
  return isUsernameAvailable(input);
}

/**
 * Derive a unique, valid username from an arbitrary base (e.g. an OAuth handle),
 * appending a numeric suffix until it's free.
 */
export async function generateUniqueUsername(base: string): Promise<string> {
  let root = slugify(base).replace(/-/g, "").slice(0, 24) || "user";
  if (root.length < 2) root = `user${root}`;

  if (!isReservedUsername(root) && (await isUsernameAvailable(root))) return root;

  for (let i = 0; i < 10000; i++) {
    const candidate = `${root}${Math.floor(1 + Math.random() * 998)}`.slice(0, 32);
    if (!isReservedUsername(candidate) && (await isUsernameAvailable(candidate))) {
      return candidate;
    }
  }
  // Extremely unlikely fallback.
  return `user${Date.now().toString(36)}`;
}
