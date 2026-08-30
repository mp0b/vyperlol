import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const ACTIVE_COOKIE = "vy_active_profile";

export interface ProfileSummary {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isDefault: boolean;
  isPublished: boolean;
}

export async function getUserProfiles(userId: string): Promise<ProfileSummary[]> {
  return db.profile.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, username: true, displayName: true, avatarUrl: true, isDefault: true, isPublished: true },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

/** The profile the dashboard is currently editing (cookie → default → first). */
export async function getActiveProfile(userId: string): Promise<ProfileSummary | null> {
  const profiles = await getUserProfiles(userId);
  if (profiles.length === 0) return null;
  const store = await cookies();
  const cookieId = store.get(ACTIVE_COOKIE)?.value;
  return (
    profiles.find((p) => p.id === cookieId) ??
    profiles.find((p) => p.isDefault) ??
    profiles[0]
  );
}

export { ACTIVE_COOKIE };
