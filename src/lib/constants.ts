/** Shared, environment-agnostic constants. Safe to import on client or server. */

export const APP_NAME = "Vyper";
export const APP_DOMAIN = "vyper.lol";
export const APP_TAGLINE = "Your whole internet, one link.";

export const USERNAME_MIN = 2;
export const USERNAME_MAX = 32;

/**
 * Username format: lowercase alphanumerics with `_`/`-` in the middle,
 * must start and end with an alphanumeric. 2–32 chars.
 */
export const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9_-]{0,30}[a-z0-9])?$/;

/**
 * Reserved slugs — platform routes, brand-safety, and impersonation guards.
 * A username or alias matching any of these is rejected.
 */
export const RESERVED_USERNAMES = new Set<string>([
  // platform / routes
  "admin", "administrator", "api", "app", "apps", "auth", "dashboard", "login",
  "logout", "register", "signup", "signin", "settings", "support", "help",
  "pricing", "about", "terms", "privacy", "status", "cdn", "assets", "static",
  "www", "explore", "leaderboard", "vote", "i", "preview", "onboarding",
  "verify-email", "forgot-password", "reset-password", "me", "user", "users",
  "main", "docs", "doc", "blog", "contact", "dmca", "cookies", "guidelines",
  "notifications", "account", "billing", "callback", "oauth", "health",
  "sitemap", "robots", "favicon", "public", "media", "upload", "uploads",
  "new", "edit", "profile", "profiles", "u", "search", "tags", "category",
  "categories", "trending", "popular", "following", "followers", "verify",
  "reset", "confirm", "unsubscribe", "webhook", "webhooks", "ws", "sse",
  "embed", "widget", "widgets", "feed", "download", "mobile", "ios", "android",
  // brand / roles / safety
  "vyper", "vyperlol", "official", "system", "security", "legal", "jobs",
  "careers", "press", "brand", "root", "mod", "moderator", "owner", "staff",
  "team", "null", "undefined", "true", "false", "everyone", "here",
  // providers (impersonation)
  "discord", "github", "google", "twitch", "spotify", "steam", "roblox",
  "youtube", "tiktok", "instagram", "twitter", "x", "telegram", "reddit",
]);

/** Profile tags surfaced in discovery. */
export const PROFILE_TAGS = [
  "Developer", "Gamer", "Designer", "Creator", "Artist", "Student",
  "Streamer", "Music", "Photographer", "Writer", "Founder",
] as const;
export type ProfileTag = (typeof PROFILE_TAGS)[number];

export const UPLOAD_ACCEPT = {
  image: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"],
  video: ["video/mp4", "video/webm"],
  audio: ["audio/mpeg", "audio/mp3", "audio/ogg", "audio/wav"],
} as const;

export const API_SCOPES = [
  "profile:read",
  "links:read",
  "projects:read",
  "widgets:read",
  "analytics:read",
] as const;
export type ApiScope = (typeof API_SCOPES)[number];

export const FEATURE_FLAGS = {
  MARKETPLACE: "marketplace",
  CUSTOM_DOMAINS: "custom-domains",
  FOLLOWS: "follows",
  BETA_WIDGETS: "beta-widgets",
} as const;
