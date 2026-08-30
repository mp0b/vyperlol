"use client";

import { useEffect, useRef } from "react";

type CursorKind = "glow" | "particles" | "trail" | "sparkles" | "custom";

/** Lightweight custom cursor effects. Disabled on touch and reduced-motion. */
export function CursorFx({
  kind,
  color,
  imageUrl,
}: {
  kind: CursorKind;
  color: string;
  imageUrl?: string | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Simple following element for glow / custom image.
    if (kind === "glow" || kind === "custom") {
      const el = dotRef.current;
      if (!el) return;
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      let tx = x;
      let ty = y;
      let raf = 0;
      const move = (e: MouseEvent) => {
        tx = e.clientX;
        ty = e.clientY;
      };
      const loop = () => {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        el.style.transform = `translate(${x}px, ${y}px)`;
        raf = requestAnimationFrame(loop);
      };
      window.addEventListener("mousemove", move);
      raf = requestAnimationFrame(loop);
      return () => {
        window.removeEventListener("mousemove", move);
        cancelAnimationFrame(raf);
      };
    }

    // Canvas particle trail for trail / particles / sparkles.
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number; life: number; r: number };
    const parts: P[] = [];
    const spawn = (x: number, y: number) => {
      const n = kind === "sparkles" ? 3 : 1;
      for (let i = 0; i < n; i++) {
        parts.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (kind === "sparkles" ? 2.5 : 0.6),
          vy: (Math.random() - 0.5) * (kind === "sparkles" ? 2.5 : 0.6) + 0.3,
          life: 1,
          r: kind === "trail" ? 5 : 2.5,
        });
      }
      if (parts.length > 260) parts.splice(0, parts.length - 260);
    };
    const move = (e: MouseEvent) => spawn(e.clientX, e.clientY);
    window.addEventListener("mousemove", move);

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [kind, color, imageUrl]);

  if (kind === "glow") {
    return (
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 26,
          height: 26,
          marginLeft: -13,
          marginTop: -13,
          borderRadius: "50%",
          background: color,
          filter: "blur(6px)",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 60,
        }}
      />
    );
  }
  if (kind === "custom" && imageUrl) {
    return (
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          marginLeft: -16,
          marginTop: -16,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
          zIndex: 60,
        }}
      />
    );
  }
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60 }}
    />
  );
}
