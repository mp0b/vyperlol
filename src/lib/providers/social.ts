/**
 * Social provider registry — an extensible, data-driven catalogue. Each entry
 * knows how to turn raw user input (a handle or a full URL) into a normalized
 * { username, url } pair, and validates that a pasted URL really belongs to the
 * provider (anti-phishing / anti-impersonation). Add a provider by appending
 * one object here; the UI and link editor pick it up automatically.
 */

export type ProviderKind = "username" | "url" | "email" | "crypto";

export interface ParsedSocial {
  username: string | null;
  url: string;
}

export interface SocialProviderDef {
  key: string;
  label: string;
  /** simple-icons slug, resolved to a component by <SocialIcon />. */
  icon: string;
  color: string;
  kind: ProviderKind;
  placeholder: string;
  /** URL base including any handle prefix, e.g. https://www.youtube.com/@ */
  base?: string;
  /** Hostnames (sans leading www.) this provider owns. */
  hosts?: string[];
}

function stripHandle(input: string): string {
  return input.replace(/^[@$/\s]+/, "").replace(/\/+$/, "").trim();
}

function hostOf(url: URL): string {
  return url.hostname.replace(/^www\./, "").toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFS: SocialProviderDef[] = [
  { key: "discord", label: "Discord", icon: "discord", color: "#5865F2", kind: "username", placeholder: "username or discord.gg/invite", base: "https://discord.com/users/", hosts: ["discord.com", "discord.gg", "discordapp.com"] },
  { key: "github", label: "GitHub", icon: "github", color: "#181717", kind: "username", placeholder: "username", base: "https://github.com/", hosts: ["github.com"] },
  { key: "youtube", label: "YouTube", icon: "youtube", color: "#FF0000", kind: "username", placeholder: "@handle", base: "https://www.youtube.com/@", hosts: ["youtube.com", "youtu.be"] },
  { key: "twitch", label: "Twitch", icon: "twitch", color: "#9146FF", kind: "username", placeholder: "username", base: "https://twitch.tv/", hosts: ["twitch.tv"] },
  { key: "tiktok", label: "TikTok", icon: "tiktok", color: "#000000", kind: "username", placeholder: "@handle", base: "https://www.tiktok.com/@", hosts: ["tiktok.com"] },
  { key: "instagram", label: "Instagram", icon: "instagram", color: "#E4405F", kind: "username", placeholder: "username", base: "https://instagram.com/", hosts: ["instagram.com"] },
  { key: "x", label: "X", icon: "x", color: "#000000", kind: "username", placeholder: "@handle", base: "https://x.com/", hosts: ["x.com", "twitter.com"] },
  { key: "telegram", label: "Telegram", icon: "telegram", color: "#26A5E4", kind: "username", placeholder: "username", base: "https://t.me/", hosts: ["t.me", "telegram.me"] },
  { key: "spotify", label: "Spotify", icon: "spotify", color: "#1DB954", kind: "url", placeholder: "profile or playlist link", base: "https://open.spotify.com/user/", hosts: ["spotify.com", "open.spotify.com"] },
  { key: "steam", label: "Steam", icon: "steam", color: "#000000", kind: "username", placeholder: "vanity id or profile link", base: "https://steamcommunity.com/id/", hosts: ["steamcommunity.com"] },
  { key: "roblox", label: "Roblox", icon: "roblox", color: "#000000", kind: "url", placeholder: "profile link", base: "https://www.roblox.com/users/", hosts: ["roblox.com"] },
  { key: "reddit", label: "Reddit", icon: "reddit", color: "#FF4500", kind: "username", placeholder: "u/username", base: "https://reddit.com/user/", hosts: ["reddit.com"] },
  { key: "linkedin", label: "LinkedIn", icon: "linkedin", color: "#0A66C2", kind: "username", placeholder: "in/username", base: "https://linkedin.com/in/", hosts: ["linkedin.com"] },
  { key: "kick", label: "Kick", icon: "kick", color: "#53FC18", kind: "username", placeholder: "username", base: "https://kick.com/", hosts: ["kick.com"] },
  { key: "soundcloud", label: "SoundCloud", icon: "soundcloud", color: "#FF3300", kind: "username", placeholder: "username", base: "https://soundcloud.com/", hosts: ["soundcloud.com"] },
  { key: "applemusic", label: "Apple Music", icon: "applemusic", color: "#FA243C", kind: "url", placeholder: "profile link", hosts: ["music.apple.com", "apple.com"] },
  { key: "facebook", label: "Facebook", icon: "facebook", color: "#0866FF", kind: "username", placeholder: "username", base: "https://facebook.com/", hosts: ["facebook.com", "fb.com"] },
  { key: "threads", label: "Threads", icon: "threads", color: "#000000", kind: "username", placeholder: "@handle", base: "https://www.threads.net/@", hosts: ["threads.net"] },
  { key: "patreon", label: "Patreon", icon: "patreon", color: "#000000", kind: "username", placeholder: "username", base: "https://patreon.com/", hosts: ["patreon.com"] },
  { key: "kofi", label: "Ko-fi", icon: "kofi", color: "#FF5E5B", kind: "username", placeholder: "username", base: "https://ko-fi.com/", hosts: ["ko-fi.com"] },
  { key: "buymeacoffee", label: "Buy Me a Coffee", icon: "buymeacoffee", color: "#FFDD00", kind: "username", placeholder: "username", base: "https://buymeacoffee.com/", hosts: ["buymeacoffee.com"] },
  { key: "paypal", label: "PayPal", icon: "paypal", color: "#003087", kind: "username", placeholder: "paypal.me username", base: "https://paypal.me/", hosts: ["paypal.me", "paypal.com"] },
  { key: "cashapp", label: "Cash App", icon: "cashapp", color: "#00C244", kind: "username", placeholder: "$cashtag", base: "https://cash.app/$", hosts: ["cash.app"] },
  { key: "crypto", label: "Crypto", icon: "bitcoin", color: "#F7931A", kind: "crypto", placeholder: "wallet address" },
  { key: "email", label: "Email", icon: "email", color: "#EA4335", kind: "email", placeholder: "you@example.com" },
];

const BY_KEY = new Map(DEFS.map((d) => [d.key, d]));

export const SOCIAL_PROVIDERS = DEFS;

export function getSocialProvider(key: string): SocialProviderDef | undefined {
  return BY_KEY.get(key);
}

/**
 * Normalize raw input for a provider. Returns null when the input is invalid
 * (bad email, wrong host for a pasted URL, or an empty handle).
 */
export function parseSocial(key: string, rawInput: string): ParsedSocial | null {
  const def = BY_KEY.get(key);
  if (!def) return null;
  const input = rawInput.trim();
  if (!input) return null;

  if (def.kind === "email") {
    const addr = input.replace(/^mailto:/i, "").trim();
    return EMAIL_RE.test(addr) ? { username: addr, url: `mailto:${addr}` } : null;
  }

  if (def.kind === "crypto") {
    // Loose sanity check; specific chains vary. Store as-is, no link.
    return /^[a-zA-Z0-9:_.-]{16,120}$/.test(input) ? { username: input, url: "" } : null;
  }

  const looksLikeUrl = /^https?:\/\//i.test(input) || /^[\w.-]+\.[a-z]{2,}\//i.test(input);
  if (looksLikeUrl) {
    let url: URL;
    try {
      url = new URL(input.startsWith("http") ? input : `https://${input}`);
    } catch {
      return null;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (def.hosts && !def.hosts.includes(hostOf(url))) return null;
    const segment = url.pathname.split("/").filter(Boolean).pop() ?? null;
    return { username: segment ? stripHandle(segment) : null, url: url.toString() };
  }

  const username = stripHandle(input);
  if (!username || !/^[\w.\-]{1,64}$/.test(username)) return null;
  return { username, url: def.base ? `${def.base}${username}` : `https://${username}` };
}

export function validateSocial(key: string, rawInput: string): boolean {
  return parseSocial(key, rawInput) !== null;
}
