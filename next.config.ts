import type { NextConfig } from "next";

/**
 * Provider CDNs the platform legitimately embeds images from.
 * Arbitrary user images are expected to flow through Vyper's own media host
 * (see `/i/[key]`), which keeps the Next image optimizer from acting as an
 * open proxy while still supporting rich, personalizable profiles.
 */
const PROVIDER_IMAGE_HOSTS = [
  "cdn.discordapp.com",
  "media.discordapp.net",
  "avatars.githubusercontent.com",
  "raw.githubusercontent.com",
  "lh3.googleusercontent.com",
  "i.scdn.co",
  "mosaic.scdn.co",
  "static-cdn.jtvnw.net",
  "avatars.steamstatic.com",
  "cdn.cloudflare.steamstatic.com",
  "community.cloudflare.steamstatic.com",
  "i.ytimg.com",
  "yt3.ggpht.com",
  "tr.rbxcdn.com",
  "images.unsplash.com",
];

// Optionally trust an app-configured CDN/public bucket host.
const cdnHosts: string[] = [];
for (const key of ["NEXT_PUBLIC_CDN_URL", "S3_PUBLIC_URL", "NEXT_PUBLIC_APP_URL"]) {
  const raw = process.env[key];
  if (!raw) continue;
  try {
    cdnHosts.push(new URL(raw).hostname);
  } catch {
    /* ignore malformed env url */
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  // Keep native / heavy server deps out of the bundle.
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "bcryptjs",
    "sharp",
    "ioredis",
    "nodemailer",
    "@aws-sdk/client-s3",
    "embedded-postgres",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: false,
    remotePatterns: [
      ...PROVIDER_IMAGE_HOSTS.map((hostname) => ({
        protocol: "https" as const,
        hostname,
      })),
      ...cdnHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
      { protocol: "http" as const, hostname: "localhost" },
      { protocol: "http" as const, hostname: "127.0.0.1" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
