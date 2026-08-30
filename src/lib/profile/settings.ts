import { z } from "zod";
import { safeMediaUrl } from "@/lib/theme/types";

/**
 * Extended profile settings stored in ProfileSettings.config. The first-class
 * booleans (showViews, showBadges…) live as columns; richer, optional behavior
 * lives here so it can evolve without migrations.
 */
export const settingsConfigSchema = z.object({
  intro: z
    .object({
      enabled: z.boolean().default(false),
      text: z.string().max(60).default("click to enter"),
      buttonText: z.string().max(40).default("enter"),
      blur: z.number().min(0).max(40).default(16),
      playSound: z.boolean().default(false),
    })
    .default({}),
  audio: z
    .object({
      enabled: z.boolean().default(false),
      autoplay: z.boolean().default(false), // never forced without a gesture
      loop: z.boolean().default(true),
      volume: z.number().min(0).max(1).default(0.5),
      visualizer: z.boolean().default(false),
    })
    .default({}),
  effects: z
    .object({
      snow: z.boolean().default(false),
      confetti: z.boolean().default(false),
      vignette: z.boolean().default(true),
    })
    .default({}),
  clickImageUrl: safeMediaUrl.optional(),
});

export type ProfileSettingsConfig = z.infer<typeof settingsConfigSchema>;

export const DEFAULT_SETTINGS_CONFIG: ProfileSettingsConfig =
  settingsConfigSchema.parse({});

export function parseSettingsConfig(input: unknown): ProfileSettingsConfig {
  const r = settingsConfigSchema.safeParse(input);
  return r.success ? r.data : DEFAULT_SETTINGS_CONFIG;
}
