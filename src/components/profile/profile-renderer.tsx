import type { CSSProperties } from "react";
import { Eye, MapPin, Briefcase } from "lucide-react";
import type { RenderProfile } from "@/lib/profile/types";
import { compileTheme } from "@/lib/theme/compile";
import { renderInlineMarkdown } from "@/lib/markdown";
import { ProfileBackground } from "./profile-background";
import { SectionRenderer } from "./section-renderer";
import { SocialLinks } from "./social-links";
import { CursorFx } from "./cursor-fx";
import { ProfileIntro } from "./profile-intro";
import { DiscordPresence } from "./discord-presence";
import { formatCompactNumber } from "@/lib/utils";

/**
 * The public profile renderer. Pure and self-contained: it takes a RenderProfile
 * and draws the page from the compiled theme. It has no dependency on the
 * dashboard, so it powers both the SSR public page and the live editor preview.
 */
export function ProfileRenderer({
  profile,
  preview = false,
}: {
  profile: RenderProfile;
  /** Embedded editor preview: contain fixed layers, skip heavy canvas effects. */
  preview?: boolean;
}) {
  const compiled = compileTheme(profile.theme);
  const { settings, theme } = profile;
  const animationsEnabled = settings.animationsEnabled && !theme.effects.reducedMotion;

  const hasSection = (t: string) => profile.sections.some((s) => s.type === t && s.visible);
  const showHeaderBio = Boolean(profile.bio) && !hasSection("ABOUT");
  const showHeaderSocials = profile.socialLinks.length > 0 && !hasSection("SOCIALS");

  const avatar = profile.avatarUrl;
  const name = profile.displayName || profile.username;

  return (
    <div
      className={preview ? "vy-profile vy-preview" : "vy-profile"}
      data-card-style={compiled.cardStyle}
      data-link-style={compiled.linkStyle}
      data-anim={animationsEnabled ? "on" : "off"}
      style={compiled.vars}
    >
      {compiled.googleFontHref ? (
        <link rel="stylesheet" href={compiled.googleFontHref} />
      ) : null}
      {compiled.customFontUrl ? (
        <style
          // Custom font face; family name + validated url are inlined into CSS.
          dangerouslySetInnerHTML={{
            __html: `@font-face{font-family:"${theme.typography.fontFamily.replace(/["\\]/g, "")}";src:url("${compiled.customFontUrl}");font-display:swap;}`,
          }}
        />
      ) : null}

      <ProfileIntro
        settings={settings.config}
        preview={preview}
        musicUrl={settings.config.audioUrl || profile.musicTracks?.[0]?.audioUrl}
      />
      <ProfileBackground theme={theme} animationsEnabled={animationsEnabled} preview={preview} />
      {!preview && theme.effects.cursor !== "default" && animationsEnabled ? (
        <CursorFx kind={theme.effects.cursor} color={theme.colors.accent} imageUrl={theme.effects.cursorImageUrl} />
      ) : null}

      <div className="vy-shell">
        <div className="vy-card">
          {profile.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="vy-banner" src={profile.bannerUrl} alt="" />
          ) : null}

          <div className="vy-avatar-wrap">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="vy-avatar"
                src={avatar}
                alt={name}
                data-ring={theme.profileCard.avatar.ring}
                data-glow={theme.profileCard.avatar.glow}
              />
            ) : (
              <div
                className="vy-avatar"
                data-ring={theme.profileCard.avatar.ring}
                style={{
                  display: "grid",
                  placeItems: "center",
                  background: "color-mix(in srgb, var(--vy-accent) 30%, #222)",
                  fontSize: "2rem",
                  fontWeight: 700,
                }}
                aria-hidden
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="vy-name" data-fx={theme.effects.textEffect} data-text={name}>
            {name}
          </div>
          <div className="vy-username">@{profile.username}</div>

          {settings.showBadges && profile.badges.length > 0 ? (
            <div className="vy-badges">
              {profile.badges.map((b) => (
                <span
                  key={b.key}
                  className="vy-badge"
                  data-glow={b.glow}
                  style={{ "--vy-badge-color": b.color ?? undefined } as CSSProperties}
                  title={b.name}
                >
                  {b.name}
                </span>
              ))}
            </div>
          ) : null}

          {(profile.statusText || profile.statusEmoji) && (
            <div className="vy-status">
              {profile.statusEmoji ? <span aria-hidden>{profile.statusEmoji}</span> : null}
              {profile.statusText ? <span>{profile.statusText}</span> : null}
            </div>
          )}

          {(profile.pronouns || profile.occupation || profile.location) && (
            <div className="vy-meta">
              {profile.pronouns ? <span>{profile.pronouns}</span> : null}
              {profile.occupation ? (
                <span>
                  <Briefcase size={13} /> {profile.occupation}
                </span>
              ) : null}
              {profile.location ? (
                <span>
                  <MapPin size={13} /> {profile.location}
                </span>
              ) : null}
            </div>
          )}

          {showHeaderBio ? (
            <div className="vy-bio">{renderInlineMarkdown(profile.bio!)}</div>
          ) : null}

          {settings.config.discordId && (
            <DiscordPresence discordId={settings.config.discordId} />
          )}

          {showHeaderSocials ? <SocialLinks links={profile.socialLinks} /> : null}

          {profile.sections
            .filter((s) => s.visible)
            .map((section) => (
              <SectionRenderer key={section.id} section={section} profile={profile} />
            ))}

          {settings.showViews ? (
            <div className="vy-views">
              <Eye size={13} /> {formatCompactNumber(profile.viewCount)} views
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
