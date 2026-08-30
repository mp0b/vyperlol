import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { normalizeUsername } from "@/lib/username";
import { parseThemeConfig } from "@/lib/theme/types";
import { parseSettingsConfig } from "@/lib/profile/settings";
import { parseLinkStyle } from "@/lib/profile/link-style";
import type { ProfilePageData, RenderProfile } from "@/lib/profile/types";

const profileInclude = Prisma.validator<Prisma.ProfileInclude>()({
  theme: true,
  settings: true,
  sections: { orderBy: { position: "asc" } },
  socialLinks: { orderBy: { position: "asc" } },
  customLinks: { where: { deletedAt: null }, orderBy: { position: "asc" } },
  projects: {
    where: { deletedAt: null },
    orderBy: [{ featured: "desc" }, { position: "asc" }],
    include: { media: { orderBy: { position: "asc" } } },
  },
  widgets: { orderBy: { position: "asc" } },
  galleries: { orderBy: { position: "asc" }, include: { items: { orderBy: { position: "asc" } } } },
  musicTracks: { orderBy: { position: "asc" } },
  user: {
    select: {
      id: true,
      badges: {
        where: { visible: true, badge: { isPublic: true } },
        include: { badge: true },
        orderBy: { grantedAt: "asc" },
      },
    },
  },
});

type ProfileWithIncludes = Prisma.ProfileGetPayload<{ include: typeof profileInclude }>;

/** Resolve a URL slug to a profile id via username, then alias. */
export async function resolveSlug(slug: string): Promise<string | null> {
  const s = normalizeUsername(slug);
  const profile = await db.profile.findFirst({
    where: { username: s, deletedAt: null },
    select: { id: true },
  });
  if (profile) return profile.id;
  const alias = await db.alias.findUnique({ where: { alias: s }, select: { profileId: true } });
  return alias?.profileId ?? null;
}

interface GetOptions {
  /** Owner preview shows hidden/scheduled/authenticated links regardless. */
  includeHidden?: boolean;
}

function isLinkVisibleNow(
  link: {
    visibility: string;
    scheduledStart: Date | null;
    scheduledEnd: Date | null;
  },
  includeHidden: boolean,
): boolean {
  if (includeHidden) return true;
  if (link.visibility === "HIDDEN" || link.visibility === "AUTHENTICATED") return false;
  if (link.visibility === "SCHEDULED") {
    const now = Date.now();
    if (link.scheduledStart && link.scheduledStart.getTime() > now) return false;
    if (link.scheduledEnd && link.scheduledEnd.getTime() < now) return false;
  }
  return true;
}

function mapToRender(p: ProfileWithIncludes, includeHidden: boolean): RenderProfile {
  return {
    id: p.id,
    username: p.username,
    displayName: p.displayName,
    bio: p.bio,
    location: p.location,
    statusText: p.statusText,
    statusEmoji: p.statusEmoji,
    pronouns: p.pronouns,
    occupation: p.occupation,
    avatarUrl: p.avatarUrl,
    bannerUrl: p.bannerUrl,
    tags: p.tags,
    viewCount: p.viewCount,
    followerCount: p.followerCount,
    theme: parseThemeConfig(p.theme?.config),
    settings: {
      showViews: p.settings?.showViews ?? true,
      showBadges: p.settings?.showBadges ?? true,
      showFollowerCount: p.settings?.showFollowerCount ?? true,
      animationsEnabled: p.settings?.animationsEnabled ?? true,
      config: parseSettingsConfig(p.settings?.config),
    },
    sections: p.sections
      .filter((s) => includeHidden || s.visible)
      .map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        visible: s.visible,
        config: (s.config as Record<string, unknown>) ?? {},
      })),
    socialLinks: p.socialLinks
      .filter((s) => includeHidden || s.visible)
      .map((s) => ({
        id: s.id,
        provider: s.provider,
        username: s.username,
        url: s.url,
        label: s.label,
      })),
    customLinks: p.customLinks
      .filter((l) => isLinkVisibleNow(l, includeHidden))
      .map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        url: l.url,
        icon: l.icon,
        imageUrl: l.imageUrl,
        style: parseLinkStyle(l.style),
      })),
    projects: p.projects
      .filter((pr) => includeHidden || pr.visible)
      .map((pr) => ({
        id: pr.id,
        slug: pr.slug,
        title: pr.title,
        description: pr.description,
        icon: pr.icon,
        coverUrl: pr.coverUrl,
        technologies: pr.technologies,
        url: pr.url,
        githubUrl: pr.githubUrl,
        demoUrl: pr.demoUrl,
        status: pr.status,
        featured: pr.featured,
        media: pr.media.map((m) => ({ url: m.url, type: m.type, caption: m.caption })),
      })),
    widgets: p.widgets
      .filter((w) => includeHidden || w.visible)
      .map((w) => ({ id: w.id, type: w.type, config: (w.config as Record<string, unknown>) ?? {} })),
    galleries: p.galleries
      .filter((g) => includeHidden || g.visible)
      .map((g) => ({
        id: g.id,
        title: g.title,
        layout: g.layout,
        items: g.items.map((it) => ({ id: it.id, url: it.url, type: it.type, caption: it.caption })),
      })),
    musicTracks: p.musicTracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      coverUrl: t.coverUrl,
      audioUrl: t.audioUrl,
      duration: t.duration,
    })),
    badges: p.user.badges.map((ub) => ({
      key: ub.badge.key,
      name: ub.badge.name,
      icon: ub.badge.icon,
      color: ub.badge.color,
      glow: ub.badge.glow,
    })),
  };
}

/** Fetch everything needed to render a profile page (public or owner preview). */
export async function getProfilePageData(
  slug: string,
  opts: GetOptions = {},
): Promise<ProfilePageData | null> {
  const s = normalizeUsername(slug);
  let profile = await db.profile.findFirst({
    where: { username: s, deletedAt: null },
    include: profileInclude,
  });

  if (!profile) {
    const alias = await db.alias.findUnique({ where: { alias: s }, select: { profileId: true } });
    if (alias) {
      profile = await db.profile.findUnique({
        where: { id: alias.profileId },
        include: profileInclude,
      });
    }
  }

  if (!profile || profile.deletedAt) return null;

  return {
    render: mapToRender(profile, opts.includeHidden ?? false),
    meta: {
      id: profile.id,
      ownerId: profile.userId,
      visibility: profile.visibility,
      isPublished: profile.isPublished,
      passwordProtected: Boolean(profile.passwordHash),
      seoTitle: profile.seoTitle,
      seoDescription: profile.seoDescription,
      seoImageUrl: profile.seoImageUrl,
      faviconUrl: profile.faviconUrl,
    },
  };
}

/** Fetch a profile page by id (dashboard live preview / owner preview route). */
export async function getProfilePageDataById(
  profileId: string,
  opts: GetOptions = {},
): Promise<ProfilePageData | null> {
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    include: profileInclude,
  });
  if (!profile || profile.deletedAt) return null;
  return {
    render: mapToRender(profile, opts.includeHidden ?? false),
    meta: {
      id: profile.id,
      ownerId: profile.userId,
      visibility: profile.visibility,
      isPublished: profile.isPublished,
      passwordProtected: Boolean(profile.passwordHash),
      seoTitle: profile.seoTitle,
      seoDescription: profile.seoDescription,
      seoImageUrl: profile.seoImageUrl,
      faviconUrl: profile.faviconUrl,
    },
  };
}
