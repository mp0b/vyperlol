import "server-only";

export type DetectedKind = "IMAGE" | "VIDEO";

export interface Detected {
  ext: string;
  mime: string;
  kind: DetectedKind;
}

const ascii = (buf: Buffer, start: number, str: string) =>
  buf.toString("latin1", start, start + str.length) === str;

/**
 * Detect a file's real type from its magic bytes — never trust the client MIME
 * or extension. Only a strict allowlist of web-safe media passes; SVG and
 * executables are rejected by omission.
 */
export function sniffType(buf: Buffer): Detected | null {
  if (buf.length < 12) return null;

  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { ext: "png", mime: "image/png", kind: "IMAGE" };
  }
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg", kind: "IMAGE" };
  }
  // GIF
  if (ascii(buf, 0, "GIF87a") || ascii(buf, 0, "GIF89a")) {
    return { ext: "gif", mime: "image/gif", kind: "IMAGE" };
  }
  // RIFF / WEBP
  if (ascii(buf, 0, "RIFF") && ascii(buf, 8, "WEBP")) {
    return { ext: "webp", mime: "image/webp", kind: "IMAGE" };
  }
  // ISO-BMFF: ftyp box → AVIF (image) or MP4 (video)
  if (ascii(buf, 4, "ftyp")) {
    const brand = buf.toString("latin1", 8, 12);
    if (brand.includes("avif") || brand.includes("avis")) {
      return { ext: "avif", mime: "image/avif", kind: "IMAGE" };
    }
    return { ext: "mp4", mime: "video/mp4", kind: "VIDEO" };
  }
  // WEBM / Matroska (EBML)
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return { ext: "webm", mime: "video/webm", kind: "VIDEO" };
  }
  return null;
}
