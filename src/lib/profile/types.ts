import type {
  ProfileVisibility,
  SectionType,
  WidgetType,
  ProjectStatus,
  MediaType,
  GalleryLayout,
} from "@prisma/client";
import type { ThemeConfig } from "@/lib/theme/types";
import type { ProfileSettingsConfig } from "@/lib/profile/settings";
import type { LinkStyle } from "@/lib/profile/link-style";

export interface RenderSocialLink {
  id: string;
  provider: string;
  username: string | null;
  url: string;
  label: string | null;
}

export interface RenderCustomLink {
  id: string;
  title: string;
  description: string | null;
  url: string;
  icon: string | null;
  imageUrl: string | null;
  style: LinkStyle;
}

export interface RenderProjectMedia {
  url: string;
  type: MediaType;
  caption: string | null;
}

export interface RenderProject {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  coverUrl: string | null;
  technologies: string[];
  url: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  media: RenderProjectMedia[];
}

export interface RenderWidget {
  id: string;
  type: WidgetType;
  config: Record<string, unknown>;
}

export interface RenderSection {
  id: string;
  type: SectionType;
  title: string | null;
  visible: boolean;
  config: Record<string, unknown>;
}

export interface RenderGalleryItem {
  id: string;
  url: string;
  type: MediaType;
  caption: string | null;
}

export interface RenderGallery {
  id: string;
  title: string | null;
  layout: GalleryLayout;
  items: RenderGalleryItem[];
}

export interface RenderMusicTrack {
  id: string;
  title: string;
  artist: string | null;
  coverUrl: string | null;
  audioUrl: string;
  duration: number | null;
}

export interface RenderBadge {
  key: string;
  name: string;
  icon: string;
  color: string | null;
  glow: boolean;
}

export interface RenderSettings {
  showViews: boolean;
  showBadges: boolean;
  showFollowerCount: boolean;
  animationsEnabled: boolean;
  config: ProfileSettingsConfig;
}

export interface RenderProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  statusText: string | null;
  statusEmoji: string | null;
  pronouns: string | null;
  occupation: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  tags: string[];
  viewCount: number;
  followerCount: number;
  theme: ThemeConfig;
  settings: RenderSettings;
  sections: RenderSection[];
  socialLinks: RenderSocialLink[];
  customLinks: RenderCustomLink[];
  projects: RenderProject[];
  widgets: RenderWidget[];
  galleries: RenderGallery[];
  musicTracks: RenderMusicTrack[];
  badges: RenderBadge[];
}

export interface ProfileMeta {
  id: string;
  ownerId: string;
  visibility: ProfileVisibility;
  isPublished: boolean;
  passwordProtected: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImageUrl: string | null;
  faviconUrl: string | null;
}

export interface ProfilePageData {
  render: RenderProfile;
  meta: ProfileMeta;
}
