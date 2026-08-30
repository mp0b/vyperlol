"use client";

import { useEffect, useState } from "react";
import { Clock, Eye, Github, Gamepad2, Users } from "lucide-react";
import type { RenderWidget, RenderProject } from "@/lib/profile/types";
import { SocialIcon } from "@/components/icons/social-icon";

interface WidgetContext {
  viewCount: number;
  latestProject?: RenderProject | null;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const num = (v: unknown): number | null => (typeof v === "number" ? v : null);

/** Frame wrapper for embed/card widgets. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid color-mix(in srgb, #fff 8%, transparent)",
        background: "color-mix(in srgb, #fff 5%, transparent)",
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Frame>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
        <div style={{ color: "var(--vy-accent)" }}>{icon}</div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{label}</div>
        </div>
      </div>
    </Frame>
  );
}

function LinkCardMini({
  slug,
  label,
  sub,
  href,
}: {
  slug: string;
  label: string;
  sub: string;
  href: string;
}) {
  return (
    <Frame>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow ugc"
        style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, textDecoration: "none", color: "inherit" }}
      >
        <SocialIcon slug={slug} size={26} />
        <div style={{ textAlign: "left", minWidth: 0 }}>
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: "0.76rem", opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>
        </div>
      </a>
    </Frame>
  );
}

function LiveClock({ tz }: { tz: string }) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      try {
        setNow(
          new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: tz || undefined,
          }).format(new Date()),
        );
      } catch {
        setNow(new Date().toLocaleTimeString());
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tz]);
  return <StatCard icon={<Clock size={22} />} label={tz || "Local time"} value={now || "--:--:--"} />;
}

function Countdown({ target, label }: { target: string; label: string }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (isNaN(end)) return setLeft("—");
      if (diff <= 0) return setLeft("Done");
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return <StatCard icon={<Clock size={22} />} label={label || "Countdown"} value={left || "—"} />;
}

function IframeEmbed({ src, height = 152, title }: { src: string; height?: number; title: string }) {
  return (
    <Frame>
      <iframe
        src={src}
        title={title}
        width="100%"
        height={height}
        style={{ border: 0, display: "block" }}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </Frame>
  );
}

function spotifyEmbed(input: string): string | null {
  const m = input.match(/(?:open\.spotify\.com\/|spotify:)(track|album|playlist|artist)[/:]([a-zA-Z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
}

export function WidgetCard({ widget, context }: { widget: RenderWidget; context: WidgetContext }) {
  const c = widget.config;

  switch (widget.type) {
    case "PROFILE_VIEWS":
      return <StatCard icon={<Eye size={22} />} label="Profile views" value={context.viewCount.toLocaleString()} />;
    case "VISITOR_COUNT":
      return <StatCard icon={<Users size={22} />} label="Visitors" value={context.viewCount.toLocaleString()} />;
    case "CLOCK":
      return <LiveClock tz={str(c.timezone)} />;
    case "COUNTDOWN":
      return <Countdown target={str(c.target)} label={str(c.label)} />;
    case "LATEST_PROJECT": {
      const p = context.latestProject;
      if (!p) return null;
      return (
        <Frame>
          <div style={{ padding: 14, textAlign: "left" }}>
            <div style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.12em" }}>Latest project</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{p.title}</div>
            {p.description ? <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>{p.description}</div> : null}
          </div>
        </Frame>
      );
    }
    case "YOUTUBE": {
      const id = str(c.videoId).match(/^[a-zA-Z0-9_-]{6,15}$/)?.[0];
      if (!id) {
        const u = str(c.username || c.channel);
        return u ? <LinkCardMini slug="youtube" label="YouTube" sub={`@${u}`} href={`https://youtube.com/@${u}`} /> : null;
      }
      return <IframeEmbed src={`https://www.youtube-nocookie.com/embed/${id}`} height={190} title="YouTube" />;
    }
    case "SPOTIFY": {
      const embed = spotifyEmbed(str(c.url || c.uri));
      return embed ? <IframeEmbed src={embed} height={152} title="Spotify" /> : null;
    }
    case "TWITCH": {
      const channel = str(c.channel).match(/^[a-zA-Z0-9_]{3,25}$/)?.[0];
      if (!channel) return null;
      const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
      return <IframeEmbed src={`https://player.twitch.tv/?channel=${channel}&parent=${host}&muted=true`} height={190} title="Twitch" />;
    }
    case "DISCORD": {
      const serverId = str(c.serverId).match(/^\d{5,25}$/)?.[0];
      if (serverId) return <IframeEmbed src={`https://discord.com/widget?id=${serverId}&theme=dark`} height={320} title="Discord" />;
      const invite = str(c.invite);
      return invite ? <LinkCardMini slug="discord" label="Discord" sub={invite} href={/^https?:/.test(invite) ? invite : `https://discord.gg/${invite}`} /> : null;
    }
    case "GITHUB": {
      const u = str(c.username);
      return u ? <LinkCardMini slug="github" label="GitHub" sub={`@${u}`} href={`https://github.com/${u}`} /> : null;
    }
    case "STEAM": {
      const u = str(c.profileUrl || c.username);
      if (!u) return null;
      const href = /^https?:/.test(u) ? u : `https://steamcommunity.com/id/${u}`;
      return <LinkCardMini slug="steam" label="Steam" sub={u} href={href} />;
    }
    case "ROBLOX": {
      const u = str(c.profileUrl || c.userId);
      if (!u) return null;
      const href = /^https?:/.test(u) ? u : `https://www.roblox.com/users/${u}/profile`;
      return <LinkCardMini slug="roblox" label="Roblox" sub={u} href={href} />;
    }
    case "CUSTOM_HTML": {
      // Sandboxed iframe with scripts disabled — user HTML never touches the
      // main document and no JS executes.
      const html = str(c.html).slice(0, 5000);
      if (!html) return null;
      return (
        <Frame>
          <iframe
            title="Custom"
            sandbox=""
            srcDoc={`<!doctype html><meta name="viewport" content="width=device-width"><style>body{margin:0;font-family:sans-serif;color:#eee;background:transparent;padding:12px}</style>${html}`}
            width="100%"
            height={Number(num(c.height)) || 160}
            style={{ border: 0, display: "block" }}
          />
        </Frame>
      );
    }
    default:
      return null;
  }
}
