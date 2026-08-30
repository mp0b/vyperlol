import "server-only";
import { Discord, GitHub, Google, generateState, generateCodeVerifier } from "arctic";
import { env, oauthConfigured } from "@/lib/env";

export type OAuthProviderKey = "discord" | "github" | "google";

export interface OAuthUserInfo {
  providerAccountId: string;
  email: string | null;
  emailVerified: boolean;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
}

function redirectUri(key: OAuthProviderKey): string {
  return `${env.APP_URL.replace(/\/$/, "")}/api/auth/callback/${key}`;
}

interface ProviderMeta {
  usesPKCE: boolean;
  scopes: string[];
}

const META: Record<OAuthProviderKey, ProviderMeta> = {
  discord: { usesPKCE: false, scopes: ["identify", "email"] },
  github: { usesPKCE: false, scopes: ["read:user", "user:email"] },
  google: { usesPKCE: true, scopes: ["openid", "profile", "email"] },
};

type ArcticProvider = Discord | GitHub | Google;

function instance(key: OAuthProviderKey): ArcticProvider | null {
  if (!oauthConfigured(key)) return null;
  switch (key) {
    case "discord":
      return new Discord(env.DISCORD_CLIENT_ID!, env.DISCORD_CLIENT_SECRET!, redirectUri("discord"));
    case "github":
      return new GitHub(env.GITHUB_CLIENT_ID!, env.GITHUB_CLIENT_SECRET!, redirectUri("github"));
    case "google":
      return new Google(env.GOOGLE_CLIENT_ID!, env.GOOGLE_CLIENT_SECRET!, redirectUri("google"));
  }
}

export function isOAuthEnabled(key: OAuthProviderKey): boolean {
  return oauthConfigured(key);
}

export function enabledOAuthProviders(): OAuthProviderKey[] {
  return (["discord", "github", "google"] as const).filter(oauthConfigured);
}

export interface AuthorizationRequest {
  url: string;
  state: string;
  codeVerifier: string;
}

export function createAuthorization(key: OAuthProviderKey): AuthorizationRequest | null {
  const provider = instance(key);
  if (!provider) return null;
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const { scopes, usesPKCE } = META[key];

  const url =
    key === "google"
      ? (provider as Google).createAuthorizationURL(state, codeVerifier, scopes)
      : (provider as Discord | GitHub).createAuthorizationURL(state, scopes);

  return { url: url.toString(), state, codeVerifier: usesPKCE ? codeVerifier : "" };
}

export async function validateCallback(
  key: OAuthProviderKey,
  code: string,
  codeVerifier: string,
): Promise<string> {
  const provider = instance(key);
  if (!provider) throw new Error(`OAuth provider ${key} is not configured`);

  const tokens =
    key === "google"
      ? await (provider as Google).validateAuthorizationCode(code, codeVerifier)
      : await (provider as Discord | GitHub).validateAuthorizationCode(code);

  return tokens.accessToken();
}

export async function fetchOAuthUser(
  key: OAuthProviderKey,
  accessToken: string,
): Promise<OAuthUserInfo> {
  switch (key) {
    case "discord":
      return fetchDiscord(accessToken);
    case "github":
      return fetchGitHub(accessToken);
    case "google":
      return fetchGoogle(accessToken);
  }
}

async function fetchDiscord(token: string): Promise<OAuthUserInfo> {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Discord profile fetch failed");
  const u = await res.json();
  const avatarUrl = u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith("a_") ? "gif" : "png"}?size=256`
    : null;
  return {
    providerAccountId: String(u.id),
    email: u.email ?? null,
    emailVerified: Boolean(u.verified),
    username: u.username ?? null,
    name: u.global_name ?? u.username ?? null,
    avatarUrl,
  };
}

async function fetchGitHub(token: string): Promise<OAuthUserInfo> {
  const headers = {
    Authorization: `Bearer ${token}`,
    "User-Agent": "vyper.lol",
    Accept: "application/vnd.github+json",
  };
  const res = await fetch("https://api.github.com/user", { headers });
  if (!res.ok) throw new Error("GitHub profile fetch failed");
  const u = await res.json();

  let email: string | null = u.email ?? null;
  let emailVerified = false;
  if (!email) {
    const emailRes = await fetch("https://api.github.com/user/emails", { headers });
    if (emailRes.ok) {
      const emails = (await emailRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primary = emails.find((e) => e.primary) ?? emails.find((e) => e.verified);
      if (primary) {
        email = primary.email;
        emailVerified = primary.verified;
      }
    }
  } else {
    emailVerified = true;
  }

  return {
    providerAccountId: String(u.id),
    email,
    emailVerified,
    username: u.login ?? null,
    name: u.name ?? u.login ?? null,
    avatarUrl: u.avatar_url ?? null,
  };
}

async function fetchGoogle(token: string): Promise<OAuthUserInfo> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Google profile fetch failed");
  const u = await res.json();
  return {
    providerAccountId: String(u.sub),
    email: u.email ?? null,
    emailVerified: Boolean(u.email_verified),
    username: u.email ? u.email.split("@")[0] : null,
    name: u.name ?? null,
    avatarUrl: u.picture ?? null,
  };
}
