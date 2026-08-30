import { z } from "zod";
import { themeConfigSchema, safeMediaUrl } from "@/lib/theme/types";
import { settingsConfigSchema } from "@/lib/profile/settings";
import { linkStyleSchema } from "@/lib/profile/link-style";
import { getSocialProvider } from "@/lib/providers/social";
import { PROFILE_TAGS } from "@/lib/constants";

const httpUrl = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((v) => /^https?:\/\//i.test(v), "Must be a valid http(s) URL");

const socialUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\//i.test(v) || /^mailto:/i.test(v), "Invalid URL");

export const editorProfileSchema = z.object({
  displayName: z.string().max(60),
  bio: z.string().max(1000),
  location: z.string().max(80),
  statusText: z.string().max(100),
  statusEmoji: z.string().max(16),
  pronouns: z.string().max(40),
  occupation: z.string().max(60),
  avatarUrl: safeMediaUrl,
  bannerUrl: safeMediaUrl,
  tags: z.array(z.enum(PROFILE_TAGS)).max(5),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE", "PASSWORD"]),
  isPublished: z.boolean(),
  seoTitle: z.string().max(70),
  seoDescription: z.string().max(200),
});

export const editorSocialSchema = z.object({
  id: z.string(),
  provider: z.string().refine((p) => Boolean(getSocialProvider(p)), "Unknown provider"),
  username: z.string().max(120).nullable(),
  url: socialUrl,
  label: z.string().max(60).nullable(),
  visible: z.boolean(),
});

export const editorLinkSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "Title required").max(80),
  description: z.string().max(200).nullable(),
  url: httpUrl,
  icon: z.string().max(40).nullable(),
  imageUrl: safeMediaUrl.nullable(),
  style: linkStyleSchema,
  visibility: z.enum(["PUBLIC", "AUTHENTICATED", "SCHEDULED", "HIDDEN"]),
});

export const editorSectionSchema = z.object({
  id: z.string(),
  type: z.enum([
    "ABOUT", "SOCIALS", "LINKS", "PROJECTS", "GALLERY", "MUSIC", "GAMES", "ANIME",
    "MOVIES", "SKILLS", "CUSTOM_TEXT", "WIDGETS", "DISCORD", "GITHUB", "YOUTUBE",
    "TWITCH", "SPOTIFY", "STEAM",
  ]),
  title: z.string().max(60).nullable(),
  visible: z.boolean(),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const editorDraftSchema = z.object({
  profile: editorProfileSchema,
  theme: themeConfigSchema,
  settings: z.object({
    showViews: z.boolean(),
    showBadges: z.boolean(),
    showFollowerCount: z.boolean(),
    animationsEnabled: z.boolean(),
    config: settingsConfigSchema,
  }),
  socials: z.array(editorSocialSchema).max(50),
  links: z.array(editorLinkSchema).max(100),
  sections: z.array(editorSectionSchema).max(40),
});

export type EditorDraftInput = z.infer<typeof editorDraftSchema>;
