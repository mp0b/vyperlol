import "server-only";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { env } from "@/lib/env";

/**
 * Storage abstraction. Local driver (dev) writes to disk and serves via /i/[key];
 * S3 driver (prod) targets any S3-compatible bucket (S3, R2, MinIO). Originals
 * are stored byte-for-byte — no re-compression — with only thumbnails derived.
 */
export interface StoredObject {
  key: string;
  url: string;
}

// Lazy-resolve to avoid Next.js static analysis tracing the entire project tree.
let _localRoot: string | undefined;
function getLocalRoot(): string {
  if (!_localRoot) {
    _localRoot = join(/*turbopackIgnore: true*/ process.cwd(), env.LOCAL_STORAGE_DIR);
  }
  return _localRoot;
}

function localPath(key: string): string {
  const root = getLocalRoot();
  // key is server-generated (safe chars only); still guard against traversal.
  const safe = key.replace(/[^a-zA-Z0-9._/-]/g, "");
  const full = join(/*turbopackIgnore: true*/ root, safe);
  if (!full.startsWith(root)) throw new Error("Invalid storage key");
  return full;
}

export function publicUrl(key: string): string {
  if (env.STORAGE_DRIVER === "s3") {
    const base = (env.S3_PUBLIC_URL ?? "").replace(/\/$/, "");
    return `${base}/${key}`;
  }
  return `/i/${key}`;
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<StoredObject> {
  if (env.STORAGE_DRIVER === "s3") {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: Boolean(env.S3_ENDPOINT),
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY ?? "",
        secretAccessKey: env.S3_SECRET_KEY ?? "",
      },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return { key, url: publicUrl(key) };
  }

  const path = localPath(key);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, body);
  return { key, url: publicUrl(key) };
}

export async function getLocalObject(key: string): Promise<Buffer> {
  return readFile(localPath(key));
}

export async function deleteObject(key: string): Promise<void> {
  if (env.STORAGE_DRIVER === "s3") {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: Boolean(env.S3_ENDPOINT),
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY ?? "",
        secretAccessKey: env.S3_SECRET_KEY ?? "",
      },
    });
    await client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
    return;
  }
  try {
    await unlink(localPath(key));
  } catch {
    /* already gone */
  }
}

export { getLocalRoot, localPath };
