import { z } from "zod";

/**
 * Theme configuration — fully serializable to JSON, validated on every write.
 * Values here get inlined into the public profile as React style objects, so
 * every color/url is constrained to prevent injection or unwanted network
 * calls. The Zod schema is the single source of truth; DB stores the parsed
 * object in ProfileTheme.config.
 */

// A safe CSS color: hex, rgb(a)/hsl(a)/oklch/oklab (numeric args only), or a
// short whitelist of keywords. Rejects anything that could break out of a
// style value or trigger a fetch.
const CSS_COLOR_RE =
  /^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(rgb|rgba|hsl|hsla|oklch|oklab)\(\s*[0-9a-zA-Z.,%/\s-]+\)|transparent|currentColor|inherit|white|black)$/;

export const cssColor = z
  .string()
  .trim()
  .max(64)
  .refine((v) => CSS_COLOR_RE.test(v), { message: "Invalid color" });

// Only https (plus root-relative /i/... and blob for previews). No javascript:,
// data: (except handled separately for previews), or arbitrary schemes.
export const safeMediaUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) =>
      v === "" ||
      /^https:\/\//i.test(v) ||
      v.startsWith("/") ||
      v.startsWith("blob:"),
    { message: "URL must be https or an uploaded asset" },
  );

export const backgroundEffects = [
  "none",
  "particles",
  "stars",
  "snow",
  "matrix",
  "aurora",
  "gradient",
  "floating-particles",
  "scanlines",
  "noise",
  "grid",
  "dots",
  "waves",
  "glow",
  "vignette",
] as const;

export const gradientStopSchema = z.object({
  color: cssColor,
  at: z.number().min(0).max(100),
});

export const gradientSchema = z.object({
  type: z.enum(["linear", "radial"]),
  angle: z.number().min(0).max(360).default(135),
  stops: z.array(gradientStopSchema).min(2).max(6),
});

export const backgroundSchema = z.object({
  type: z.enum(["color", "gradient", "image", "video", "animated-gradient"]),
  color: cssColor.default("#0b0b12"),
  gradient: gradientSchema.optional(),
  imageUrl: safeMediaUrl.optional(),
  videoUrl: safeMediaUrl.optional(),
  blur: z.number().min(0).max(40).default(0),
  opacity: z.number().min(0).max(1).default(1),
  overlayColor: cssColor.optional(),
  overlayOpacity: z.number().min(0).max(1).default(0.35),
  effect: z.enum(backgroundEffects).default("none"),
  effectColor: cssColor.optional(),
  effectIntensity: z.number().min(0).max(1).default(0.5),
});

export const colorsSchema = z.object({
  accent: cssColor.default("#7c5cff"),
  text: cssColor.default("#f5f5fa"),
  textSecondary: cssColor.default("#a1a1b5"),
  icon: cssColor.default("#f5f5fa"),
});

export const typographySchema = z.object({
  fontFamily: z.string().trim().max(80).default("Inter"),
  source: z.enum(["system", "google", "custom"]).default("google"),
  fontUrl: safeMediaUrl.optional(),
  weight: z.number().int().min(100).max(900).default(500),
  letterSpacing: z.number().min(-2).max(10).default(0),
  lineHeight: z.number().min(0.8).max(2.5).default(1.5),
  transform: z
    .enum(["none", "uppercase", "lowercase", "capitalize"])
    .default("none"),
});

export const profileCardSchema = z.object({
  style: z
    .enum([
      "glass",
      "solid",
      "minimal",
      "floating",
      "transparent",
      "neon",
      "soft",
      "custom",
    ])
    .default("glass"),
  width: z.number().int().min(320).max(720).default(480),
  radius: z.number().min(0).max(48).default(20),
  opacity: z.number().min(0).max(1).default(1),
  blur: z.number().min(0).max(40).default(14),
  padding: z.number().min(8).max(64).default(28),
  background: cssColor.optional(),
  border: z.boolean().default(true),
  borderColor: cssColor.optional(),
  borderWidth: z.number().min(0).max(8).default(1),
  shadow: z.enum(["none", "sm", "md", "lg", "glow"]).default("lg"),
  glow: z.boolean().default(false),
  glowColor: cssColor.optional(),
  avatar: z
    .object({
      size: z.number().int().min(48).max(200).default(112),
      radius: z.number().min(0).max(100).default(100),
      ring: z.boolean().default(true),
      ringColor: cssColor.optional(),
      glow: z.boolean().default(false),
    })
    .default({}),
});

export const linksSchema = z.object({
  style: z
    .enum(["solid", "outline", "glass", "soft", "neon"])
    .default("glass"),
  radius: z.number().min(0).max(32).default(12),
  hoverAnimation: z
    .enum(["none", "lift", "glow", "scale", "slide"])
    .default("lift"),
  background: cssColor.optional(),
  textColor: cssColor.optional(),
});

export const effectsSchema = z.object({
  textEffect: z
    .enum([
      "none",
      "gradient",
      "glow",
      "shadow",
      "glitch",
      "rainbow",
      "shimmer",
      "pulse",
      "wave",
      "typewriter",
    ])
    .default("none"),
  cursor: z
    .enum(["default", "glow", "particles", "trail", "sparkles", "custom"])
    .default("default"),
  cursorImageUrl: safeMediaUrl.optional(),
  tilt: z.boolean().default(false),
  ripple: z.boolean().default(true),
  entrance: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
});

export const themeConfigSchema = z.object({
  background: backgroundSchema,
  colors: colorsSchema.default({}),
  typography: typographySchema.default({}),
  profileCard: profileCardSchema.default({}),
  links: linksSchema.default({}),
  effects: effectsSchema.default({}),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type BackgroundConfig = z.infer<typeof backgroundSchema>;
export type ProfileCardConfig = z.infer<typeof profileCardSchema>;

/** Default theme — the fallback whenever a profile has no saved theme. */
export const DEFAULT_THEME: ThemeConfig = themeConfigSchema.parse({
  background: {
    type: "animated-gradient",
    color: "#090908",
    gradient: {
      type: "linear",
      angle: 145,
      stops: [
        { color: "#090908", at: 0 },
        { color: "#241109", at: 56 },
        { color: "#120d0a", at: 100 },
      ],
    },
    overlayColor: "#000000",
    overlayOpacity: 0.42,
    effect: "vignette",
  },
  colors: { accent: "#ffad5c", text: "#fffaf2", textSecondary: "#c5b8ab", icon: "#fff4e4" },
  typography: { fontFamily: "DM Sans", source: "google", weight: 500 },
  profileCard: {
    style: "glass",
    width: 520,
    radius: 28,
    opacity: 0.94,
    blur: 24,
    padding: 34,
    border: true,
    borderColor: "rgba(255,235,209,.14)",
    shadow: "lg",
    glow: true,
    glowColor: "#ff9a3d",
    avatar: { ring: true, ringColor: "#ffb568", glow: true },
  },
  links: { style: "glass", radius: 16, hoverAnimation: "lift" },
  effects: { textEffect: "none", cursor: "default", ripple: true, entrance: true },
});

/**
 * Parse untrusted theme JSON, always returning a valid config. Unknown or
 * malformed input degrades to the default rather than throwing at render time.
 */
export function parseThemeConfig(input: unknown): ThemeConfig {
  const result = themeConfigSchema.safeParse(input);
  return result.success ? result.data : DEFAULT_THEME;
}
