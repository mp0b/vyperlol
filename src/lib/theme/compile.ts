import type { CSSProperties } from "react";
import type { ThemeConfig } from "./types";

/**
 * Turn a validated ThemeConfig into the CSS custom properties consumed by the
 * static `profile.css` rules. Keeping the profile visuals in a stylesheet
 * (driven by these vars) means the public page ships almost no styling JS.
 */

function shadowValue(
  shadow: ThemeConfig["profileCard"]["shadow"],
  glow: boolean,
  glowColor: string,
): string {
  const base =
    shadow === "none"
      ? "none"
      : shadow === "sm"
        ? "0 2px 10px rgba(0,0,0,.25)"
        : shadow === "md"
          ? "0 10px 30px rgba(0,0,0,.35)"
          : shadow === "lg"
            ? "0 24px 70px rgba(0,0,0,.5)"
            : `0 0 46px ${glowColor}`;
  if (glow && shadow !== "glow") {
    return base === "none" ? `0 0 46px ${glowColor}` : `${base}, 0 0 46px ${glowColor}`;
  }
  return base;
}

function resolveCard(card: ThemeConfig["profileCard"], accent: string) {
  const glowColor = card.glowColor ?? accent;
  let bg: string;
  let border: string;
  let blur = card.blur;

  switch (card.style) {
    case "solid":
      bg = card.background ?? "#050505";
      blur = 0;
      border = card.border ? `1px solid ${card.borderColor ?? "rgba(255,255,255,.05)"}` : "none";
      break;
    case "minimal":
      bg = "transparent";
      blur = 0;
      border = card.border ? `1px solid ${card.borderColor ?? "rgba(255,255,255,.1)"}` : "none";
      break;
    case "transparent":
      bg = "transparent";
      blur = 0;
      border = "none";
      break;
    case "floating":
      bg = card.background ?? "color-mix(in srgb, #000000 80%, transparent)";
      border = card.border ? `1px solid ${card.borderColor ?? "rgba(255,255,255,.05)"}` : "none";
      break;
    case "neon":
      bg = card.background ?? "color-mix(in srgb, #050505 85%, transparent)";
      border = `${card.borderWidth}px solid ${card.borderColor ?? accent}`;
      break;
    case "soft":
      bg = card.background ?? "color-mix(in srgb, #0a0a0a 40%, transparent)";
      border = card.border ? `1px solid ${card.borderColor ?? "rgba(255,255,255,.04)"}` : "none";
      break;
    case "custom":
      bg = card.background ?? "color-mix(in srgb, #000000 70%, transparent)";
      border = card.border
        ? `${card.borderWidth}px solid ${card.borderColor ?? "rgba(255,255,255,.1)"}`
        : "none";
      break;
    case "glass":
    default:
      bg = `color-mix(in srgb, #000000 ${Math.round(card.opacity * 60)}%, transparent)`;
      border = card.border ? `1px solid ${card.borderColor ?? "rgba(255,255,255,.1)"}` : "none";
      break;
  }

  return {
    bg,
    border,
    blur,
    shadow: shadowValue(card.shadow, card.glow, glowColor),
  };
}

export interface CompiledTheme {
  vars: CSSProperties;
  fontFamily: string;
  googleFontHref: string | null;
  customFontUrl: string | null;
  backgroundEffect: ThemeConfig["background"]["effect"];
  cardStyle: ThemeConfig["profileCard"]["style"];
  linkStyle: ThemeConfig["links"]["style"];
}

function backgroundLayer(bg: ThemeConfig["background"]): string {
  if (bg.type === "gradient" || bg.type === "animated-gradient") {
    const g = bg.gradient;
    if (g) {
      const stops = g.stops
        .slice()
        .sort((a, b) => a.at - b.at)
        .map((s) => `${s.color} ${s.at}%`)
        .join(", ");
      return g.type === "radial"
        ? `radial-gradient(circle at 50% 30%, ${stops})`
        : `linear-gradient(${g.angle}deg, ${stops})`;
    }
  }
  return bg.color;
}

export function compileTheme(theme: ThemeConfig): CompiledTheme {
  const card = resolveCard(theme.profileCard, theme.colors.accent);
  const bgLayer = backgroundLayer(theme.background);

  const googleFontHref =
    theme.typography.source === "google" && theme.typography.fontFamily
      ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
          theme.typography.fontFamily,
        ).replace(/%20/g, "+")}:wght@300;400;500;600;700;800&display=swap`
      : null;

  const fontFamily =
    theme.typography.source === "system"
      ? "ui-sans-serif, system-ui, sans-serif"
      : `"${theme.typography.fontFamily}", ui-sans-serif, system-ui, sans-serif`;

  const vars: CSSProperties & Record<string, string> = {
    "--vy-bg-base": theme.background.color,
    "--vy-bg-layer": bgLayer,
    "--vy-bg-blur": `${theme.background.blur}px`,
    "--vy-bg-opacity": String(theme.background.opacity),
    "--vy-overlay": theme.background.overlayColor
      ? `color-mix(in srgb, ${theme.background.overlayColor} ${Math.round(
          theme.background.overlayOpacity * 100,
        )}%, transparent)`
      : "transparent",
    "--vy-accent": theme.colors.accent,
    "--vy-text": theme.colors.text,
    "--vy-text-2": theme.colors.textSecondary,
    "--vy-icon": theme.colors.icon,
    "--vy-font": fontFamily,
    "--vy-weight": String(theme.typography.weight),
    "--vy-tracking": `${theme.typography.letterSpacing}px`,
    "--vy-leading": String(theme.typography.lineHeight),
    "--vy-transform": theme.typography.transform,
    "--vy-card-bg": card.bg,
    "--vy-card-border": card.border,
    "--vy-card-radius": `${theme.profileCard.radius}px`,
    "--vy-card-blur": `${card.blur}px`,
    "--vy-card-shadow": card.shadow,
    "--vy-card-padding": `${theme.profileCard.padding}px`,
    "--vy-card-width": `${theme.profileCard.width}px`,
    "--vy-avatar-size": `${theme.profileCard.avatar.size}px`,
    "--vy-avatar-radius": `${theme.profileCard.avatar.radius}%`,
    "--vy-ring-color": theme.profileCard.avatar.ringColor ?? theme.colors.accent,
    "--vy-link-radius": `${theme.links.radius}px`,
    "--vy-link-bg": theme.links.background ?? "rgba(255, 255, 255, 0.05)",
    "--vy-link-text": theme.links.textColor ?? theme.colors.text,
  };

  return {
    vars,
    fontFamily,
    googleFontHref,
    customFontUrl: theme.typography.source === "custom" ? theme.typography.fontUrl ?? null : null,
    backgroundEffect: theme.background.effect,
    cardStyle: theme.profileCard.style,
    linkStyle: theme.links.style,
  };
}
