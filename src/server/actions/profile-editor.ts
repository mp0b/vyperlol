"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { editorDraftSchema, type EditorDraftInput } from "@/lib/validation/editor";
import { loadEditorState } from "@/lib/editor/load";
import type { EditorDraft, EditorStaticData } from "@/lib/editor/types";
import { ok, fail, type ActionResult } from "@/lib/action-result";

function nullify(v: string): string | null {
  return v.trim() === "" ? null : v;
}

async function assertOwner(profileId: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await db.profile.findFirst({
    where: { id: profileId, userId: user.id, deletedAt: null },
    select: { id: true, username: true, passwordHash: true },
  });
  return profile ? { user, profile } : null;
}

/**
 * Persist the whole editor draft in one transaction: profile fields, theme,
 * settings, and the socials/links/sections collections (create/update/remove).
 * Returns the freshly-loaded state so the client can reseed real ids.
 */
export async function saveProfileDraft(
  profileId: string,
  input: EditorDraftInput,
): Promise<ActionResult<{ draft: EditorDraft; data: EditorStaticData }>> {
  const owner = await assertOwner(profileId);
  if (!owner) return fail("You don't have access to this profile.");

  const parsed = editorDraftSchema.safeParse(input);
  if (!parsed.success) return fail("Some changes couldn't be saved. Please review your inputs.");
  const draft = parsed.data;

  // Don't let a profile be locked into PASSWORD visibility with no password set.
  let visibility = draft.profile.visibility;
  if (visibility === "PASSWORD" && !owner.profile.passwordHash) visibility = "UNLISTED";

  const [existingSocials, existingLinks, existingSections] = await Promise.all([
    db.socialLink.findMany({ where: { profileId }, select: { id: true } }),
    db.customLink.findMany({ where: { profileId, deletedAt: null }, select: { id: true } }),
    db.profileSection.findMany({ where: { profileId }, select: { id: true } }),
  ]);
  const socialIds = new Set(existingSocials.map((s) => s.id));
  const linkIds = new Set(existingLinks.map((l) => l.id));
  const sectionIds = new Set(existingSections.map((s) => s.id));

  const keptSocialIds = draft.socials.filter((s) => socialIds.has(s.id)).map((s) => s.id);
  const keptLinkIds = draft.links.filter((l) => linkIds.has(l.id)).map((l) => l.id);
  const keptSectionIds = draft.sections.filter((s) => sectionIds.has(s.id)).map((s) => s.id);

  try {
    await db.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: profileId },
        data: {
          displayName: nullify(draft.profile.displayName),
          bio: nullify(draft.profile.bio),
          location: nullify(draft.profile.location),
          statusText: nullify(draft.profile.statusText),
          statusEmoji: nullify(draft.profile.statusEmoji),
          pronouns: nullify(draft.profile.pronouns),
          occupation: nullify(draft.profile.occupation),
          avatarUrl: nullify(draft.profile.avatarUrl),
          bannerUrl: nullify(draft.profile.bannerUrl),
          tags: draft.profile.tags,
          visibility,
          isPublished: draft.profile.isPublished,
          seoTitle: nullify(draft.profile.seoTitle),
          seoDescription: nullify(draft.profile.seoDescription),
        },
      });

      await tx.profileTheme.upsert({
        where: { profileId },
        update: { config: draft.theme as unknown as Prisma.InputJsonValue },
        create: { profileId, config: draft.theme as unknown as Prisma.InputJsonValue },
      });

      await tx.profileSettings.upsert({
        where: { profileId },
        update: {
          showViews: draft.settings.showViews,
          showBadges: draft.settings.showBadges,
          showFollowerCount: draft.settings.showFollowerCount,
          animationsEnabled: draft.settings.animationsEnabled,
          config: draft.settings.config as unknown as Prisma.InputJsonValue,
        },
        create: {
          profileId,
          showViews: draft.settings.showViews,
          showBadges: draft.settings.showBadges,
          showFollowerCount: draft.settings.showFollowerCount,
          animationsEnabled: draft.settings.animationsEnabled,
          config: draft.settings.config as unknown as Prisma.InputJsonValue,
        },
      });

      // Socials — remove dropped, then upsert in order.
      await tx.socialLink.deleteMany({
        where: { profileId, id: { notIn: keptSocialIds.length ? keptSocialIds : ["__none__"] } },
      });
      for (const [i, s] of draft.socials.entries()) {
        const dataFields = {
          provider: s.provider,
          username: s.username,
          url: s.url,
          label: s.label,
          visible: s.visible,
          position: i,
        };
        if (socialIds.has(s.id)) {
          await tx.socialLink.update({ where: { id: s.id }, data: dataFields });
        } else {
          await tx.socialLink.create({ data: { id: s.id, profileId, ...dataFields } });
        }
      }

      // Links — soft-delete dropped (preserve click history), upsert the rest.
      await tx.customLink.updateMany({
        where: { profileId, deletedAt: null, id: { notIn: keptLinkIds.length ? keptLinkIds : ["__none__"] } },
        data: { deletedAt: new Date() },
      });
      for (const [i, l] of draft.links.entries()) {
        const dataFields = {
          title: l.title,
          description: l.description,
          url: l.url,
          icon: l.icon,
          imageUrl: l.imageUrl,
          style: l.style as unknown as Prisma.InputJsonValue,
          visibility: l.visibility,
          position: i,
        };
        if (linkIds.has(l.id)) {
          await tx.customLink.update({ where: { id: l.id }, data: dataFields });
        } else {
          await tx.customLink.create({ data: { id: l.id, profileId, ...dataFields } });
        }
      }

      // Sections — remove dropped, upsert in order.
      await tx.profileSection.deleteMany({
        where: { profileId, id: { notIn: keptSectionIds.length ? keptSectionIds : ["__none__"] } },
      });
      for (const [i, s] of draft.sections.entries()) {
        const dataFields = {
          type: s.type,
          title: s.title,
          visible: s.visible,
          config: s.config as unknown as Prisma.InputJsonValue,
          position: i,
        };
        if (sectionIds.has(s.id)) {
          await tx.profileSection.update({ where: { id: s.id }, data: dataFields });
        } else {
          await tx.profileSection.create({ data: { id: s.id, profileId, ...dataFields } });
        }
      }
    });

    revalidatePath(`/${owner.profile.username}`);
    const fresh = await loadEditorState(profileId);
    if (!fresh) return fail("Saved, but couldn't reload the profile.");
    return ok(fresh);
  } catch {
    return fail("Something went wrong while saving. Please try again.");
  }
}
