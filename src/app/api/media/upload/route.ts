import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/auth/session";
import { getRequestMeta } from "@/lib/request";
import { limiters } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { sniffType } from "@/lib/media/validate";
import { putObject } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meta = await getRequestMeta();
  const rl = await limiters.upload(user.id);
  if (!rl.success) return NextResponse.json({ error: "Too many uploads. Slow down." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const maxBytes = env.UPLOAD_MAX_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File too large (max ${env.UPLOAD_MAX_MB}MB).` }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = sniffType(buffer);
  if (!detected) {
    return NextResponse.json({ error: "Unsupported or unrecognized file type." }, { status: 415 });
  }

  const base = nanoid(16);
  const key = `${base}.${detected.ext}`;

  let width: number | null = null;
  let height: number | null = null;
  let thumbnailUrl: string | null = null;

  // For images, read dimensions and derive a small thumbnail — the original is
  // stored untouched (no re-compression).
  if (detected.kind === "IMAGE") {
    try {
      const sharp = (await import("sharp")).default;
      const metadata = await sharp(buffer, { animated: false }).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
      const thumb = await sharp(buffer, { animated: false })
        .resize(400, 400, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const thumbKey = `${base}_thumb.webp`;
      const stored = await putObject(thumbKey, thumb, "image/webp");
      thumbnailUrl = stored.url;
    } catch {
      /* non-fatal: keep original without a thumbnail */
    }
  }

  const { url } = await putObject(key, buffer, detected.mime);

  const asset = await db.asset.create({
    data: {
      key,
      userId: user.id,
      type: detected.kind,
      mimeType: detected.mime,
      ext: detected.ext,
      sizeBytes: file.size,
      width,
      height,
      originalName: file.name.slice(0, 200),
      url,
      thumbnailUrl,
    },
  });

  await db.auditLog.create({
    data: { userId: user.id, action: "media.upload", targetId: asset.id, ipHash: meta.ipHash },
  });

  return NextResponse.json({
    id: asset.id,
    url: asset.url,
    thumbnailUrl: asset.thumbnailUrl,
    type: asset.type,
    width: asset.width,
    height: asset.height,
    sizeBytes: asset.sizeBytes,
  });
}
