import "server-only";
import { redirect } from "next/navigation";
import type { User, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

const ROLE_RANK: Record<UserRole, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function hasRole(user: Pick<User, "role">, min: UserRole): boolean {
  return ROLE_RANK[user.role] >= ROLE_RANK[min];
}

export function isStaff(user: Pick<User, "role">): boolean {
  return hasRole(user, "MODERATOR");
}

/** Require an authenticated user or redirect to login. */
export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  return user;
}

/** Require a minimum role or redirect (login if anonymous, home if under-privileged). */
export async function requireRole(min: UserRole): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasRole(user, min)) redirect("/dashboard");
  return user;
}
