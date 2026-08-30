import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { MediaLibrary } from "@/components/dashboard/media-library";

export default async function MediaPage() {
  const user = await requireUser("/dashboard/media");
  const assets = await db.asset.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, thumbnailUrl: true, type: true, originalName: true, sizeBytes: true, createdAt: true },
  });

  return <MediaLibrary assets={assets.map((asset) => ({ ...asset, createdAt: asset.createdAt.toISOString() }))} />;
}
