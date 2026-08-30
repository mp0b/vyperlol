"use client";

import { useEffect, useRef } from "react";

type FxKind = "particles" | "floating-particles" | "stars" | "snow" | "matrix" | "glow";

/**
 * Canvas-based background effects. Caps particle counts, honors
 * prefers-reduced-motion, and tears down cleanly on unmount / tab hide to keep
 * CPU/GPU usage sane on the public profile.
 */
export function BackgroundFx({
  effect,
  color,
  intensity = 0.5,
}: {
  effect: FxKind;
  color: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const density = 0.4 + intensity * 0.9;
    const count = Math.min(Math.round((w * h) / 14000 * density), 180);

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    let particles: P[] = [];
    const glyphs = "アイウエオカキクケコ01<>/*".split("");
    const columns: number[] = [];

    const init = () => {
      particles = [];
      if (effect === "matrix") {
        const cols = Math.floor(w / 14);
        columns.length = 0;
        for (let i = 0; i < cols; i++) columns[i] = Math.random() * h;
      } else {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: rand(0, w),
            y: rand(0, h),
            vx: rand(-0.25, 0.25),
            vy: effect === "snow" ? rand(0.3, 1.1) : rand(-0.35, 0.35),
            r: effect === "stars" ? rand(0.4, 1.4) : rand(1, 2.6),
            a: rand(0.2, 0.9),
          });
        }
      }
    };
    init();

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      if (effect === "matrix") {
        ctx.fillStyle = color;
        ctx.font = "13px monospace";
        for (let i = 0; i < columns.length; i++) {
          const text = glyphs[Math.floor(Math.random() * glyphs.length)];
          const x = i * 14;
          const y = columns[i];
          ctx.globalAlpha = 0.85;
          ctx.fillText(text, x, y);
          columns[i] = y > h + Math.random() * 400 ? 0 : y + 14;
        }
        ctx.globalAlpha = 1;
      } else {
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (effect === "stars") p.a += rand(-0.03, 0.03);
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = effect === "snow" ? 0 : h;
          if (p.y > h) p.y = effect === "snow" ? 0 : 0;
          ctx.beginPath();
          ctx.globalAlpha = Math.max(0.1, Math.min(1, p.a));
          ctx.fillStyle = effect === "snow" ? "#ffffff" : color;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [effect, color, intensity]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -18,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
