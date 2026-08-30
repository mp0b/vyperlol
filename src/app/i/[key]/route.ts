import { NextResponse, type NextRequest } from "next/server";
import { getLocalObject } from "@/lib/storage";
import { env } from "@/lib/env";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
};

/** Serves locally-stored media (dev). In production, media is served by the CDN. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  if (env.STORAGE_DRIVER !== "local") {
    return new NextResponse("Not found", { status: 404 });
  }
  const { key } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
    return new NextResponse("Bad request", { status: 400 });
  }
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME[ext];
  if (!mime) return new NextResponse("Not found", { status: 404 });

  try {
    const buf = await getLocalObject(key);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
