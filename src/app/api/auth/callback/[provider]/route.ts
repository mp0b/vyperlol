import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { env, adminEmails } from "@/lib/env";
import {
  validateCallback,
  fetchOAuthUser,
  type OAuthProviderKey,
} from "@/lib/auth/oauth";
import { startSession } from "@/lib/auth/session";
import { getRequestMeta } from "@/lib/request";
import { generateUniqueUsername } from "@/lib/username-server";
import { createProfileForUser } from "@/lib/profile/create";

const PROVIDERS = new Set(["discord", "github", "google"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const origin = env.APP_URL.replace(/\/$/, "");
  const fail = (code: string) => NextResponse.redirect(`${origin}/login?error=${code}`);

  if (!PROVIDERS.has(provider)) return fail("unknown_provider");

  const store = await cookies();
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = store.get("vy_oauth_state")?.value;
  const verifier = store.get("vy_oauth_verifier")?.value ?? "";
  const savedProvider = store.get("vy_oauth_provider")?.value;
  const next = store.get("vy_oauth_next")?.value;

  // Clear one-time cookies regardless of outcome.
  for (const c of ["vy_oauth_state", "vy_oauth_verifier", "vy_oauth_provider", "vy_oauth_next"]) {
    store.set(c, "", { path: "/", maxAge: 0 });
  }

  if (!code || !state || !savedState || state !== savedState || provider !== savedProvider) {
    return fail("oauth_state");
  }

  try {
    const accessToken = await validateCallback(provider as OAuthProviderKey, code, verifier);
    const info = await fetchOAuthUser(provider as OAuthProviderKey, accessToken);
    if (!info.email) return fail("oauth_no_email");

    const meta = await getRequestMeta();
    const email = info.email.toLowerCase();

    // 1) Already linked?
    const linked = await db.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId: info.providerAccountId } },
      include: { user: true },
    });

    let userId: string;

    if (linked) {
      if (linked.user.status === "BANNED" || linked.user.deletedAt) return fail("account_unavailable");
      userId = linked.userId;
    } else {
      const byEmail = await db.user.findUnique({ where: { email } });
      if (byEmail) {
        // Link to an existing account only when the provider vouches for the email.
        if (!info.emailVerified) return fail("email_unverified");
        if (byEmail.status === "BANNED" || byEmail.deletedAt) return fail("account_unavailable");
        await db.oAuthAccount.create({
          data: { userId: byEmail.id, provider, providerAccountId: info.providerAccountId, username: info.username, email },
        });
        if (!byEmail.emailVerified) {
          await db.user.update({ where: { id: byEmail.id }, data: { emailVerified: new Date() } });
        }
        userId = byEmail.id;
      } else {
        // Fresh signup.
        const isAdmin = adminEmails.includes(email);
        const user = await db.user.create({
          data: {
            email,
            emailVerified: info.emailVerified || isAdmin ? new Date() : null,
            role: isAdmin ? "OWNER" : "USER",
            displayName: info.name,
            avatarUrl: info.avatarUrl,
            lastLoginAt: new Date(),
            oauthAccounts: {
              create: { provider, providerAccountId: info.providerAccountId, username: info.username, email },
            },
          },
        });
        const username = await generateUniqueUsername(info.username || email.split("@")[0] || "user");
        await createProfileForUser(user.id, username, {
          displayName: info.name,
          avatarUrl: info.avatarUrl,
          makeDefault: true,
        });
        userId = user.id;
      }
    }

    await db.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
    await db.auditLog.create({ data: { userId, action: `auth.oauth.${provider}`, ipHash: meta.ipHash } });
    await startSession(userId, { ipHash: meta.ipHash, userAgent: meta.userAgent, country: meta.country });

    return NextResponse.redirect(`${origin}${next && next.startsWith("/") ? next : "/dashboard"}`);
  } catch {
    return fail("oauth_failed");
  }
}
