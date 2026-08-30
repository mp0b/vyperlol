import type { CSSProperties } from "react";
import type { ThemeConfig } from "@/lib/theme/types";
import { BackgroundFx } from "./background-fx";

const CSS_EFFECTS = new Set(["grid", "dots", "scanlines", "noise", "aurora", "waves", "vignette"]);
const CANVAS_EFFECTS = new Set(["particles", "floating-particles", "stars", "snow", "matrix", "glow"]);

export function ProfileBackground({
  theme,
  animationsEnabled,
  preview = false,
}: {
  theme: ThemeConfig;
  animationsEnabled: boolean;
  preview?: boolean;
}) {
  const bg = theme.background;
  const effectColor = bg.effectColor ?? theme.colors.accent;
  const imageStyle: CSSProperties | undefined =
    bg.type === "image" && bg.imageUrl ? { backgroundImage: `url(${bg.imageUrl})` } : undefined;

  return (
    <>
      {bg.type === "video" && bg.videoUrl ? (
        <video className="vy-bg-video" autoPlay muted loop playsInline src={bg.videoUrl} aria-hidden />
      ) : (
        <div
          className="vy-bg"
          data-animated={bg.type === "animated-gradient" && animationsEnabled}
          data-image={bg.type === "image"}
          style={imageStyle}
          aria-hidden
        />
      )}
      <div className="vy-bg-overlay" aria-hidden />
      {CSS_EFFECTS.has(bg.effect) && (
        <div
          className="vy-fx"
          data-effect={bg.effect}
          aria-hidden
          style={
            {
              "--vy-fx-color": effectColor,
              "--vy-fx-intensity": String(bg.effectIntensity),
            } as CSSProperties
          }
        />
      )}
      {!preview && animationsEnabled && CANVAS_EFFECTS.has(bg.effect) && (
        <BackgroundFx
          effect={bg.effect as "particles"}
          color={effectColor}
          intensity={bg.effectIntensity}
        />
      )}
    </>
  );
}
