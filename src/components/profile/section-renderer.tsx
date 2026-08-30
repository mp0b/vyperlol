import type { WidgetType } from "@prisma/client";
import type { RenderProfile, RenderSection } from "@/lib/profile/types";
import { renderMarkdown } from "@/lib/markdown";
import { LinkCard } from "./link-card";
import { SocialLinks } from "./social-links";
import { AudioPlayer } from "./audio-player";
import { WidgetCard } from "./widget-card";
import Link from "next/link";

interface FavItem {
  name: string;
  image?: string;
  note?: string;
}

function readItems(config: Record<string, unknown>): FavItem[] {
  const items = config.items;
  if (!Array.isArray(items)) return [];
  return items
    .map((it): FavItem | null => {
      if (typeof it === "string") return { name: it };
      if (it && typeof it === "object" && "name" in it) {
        const o = it as Record<string, unknown>;
        return {
          name: String(o.name ?? ""),
          image: typeof o.image === "string" ? o.image : undefined,
          note: typeof o.note === "string" ? o.note : undefined,
        };
      }
      return null;
    })
    .filter((x): x is FavItem => Boolean(x && x.name));
}

const SECTION_AS_WIDGET: Partial<Record<RenderSection["type"], WidgetType>> = {
  DISCORD: "DISCORD",
  GITHUB: "GITHUB",
  YOUTUBE: "YOUTUBE",
  TWITCH: "TWITCH",
  SPOTIFY: "SPOTIFY",
  STEAM: "STEAM",
};

export function SectionRenderer({
  section,
  profile,
}: {
  section: RenderSection;
  profile: RenderProfile;
}) {
  const config = section.config ?? {};
  const title = section.title;

  const body = (() => {
    switch (section.type) {
      case "ABOUT":
      case "CUSTOM_TEXT": {
        const text = typeof config.text === "string" ? config.text : section.type === "ABOUT" ? profile.bio ?? "" : "";
        if (!text.trim()) return null;
        return <div className="vy-bio vy-prose">{renderMarkdown(text)}</div>;
      }
      case "SOCIALS":
        return <SocialLinks links={profile.socialLinks} />;
      case "LINKS":
        return profile.customLinks.length ? (
          <div className="vy-links">
            {profile.customLinks.map((l) => (
              <LinkCard key={l.id} link={l} defaultHover={profile.theme.links.hoverAnimation} />
            ))}
          </div>
        ) : null;
      case "PROJECTS":
        return profile.projects.length ? (
          <div className="vy-grid">
            {profile.projects.map((p) => (
              <Link key={p.id} href={`/${profile.username}/project/${p.slug}`} className="vy-tile">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="vy-tile-cover" src={p.coverUrl} alt="" loading="lazy" />
                ) : null}
                <div className="vy-tile-body">
                  <span className="vy-tile-title">{p.title}</span>
                  {p.description ? <span className="vy-tile-desc">{p.description}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        ) : null;
      case "GALLERY":
        return profile.galleries.length ? (
          <div className="vy-gallery">
            {profile.galleries.flatMap((g) =>
              g.items.map((it) =>
                it.type === "VIDEO" ? (
                  <video key={it.id} src={it.url} muted loop playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={it.id} src={it.url} alt={it.caption ?? ""} loading="lazy" />
                ),
              ),
            )}
          </div>
        ) : null;
      case "MUSIC":
        return profile.musicTracks.length ? (
          <AudioPlayer
            tracks={profile.musicTracks}
            autoplay={false}
            loop={profile.settings.config.audio.loop}
            initialVolume={profile.settings.config.audio.volume}
          />
        ) : null;
      case "SKILLS": {
        const items = readItems(config);
        return items.length ? (
          <div className="vy-chips">
            {items.map((it, i) => (
              <span key={i} className="vy-chip">
                {it.name}
              </span>
            ))}
          </div>
        ) : null;
      }
      case "GAMES":
      case "ANIME":
      case "MOVIES": {
        const items = readItems(config);
        return items.length ? (
          <div className="vy-grid">
            {items.map((it, i) => (
              <div key={i} className="vy-tile">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="vy-tile-cover" src={it.image} alt="" loading="lazy" />
                ) : null}
                <div className="vy-tile-body">
                  <span className="vy-tile-title">{it.name}</span>
                  {it.note ? <span className="vy-tile-desc">{it.note}</span> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null;
      }
      case "WIDGETS":
        return profile.widgets.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {profile.widgets.map((w) => (
              <WidgetCard
                key={w.id}
                widget={w}
                context={{ viewCount: profile.viewCount, latestProject: profile.projects[0] ?? null }}
              />
            ))}
          </div>
        ) : null;
      default: {
        const widgetType = SECTION_AS_WIDGET[section.type];
        if (widgetType) {
          return (
            <WidgetCard
              widget={{ id: section.id, type: widgetType, config }}
              context={{ viewCount: profile.viewCount, latestProject: profile.projects[0] ?? null }}
            />
          );
        }
        return null;
      }
    }
  })();

  if (!body) return null;

  return (
    <section className="vy-section">
      {title ? <div className="vy-section-title">{title}</div> : null}
      {body}
    </section>
  );
}
