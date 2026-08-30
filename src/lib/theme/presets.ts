import { themeConfigSchema, type ThemeConfig } from "./types";

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
}

// Each preset supplies just the meaningful fields; Zod fills the rest with
// sensible defaults so presets stay readable and future-proof.
function make(config: unknown): ThemeConfig {
  return themeConfigSchema.parse(config);
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "solar",
    name: "Solar",
    description: "Obsidian, amber and a warm studio glow.",
    config: make({
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
      profileCard: { style: "glass", width: 520, radius: 28, opacity: 0.94, blur: 24, padding: 34, border: true, borderColor: "rgba(255,235,209,.14)", shadow: "lg", glow: true, glowColor: "#ff9a3d", avatar: { ring: true, ringColor: "#ffb568", glow: true } },
      links: { style: "glass", radius: 16, hoverAnimation: "lift" },
      effects: { cursor: "default", ripple: true, entrance: true },
    }),
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep indigo gradient with an electric violet glow.",
    config: make({
      background: {
        type: "animated-gradient",
        gradient: {
          type: "linear",
          angle: 145,
          stops: [
            { color: "#0a0a14", at: 0 },
            { color: "#1a1633", at: 60 },
            { color: "#241a4d", at: 100 },
          ],
        },
      },
      colors: { accent: "#7c5cff", text: "#f4f2ff", textSecondary: "#a6a1c9" },
      profileCard: { style: "glass", glow: true, glowColor: "#7c5cff", avatar: { glow: true } },
      links: { style: "glass", hoverAnimation: "glow" },
      effects: { textEffect: "none", cursor: "glow" },
    }),
  },
  {
    id: "neon",
    name: "Neon",
    description: "Jet black with hot-pink and cyan neon edges.",
    config: make({
      background: { type: "color", color: "#05050a", effect: "floating-particles", effectColor: "#ff2e97" },
      colors: { accent: "#ff2e97", text: "#ffffff", textSecondary: "#8be9fd", icon: "#8be9fd" },
      profileCard: {
        style: "neon",
        border: true,
        borderColor: "#ff2e97",
        glow: true,
        glowColor: "#ff2e97",
        avatar: { ring: true, ringColor: "#8be9fd", glow: true },
      },
      links: { style: "neon", hoverAnimation: "glow" },
      effects: { textEffect: "glow", cursor: "sparkles", tilt: true },
    }),
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Quiet, high-contrast, no distractions.",
    config: make({
      background: { type: "color", color: "#0d0d0f" },
      colors: { accent: "#ededed", text: "#fafafa", textSecondary: "#8a8a8a", icon: "#fafafa" },
      profileCard: { style: "minimal", border: false, shadow: "none", blur: 0 },
      links: { style: "outline", hoverAnimation: "lift" },
      effects: { textEffect: "none", cursor: "default", ripple: false, entrance: false },
    }),
  },
  {
    id: "glass",
    name: "Glass",
    description: "Frosted panels over a soft aurora wash.",
    config: make({
      background: {
        type: "animated-gradient",
        gradient: {
          type: "radial",
          angle: 0,
          stops: [
            { color: "#12223a", at: 0 },
            { color: "#0a0f1a", at: 100 },
          ],
        },
        effect: "aurora",
        effectColor: "#4dd6ff",
      },
      colors: { accent: "#5eead4", text: "#f0fdfa", textSecondary: "#99b7c4" },
      profileCard: { style: "glass", blur: 22, opacity: 0.85, avatar: { ring: true } },
      links: { style: "glass", hoverAnimation: "lift" },
      effects: { cursor: "trail" },
    }),
  },
  {
    id: "cyber",
    name: "Cyber",
    description: "Terminal grid, scanlines, acid green.",
    config: make({
      background: { type: "color", color: "#02040a", effect: "grid", effectColor: "#00ff9c" },
      colors: { accent: "#00ff9c", text: "#d7ffe9", textSecondary: "#5f8f7a", icon: "#00ff9c" },
      typography: { fontFamily: "JetBrains Mono", source: "google", letterSpacing: 0.5 },
      profileCard: { style: "custom", background: "#05100b", border: true, borderColor: "#00ff9c", radius: 6 },
      links: { style: "outline", radius: 4, hoverAnimation: "slide" },
      effects: { textEffect: "glitch", cursor: "default" },
    }),
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Northern-lights ribbons over deep space.",
    config: make({
      background: {
        type: "animated-gradient",
        gradient: {
          type: "linear",
          angle: 160,
          stops: [
            { color: "#04070f", at: 0 },
            { color: "#0b2540", at: 50 },
            { color: "#123d3a", at: 100 },
          ],
        },
        effect: "aurora",
        effectColor: "#66ffcc",
      },
      colors: { accent: "#7ef9c9", text: "#eafff7", textSecondary: "#93c7bb" },
      profileCard: { style: "glass", glow: true, glowColor: "#66ffcc" },
      links: { style: "glass", hoverAnimation: "glow" },
      effects: { textEffect: "shimmer", cursor: "particles" },
    }),
  },
  {
    id: "mono",
    name: "Mono",
    description: "Pure monochrome, editorial and sharp.",
    config: make({
      background: { type: "color", color: "#000000", effect: "noise", effectIntensity: 0.15 },
      colors: { accent: "#ffffff", text: "#ffffff", textSecondary: "#9a9a9a", icon: "#ffffff" },
      typography: { fontFamily: "Space Grotesk", source: "google", transform: "uppercase", letterSpacing: 1 },
      profileCard: { style: "minimal", border: true, borderColor: "#2a2a2a", radius: 2 },
      links: { style: "outline", radius: 2, hoverAnimation: "scale" },
      effects: { cursor: "default", ripple: false },
    }),
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm dusk gradient, soft and inviting.",
    config: make({
      background: {
        type: "animated-gradient",
        gradient: {
          type: "linear",
          angle: 160,
          stops: [
            { color: "#1a0b1e", at: 0 },
            { color: "#4a1533", at: 55 },
            { color: "#7a2a2a", at: 100 },
          ],
        },
      },
      colors: { accent: "#ff9d6c", text: "#fff3ec", textSecondary: "#d9a89a" },
      profileCard: { style: "soft", glow: true, glowColor: "#ff7e5f" },
      links: { style: "soft", hoverAnimation: "lift" },
      effects: { textEffect: "gradient", cursor: "glow" },
    }),
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool depths with drifting waves.",
    config: make({
      background: {
        type: "animated-gradient",
        gradient: {
          type: "linear",
          angle: 180,
          stops: [
            { color: "#03111f", at: 0 },
            { color: "#062a45", at: 100 },
          ],
        },
        effect: "waves",
        effectColor: "#38bdf8",
      },
      colors: { accent: "#38bdf8", text: "#e6f6ff", textSecondary: "#8fb8cc" },
      profileCard: { style: "glass", avatar: { ring: true, ringColor: "#38bdf8" } },
      links: { style: "glass", hoverAnimation: "lift" },
      effects: { cursor: "trail" },
    }),
  },
];

export function getPreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.id === id);
}
