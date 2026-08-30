import "server-only";
import { db } from "@/lib/db";
import { parseThemeConfig } from "@/lib/theme/types";
import { parseSettingsConfig } from "@/lib/profile/settings";
import { parseLinkStyle } from "@/lib/profile/link-style";
import { PROFILE_TAGS, type ProfileTag } from "@/lib/constants";
import type { EditorDraft, EditorStaticData } from "@/lib/editor/types";

/** Load the full editable state for a profile (owner-only; caller checks auth). */
export async function loadEditorState(
  profileId: string,
): Promise<{ draft: EditorDraft; data: EditorStaticData } | null> {
  const p = await db.profile.findUnique({
    where: { id: profileId },
    include: {
      theme: true,
      settings: true,
      socialLinks: { orderBy: { position: "asc" } },
      customLinks: { where: { deletedAt: null }, orderBy: { position: "asc" } },
      sections: { orderBy: { position: "asc" } },
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
          badges: {
            where: { visible: true, badge: { isPublic: true } },
            include: { badge: true },
            orderBy: { grantedAt: "asc" },
          },
        },
      },
    },
  });
  if (!p || p.deletedAt) return null;

  const draft: EditorDraft = {
    profile: {
      displayName: p.displayName ?? "",
      bio: p.bio ?? "",
      location: p.location ?? "",
      statusText: p.statusText ?? "",
      statusEmoji: p.statusEmoji ?? "",
      pronouns: p.pronouns ?? "",
      occupation: p.occupation ?? "",
      avatarUrl: p.avatarUrl ?? "",
      bannerUrl: p.bannerUrl ?? "",
      tags: p.tags.filter((tag): tag is ProfileTag => PROFILE_TAGS.includes(tag as ProfileTag)),
      visibility: p.visibility,
      isPublished: p.isPublished,
      seoTitle: p.seoTitle ?? "",
      seoDescription: p.seoDescription ?? "",
    },
    theme: parseThemeConfig(p.theme?.config),
    settings: {
      showViews: p.settings?.showViews ?? true,
      showBadges: p.settings?.showBadges ?? true,
      showFollowerCount: p.settings?.showFollowerCount ?? true,
      animationsEnabled: p.settings?.animationsEnabled ?? true,
      config: parseSettingsConfig(p.settings?.config),
    },
    socials: p.socialLinks.map((s) => ({
      id: s.id,
      provider: s.provider,
      username: s.username,
      url: s.url,
      label: s.label,
      visible: s.visible,
    })),
    links: p.customLinks.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      url: l.url,
      icon: l.icon,
      imageUrl: l.imageUrl,
      style: parseLinkStyle(l.style),
      visibility: l.visibility,
    })),
    sections: p.sections.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      visible: s.visible,
      config: (s.config as Record<string, unknown>) ?? {},
    })),
  };

  const data: EditorStaticData = {
    profileId: p.id,
    username: p.username,
    viewCount: p.viewCount,
    followerCount: p.followerCount,
    badges: p.user.badges.map((ub) => ({
      key: ub.badge.key,
      name: ub.badge.name,
      icon: ub.badge.icon,
      color: ub.badge.color,
      glow: ub.badge.glow,
    })),
    projects: p.projects.map((pr) => ({
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
    widgets: p.widgets.map((w) => ({ id: w.id, type: w.type, config: (w.config as Record<string, unknown>) ?? {} })),
    galleries: p.galleries.map((g) => ({
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
  };

  return { draft, data };
}
