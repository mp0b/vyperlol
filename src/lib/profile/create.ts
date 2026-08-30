import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { DEFAULT_THEME } from "@/lib/theme/types";
import { getPreset } from "@/lib/theme/presets";
import { normalizeUsername } from "@/lib/username";

interface CreateProfileOptions {
  displayName?: string | null;
  avatarUrl?: string | null;
  makeDefault?: boolean;
  themePreset?: string;
}

/**
 * Create a fully-formed profile: theme, settings, and a starter set of sections
 * so a new user lands on something real, not an empty shell.
 */
export async function createProfileForUser(
  userId: string,
  usernameInput: string,
  opts: CreateProfileOptions = {},
) {
  const username = normalizeUsername(usernameInput);
  const existingCount = await db.profile.count({ where: { userId } });
  const makeDefault = opts.makeDefault ?? existingCount === 0;

  const preset = opts.themePreset ? getPreset(opts.themePreset) : undefined;
  const themeConfig = preset?.config ?? DEFAULT_THEME;

  return db.profile.create({
    data: {
      userId,
      username,
      displayName: opts.displayName ?? null,
      avatarUrl: opts.avatarUrl ?? null,
      isDefault: makeDefault,
      theme: {
        create: {
          preset: preset?.id ?? null,
          config: themeConfig as unknown as Prisma.InputJsonValue,
        },
      },
      settings: { create: {} },
      sections: {
        create: [
          { type: "ABOUT", position: 0 },
          { type: "SOCIALS", position: 1 },
          { type: "LINKS", position: 2 },
        ],
      },
    },
    include: { theme: true, settings: true, sections: true },
  });
}
