import "server-only";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { classifyUserAgent, type RequestMeta } from "@/lib/request";

const BOT_RE = /bot|crawler|spider|crawl|slurp|bingpreview|facebookexternalhit|discordbot|twitterbot|telegrambot|whatsapp|preview|headless|lighthouse/i;

const MIN = 60_000;

/**
 * Record a profile view: bot-filtered, deduped per visitor for 30 min, and
 * written to both the aggregate counter and the event tables. Safe to call from
 * `after()` — it never throws.
 */
export async function recordProfileView(profileId: string, meta: RequestMeta): Promise<void> {
  try {
    if (BOT_RE.test(meta.userAgent)) return;
    const dedup = await rateLimit(`pvdedup:${profileId}:${meta.ipHash}`, {
      limit: 1,
      windowMs: 30 * MIN,
    });
    if (!dedup.success) return;

    const { device, os, browser } = classifyUserAgent(meta.userAgent);
    await db.$transaction([
      db.profileView.create({
        data: {
          profileId,
          visitorHash: meta.ipHash,
          country: meta.country,
          device,
          os,
          browser,
          referrer: meta.referrer?.slice(0, 300) ?? null,
        },
      }),
      db.profile.update({ where: { id: profileId }, data: { viewCount: { increment: 1 } } }),
      db.analyticsEvent.create({
        data: { profileId, type: "VIEW", country: meta.country, device, os, browser },
      }),
    ]);
  } catch {
    /* analytics must never break a page render */
  }
}

/**
 * Record a link click and return the destination URL, or null if the link is
 * gone. Deduped per visitor per day to compute unique clicks.
 */
export async function recordLinkClick(
  linkId: string,
  meta: RequestMeta,
): Promise<string | null> {
  const link = await db.customLink.findFirst({
    where: { id: linkId, deletedAt: null },
    select: { id: true, url: true, profileId: true },
  });
  if (!link || !link.url) return null;

  try {
    if (!BOT_RE.test(meta.userAgent)) {
      const dedup = await rateLimit(`clickdedup:${linkId}:${meta.ipHash}`, {
        limit: 1,
        windowMs: 24 * 60 * MIN,
      });
      const isUnique = dedup.success;
      const { device } = classifyUserAgent(meta.userAgent);
      await db.$transaction([
        db.linkClick.create({
          data: {
            linkId,
            profileId: link.profileId,
            country: meta.country,
            device,
            referrer: meta.referrer?.slice(0, 300) ?? null,
            visitorHash: meta.ipHash,
            isUnique,
          },
        }),
        db.customLink.update({
          where: { id: linkId },
          data: {
            clicks: { increment: 1 },
            ...(isUnique ? { uniqueClicks: { increment: 1 } } : {}),
          },
        }),
        db.analyticsEvent.create({
          data: { profileId: link.profileId, type: "LINK_CLICK", targetId: linkId, country: meta.country, device },
        }),
      ]);
    }
  } catch {
    /* ignore analytics failure, still redirect */
  }
  return link.url;
}
