import type { ProfileVisibility, SectionType, LinkVisibility } from "@prisma/client";
import type { ThemeConfig } from "@/lib/theme/types";
import type { ProfileSettingsConfig } from "@/lib/profile/settings";
import type { LinkStyle } from "@/lib/profile/link-style";
import type { ProfileTag } from "@/lib/constants";
import type {
  RenderProfile,
  RenderBadge,
  RenderProject,
  RenderWidget,
  RenderGallery,
  RenderMusicTrack,
} from "@/lib/profile/types";

export interface EditorProfileFields {
  displayName: string;
  bio: string;
  location: string;
  statusText: string;
  statusEmoji: string;
  pronouns: string;
  occupation: string;
  avatarUrl: string;
  bannerUrl: string;
  tags: ProfileTag[];
  visibility: ProfileVisibility;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface EditorSocial {
  id: string;
  provider: string;
  username: string | null;
  url: string;
  label: string | null;
  visible: boolean;
}

export interface EditorLink {
  id: string;
  title: string;
  description: string | null;
  url: string;
  icon: string | null;
  imageUrl: string | null;
  style: LinkStyle;
  visibility: LinkVisibility;
}

export interface EditorSection {
  id: string;
  type: SectionType;
  title: string | null;
  visible: boolean;
  config: Record<string, unknown>;
}

export interface EditorSettings {
  showViews: boolean;
  showBadges: boolean;
  showFollowerCount: boolean;
  animationsEnabled: boolean;
  config: ProfileSettingsConfig;
}

export interface EditorDraft {
  profile: EditorProfileFields;
  theme: ThemeConfig;
  settings: EditorSettings;
  socials: EditorSocial[];
  links: EditorLink[];
  sections: EditorSection[];
}

/** Read-only data shown in the preview but edited on other pages. */
export interface EditorStaticData {
  profileId: string;
  username: string;
  viewCount: number;
  followerCount: number;
  badges: RenderBadge[];
  projects: RenderProject[];
  widgets: RenderWidget[];
  galleries: RenderGallery[];
  musicTracks: RenderMusicTrack[];
}

function linkVisibleNow(link: EditorLink): boolean {
  return link.visibility === "PUBLIC" || link.visibility === "SCHEDULED";
}

/** Merge the live draft with static passthrough data into a RenderProfile. */
export function draftToRenderProfile(
  draft: EditorDraft,
  data: EditorStaticData,
): RenderProfile {
  return {
    id: data.profileId,
    username: data.username,
    displayName: draft.profile.displayName || null,
    bio: draft.profile.bio || null,
    location: draft.profile.location || null,
    statusText: draft.profile.statusText || null,
    statusEmoji: draft.profile.statusEmoji || null,
    pronouns: draft.profile.pronouns || null,
    occupation: draft.profile.occupation || null,
    avatarUrl: draft.profile.avatarUrl || null,
    bannerUrl: draft.profile.bannerUrl || null,
    tags: draft.profile.tags,
    viewCount: data.viewCount,
    followerCount: data.followerCount,
    theme: draft.theme,
    settings: {
      showViews: draft.settings.showViews,
      showBadges: draft.settings.showBadges,
      showFollowerCount: draft.settings.showFollowerCount,
      animationsEnabled: draft.settings.animationsEnabled,
      config: draft.settings.config,
    },
    sections: draft.sections
      .filter((s) => s.visible)
      .map((s) => ({ id: s.id, type: s.type, title: s.title, visible: s.visible, config: s.config })),
    socialLinks: draft.socials
      .filter((s) => s.visible)
      .map((s) => ({ id: s.id, provider: s.provider, username: s.username, url: s.url, label: s.label })),
    customLinks: draft.links
      .filter(linkVisibleNow)
      .map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        url: l.url,
        icon: l.icon,
        imageUrl: l.imageUrl,
        style: l.style,
      })),
    projects: data.projects,
    widgets: data.widgets,
    galleries: data.galleries,
    musicTracks: data.musicTracks,
    badges: data.badges,
  };
}
