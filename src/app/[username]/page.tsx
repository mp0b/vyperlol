import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { cookies } from "next/headers";
import "@/components/profile/profile.css";
import { getProfilePageData } from "@/lib/profile/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getRequestMeta } from "@/lib/request";
import { recordProfileView } from "@/lib/analytics/record";
import { profileUnlockCookie, profileUnlockToken } from "@/lib/profile/access";
import { ProfileRenderer } from "@/components/profile/profile-renderer";
import { PasswordGate } from "@/components/profile/password-gate";
import { absoluteUrl } from "@/lib/utils";

interface Props {
  params: Promise<{ username: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfilePageData(username);
  if (!data) return { title: "Profile not found" };

  const { render, meta } = data;
  const name = render.displayName || render.username;
  const title = meta.seoTitle || `${name} (@${render.username})`;
  const description =
    meta.seoDescription ||
    (render.bio ? render.bio.replace(/[#*_~`>]/g, "").slice(0, 160) : `${name}'s Vyper profile.`);
  const image = meta.seoImageUrl || render.avatarUrl || undefined;
  const url = absoluteUrl(`/${render.username}`);
  const noIndex = meta.visibility !== "PUBLIC" || !meta.isPublished;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    icons: meta.faviconUrl ? { icon: meta.faviconUrl } : undefined,
  };
}

function PrivateNotice({ username }: { username: string }) {
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(120% 120% at 50% 0%, #14121f, #08080e)",
        color: "#fff",
        textAlign: "center",
        padding: 20,
      }}
    >
      <div>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700 }}>@{username}</h1>
        <p style={{ opacity: 0.7, marginTop: 6 }}>This profile is private.</p>
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const [data, viewer] = await Promise.all([getProfilePageData(username), getCurrentUser()]);
  if (!data) notFound();

  const { render, meta } = data;

  // Alias → canonical username redirect (SEO + consistency).
  if (render.username !== username.toLowerCase()) {
    redirect(`/${render.username}`);
  }

  const isOwner = viewer?.id === meta.ownerId;

  if (!isOwner) {
    if (!meta.isPublished) notFound();
    if (meta.visibility === "PRIVATE") return <PrivateNotice username={render.username} />;
    if (meta.visibility === "PASSWORD") {
      const store = await cookies();
      const unlocked = store.get(profileUnlockCookie(meta.id))?.value === profileUnlockToken(meta.id);
      if (!unlocked) return <PasswordGate profileId={meta.id} username={render.username} />;
    }
  }

  // Count the view after the response is sent (deduped + bot-filtered).
  if (!isOwner && meta.isPublished && meta.visibility !== "PRIVATE") {
    const reqMeta = await getRequestMeta();
    after(() => recordProfileView(meta.id, reqMeta));
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: render.displayName || render.username,
      alternateName: `@${render.username}`,
      description: render.bio ?? undefined,
      image: render.avatarUrl ?? undefined,
      url: absoluteUrl(`/${render.username}`),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileRenderer profile={render} />
    </>
  );
}
