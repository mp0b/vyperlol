import {
  RESERVED_USERNAMES,
  USERNAME_MAX,
  USERNAME_MIN,
  USERNAME_REGEX,
} from "@/lib/constants";

/** Client-safe username helpers (no DB, no server-only). */

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export type UsernameCheck = { ok: true } | { ok: false; reason: string };

export function validateUsernameFormat(input: string): UsernameCheck {
  const u = normalizeUsername(input);
  if (u.length < USERNAME_MIN) {
    return { ok: false, reason: `At least ${USERNAME_MIN} characters.` };
  }
  if (u.length > USERNAME_MAX) {
    return { ok: false, reason: `At most ${USERNAME_MAX} characters.` };
  }
  if (!USERNAME_REGEX.test(u)) {
    return {
      ok: false,
      reason: "Use letters, numbers, _ or - (must start and end with a letter or number).",
    };
  }
  if (RESERVED_USERNAMES.has(u)) {
    return { ok: false, reason: "That username is reserved." };
  }
  return { ok: true };
}

export function isReservedUsername(input: string): boolean {
  return RESERVED_USERNAMES.has(normalizeUsername(input));
}
