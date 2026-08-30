import "server-only";
import { z } from "zod";

/**
 * Server-side environment. Parsed once. Optional integrations degrade
 * gracefully (in-memory cache/rate-limit, local storage, console email) so the
 * app boots with zero external services in development.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  APP_NAME: z.string().default("Vyper"),
  APP_URL: z.string().url().default("http://localhost:3000"),

  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),

  ADMIN_EMAILS: z.string().default(""),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  RATE_LIMIT_DRIVER: z.enum(["memory", "redis"]).default("memory"),
  CACHE_DRIVER: z.enum(["memory", "redis"]).default("memory"),
  REDIS_URL: z.string().optional(),

  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  LOCAL_STORAGE_DIR: z.string().default("./.storage"),
  UPLOAD_MAX_MB: z.coerce.number().int().positive().default(25),

  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),

  EMAIL_DRIVER: z.enum(["console", "smtp"]).default("console"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Vyper <no-reply@vyper.lol>"),

  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  ENABLED_FEATURES: z.string().default(""),
});

function load() {
  const parsed = schema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // Accept the legacy NextAuth name as a fallback.
    AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    DATABASE_URL: process.env.DATABASE_URL,
    RATE_LIMIT_DRIVER: process.env.RATE_LIMIT_DRIVER,
    CACHE_DRIVER: process.env.CACHE_DRIVER,
    REDIS_URL: process.env.REDIS_URL,
    STORAGE_DRIVER: process.env.STORAGE_DRIVER,
    LOCAL_STORAGE_DIR: process.env.LOCAL_STORAGE_DIR,
    UPLOAD_MAX_MB: process.env.UPLOAD_MAX_MB,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
    EMAIL_DRIVER: process.env.EMAIL_DRIVER,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    ENABLED_FEATURES: process.env.ENABLED_FEATURES,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

export const env = load();

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";

export const adminEmails = env.ADMIN_EMAILS.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const envEnabledFeatures = env.ENABLED_FEATURES.split(",")
  .map((f) => f.trim())
  .filter(Boolean);

/** Whether a given OAuth provider is configured. */
export function oauthConfigured(provider: "discord" | "github" | "google"): boolean {
  switch (provider) {
    case "discord":
      return Boolean(env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET);
    case "github":
      return Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
    case "google":
      return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  }
}
