import "server-only";
import { hmac } from "@/lib/crypto";
import { env } from "@/lib/env";

/** Cookie + unforgeable token used to remember a password-gate unlock. */
export const profileUnlockCookie = (profileId: string) => `vy_pp_${profileId}`;
export const profileUnlockToken = (profileId: string) => hmac(`pp:${profileId}`, env.AUTH_SECRET);
