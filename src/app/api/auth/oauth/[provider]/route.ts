import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createAuthorization, type OAuthProviderKey } from "@/lib/auth/oauth";
import { env, isProd } from "@/lib/env";

const PROVIDERS = new Set(["discord", "github", "google"]);

/** Begin an OAuth flow: stash state/verifier in cookies and redirect out. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const origin = env.APP_URL.replace(/\/$/, "");

  if (!PROVIDERS.has(provider)) {
    return NextResponse.redirect(`${origin}/login?error=unknown_provider`);
  }

  const auth = createAuthorization(provider as OAuthProviderKey);
  if (!auth) {
    return NextResponse.redirect(`${origin}/login?error=oauth_unavailable`);
  }

  const store = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 minutes to complete the flow
  };
  store.set("vy_oauth_state", auth.state, cookieOpts);
  store.set("vy_oauth_verifier", auth.codeVerifier, cookieOpts);
  store.set("vy_oauth_provider", provider, cookieOpts);

  const next = req.nextUrl.searchParams.get("next");
  if (next && next.startsWith("/")) store.set("vy_oauth_next", next, cookieOpts);

  return NextResponse.redirect(auth.url);
}
