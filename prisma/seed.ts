/**
 * Seed realistic demo data: system badges, feature flags, and several showcase
 * profiles across archetypes (developer, streamer, designer, musician, founder)
 * — each with socials, links, projects, sections, widgets and badges. Also
 * backfills ~30 days of views/clicks for one profile so analytics isn't empty.
 *
 * Idempotent: users/profiles/badges are upserted by their unique keys and child
 * collections are rebuilt. Demo password: "vyperdemo123".
 */
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { THEME_PRESETS } from "../src/lib/theme/presets";
import { DEFAULT_THEME } from "../src/lib/theme/types";
import { parseSocial } from "../src/lib/providers/social";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

const preset = (id: string) =>
  (THEME_PRESETS.find((p) => p.id === id)?.config ?? DEFAULT_THEME) as unknown as Prisma.InputJsonValue;

const avatar = (seed: string) => `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;
const banner = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

interface Demo {
  email: string;
  username: string;
  displayName: string;
  role?: "USER" | "OWNER" | "ADMIN";
  preset: string;
  bio: string;
  location?: string;
  occupation?: string;
  pronouns?: string;
  statusText?: string;
  statusEmoji?: string;
  tags: string[];
  bannerId?: string;
  socials: Array<[string, string]>;
  links: Array<{ title: string; url: string; description?: string; icon?: string }>;
  projects?: Array<{ title: string; description: string; tech: string[]; url?: string; github?: string; cover?: string; featured?: boolean }>;
  sections: Array<{ type: any; title?: string; config?: Prisma.InputJsonValue }>;
  widgets?: Array<{ type: any; config: Prisma.InputJsonValue }>;
  badges: string[];
  views: number;
}

const DEMOS: Demo[] = [
  {
    email: "alex@vyper.lol",
    username: "alex",
    displayName: "Alex Rivera",
    role: "OWNER",
    preset: "midnight",
    bio: "Full-stack engineer building tools for creators. **TypeScript**, Rust, and too much coffee. Currently shipping [Vyper](https://vyper.lol).",
    location: "Berlin, Germany",
    occupation: "Software Engineer",
    pronouns: "he/him",
    statusText: "building the future of bio-links",
    statusEmoji: "⚡",
    tags: ["Developer", "Founder"],
    bannerId: "photo-1526374965328-7f61d4dc18c5",
    socials: [
      ["github", "alexrivera"],
      ["x", "alexbuilds"],
      ["discord", "https://discord.gg/vyper"],
      ["youtube", "alexcodes"],
    ],
    links: [
      { title: "My portfolio", url: "https://example.com", description: "Selected work & case studies" },
      { title: "Book a call", url: "https://cal.com/alex", description: "30 min — let's talk" },
    ],
    projects: [
      { title: "Vyper", description: "The identity platform you're looking at.", tech: ["Next.js", "Prisma", "PostgreSQL"], url: "https://vyper.lol", github: "https://github.com/alexrivera/vyper", cover: banner("photo-1517180102446-f3ece451e9d8"), featured: true },
      { title: "orbit-cli", description: "A blazing-fast deploy CLI written in Rust.", tech: ["Rust", "Tokio"], github: "https://github.com/alexrivera/orbit", cover: banner("photo-1555066931-4365d14bab8c") },
    ],
    sections: [
      { type: "ABOUT" },
      { type: "SOCIALS" },
      { type: "LINKS" },
      { type: "PROJECTS", title: "Projects" },
      { type: "SKILLS", title: "Stack", config: { items: ["TypeScript", "React", "Rust", "PostgreSQL", "Docker", "AWS"] } },
      { type: "WIDGETS", title: "Now" },
    ],
    widgets: [
      { type: "CLOCK", config: { timezone: "Europe/Berlin" } },
      { type: "GITHUB", config: { username: "alexrivera" } },
    ],
    badges: ["founder", "verified", "developer", "early-user"],
    views: 18420,
  },
  {
    email: "luna@vyper.lol",
    username: "luna",
    displayName: "Luna",
    preset: "neon",
    bio: "variety streamer ✦ your favorite gremlin ✦ live most nights",
    statusText: "playing Valorant",
    statusEmoji: "🎮",
    location: "Los Angeles, CA",
    tags: ["Streamer", "Gamer"],
    bannerId: "photo-1542751371-adc38448a05e",
    socials: [
      ["twitch", "lunaplays"],
      ["kick", "luna"],
      ["x", "lunaplays"],
      ["tiktok", "lunaplays"],
      ["discord", "https://discord.gg/luna"],
    ],
    links: [
      { title: "Watch live", url: "https://twitch.tv/lunaplays", description: "Mon–Fri 8pm PT" },
      { title: "Merch store", url: "https://example.com/merch", description: "New drop out now" },
      { title: "Donate", url: "https://ko-fi.com/luna", description: "Support the stream 💜" },
    ],
    sections: [
      { type: "ABOUT" },
      { type: "SOCIALS" },
      { type: "LINKS" },
      { type: "TWITCH", title: "Live", config: { channel: "lunaplays" } },
      { type: "GAMES", title: "Favorite games", config: { items: [{ name: "Valorant" }, { name: "Minecraft" }, { name: "Stardew Valley" }, { name: "Elden Ring" }] } },
    ],
    widgets: [{ type: "TWITCH", config: { channel: "lunaplays" } }],
    badges: ["verified", "creator", "supporter"],
    views: 42310,
  },
  {
    email: "nova@vyper.lol",
    username: "nova",
    displayName: "Nova Chen",
    preset: "glass",
    bio: "Product designer & illustrator. I make interfaces feel *inevitable*.",
    occupation: "Product Designer",
    pronouns: "she/her",
    location: "Singapore",
    statusText: "open to freelance",
    statusEmoji: "🎨",
    tags: ["Designer", "Artist"],
    bannerId: "photo-1550859492-d5da9d8e45f3",
    socials: [
      ["instagram", "novadesigns"],
      ["x", "novadesigns"],
      ["linkedin", "novachen"],
      ["email", "hello@nova.design"],
    ],
    links: [
      { title: "Design portfolio", url: "https://example.com", description: "Case studies & shots" },
      { title: "Hire me", url: "https://example.com/contact" },
    ],
    projects: [
      { title: "Aperture", description: "A design system for fintech.", tech: ["Figma", "Design Systems"], cover: banner("photo-1561070791-2526d30994b5"), featured: true },
    ],
    sections: [
      { type: "ABOUT" },
      { type: "SOCIALS" },
      { type: "PROJECTS", title: "Selected work" },
      { type: "LINKS" },
    ],
    badges: ["verified", "creator"],
    views: 9875,
  },
  {
    email: "kai@vyper.lol",
    username: "kai",
    displayName: "kai",
    preset: "sunset",
    bio: "lo-fi & synthwave producer 🌆 new EP out now",
    statusText: "in the studio",
    statusEmoji: "🎧",
    tags: ["Music", "Creator"],
    bannerId: "photo-1470225620780-dba8ba36b745",
    socials: [
      ["spotify", "https://open.spotify.com/artist/1vCWHaC5f2uS3yhpwWbIA6"],
      ["soundcloud", "kaimusic"],
      ["youtube", "kaimusic"],
      ["instagram", "kai.wav"],
    ],
    links: [{ title: "Listen everywhere", url: "https://example.com/listen", description: "Spotify, Apple, YouTube" }],
    sections: [
      { type: "ABOUT" },
      { type: "SOCIALS" },
      { type: "SPOTIFY", title: "Latest release", config: { url: "https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3" } },
      { type: "LINKS" },
    ],
    badges: ["creator", "early-user"],
    views: 15600,
  },
  {
    email: "sam@vyper.lol",
    username: "sam",
    displayName: "Sam Okafor",
    preset: "cyber",
    bio: "security researcher // breaking things so you don't have to",
    occupation: "Security Engineer",
    location: "Remote",
    tags: ["Developer", "Student"],
    socials: [
      ["github", "samok"],
      ["x", "sam_sec"],
      ["linkedin", "samokafor"],
    ],
    links: [
      { title: "Blog", url: "https://example.com/blog", description: "Write-ups & CTF notes" },
      { title: "Resume", url: "https://example.com/cv.pdf" },
    ],
    sections: [
      { type: "ABOUT" },
      { type: "SOCIALS" },
      { type: "LINKS" },
      { type: "SKILLS", title: "Focus", config: { items: ["Web security", "Reverse engineering", "Go", "Python"] } },
    ],
    badges: ["developer"],
    views: 7240,
  },
];

const SYSTEM_BADGES = [
  { key: "verified", type: "VERIFIED" as const, name: "Verified", icon: "badge-check", color: "#3b82f6", glow: false, order: 0 },
  { key: "founder", type: "FOUNDER" as const, name: "Founder", icon: "crown", color: "#f59e0b", glow: true, order: 1 },
  { key: "early-user", type: "EARLY_USER" as const, name: "Early User", icon: "sparkles", color: "#a78bfa", glow: false, order: 2 },
  { key: "developer", type: "DEVELOPER" as const, name: "Developer", icon: "code", color: "#22d3ee", glow: false, order: 3 },
  { key: "creator", type: "CREATOR" as const, name: "Creator", icon: "palette", color: "#ec4899", glow: false, order: 4 },
  { key: "staff", type: "STAFF" as const, name: "Staff", icon: "shield", color: "#7c5cff", glow: true, order: 5 },
  { key: "supporter", type: "SUPPORTER" as const, name: "Supporter", icon: "heart", color: "#f43f5e", glow: false, order: 6 },
];

const FLAGS = [
  { key: "marketplace", enabled: false, description: "Theme & preset marketplace" },
  { key: "custom-domains", enabled: false, description: "Custom domain support" },
  { key: "follows", enabled: true, description: "Follow profiles" },
  { key: "beta-widgets", enabled: false, description: "Experimental widgets" },
];

async function main() {
  console.log("• Seeding badges & feature flags…");
  for (const b of SYSTEM_BADGES) {
    await prisma.badge.upsert({ where: { key: b.key }, update: b, create: b });
  }
  for (const f of FLAGS) {
    await prisma.featureFlag.upsert({ where: { key: f.key }, update: f, create: f });
  }

  const passwordHash = await bcrypt.hash("vyperdemo123", 12);
  const badgeByKey = new Map(
    (await prisma.badge.findMany()).map((b) => [b.key, b.id] as const),
  );

  for (const d of DEMOS) {
    console.log(`• Seeding @${d.username}…`);
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: { role: d.role ?? "USER", displayName: d.displayName },
      create: {
        email: d.email,
        passwordHash,
        role: d.role ?? "USER",
        emailVerified: new Date(),
        displayName: d.displayName,
        avatarUrl: avatar(d.username),
      },
    });

    const profile = await prisma.profile.upsert({
      where: { username: d.username },
      update: {
        displayName: d.displayName,
        bio: d.bio,
        location: d.location,
        occupation: d.occupation,
        pronouns: d.pronouns,
        statusText: d.statusText,
        statusEmoji: d.statusEmoji,
        tags: d.tags,
        avatarUrl: avatar(d.username),
        bannerUrl: d.bannerId ? banner(d.bannerId) : null,
        isPublished: true,
        isDefault: true,
        viewCount: d.views,
      },
      create: {
        userId: user.id,
        username: d.username,
        displayName: d.displayName,
        bio: d.bio,
        location: d.location,
        occupation: d.occupation,
        pronouns: d.pronouns,
        statusText: d.statusText,
        statusEmoji: d.statusEmoji,
        tags: d.tags,
        avatarUrl: avatar(d.username),
        bannerUrl: d.bannerId ? banner(d.bannerId) : null,
        isPublished: true,
        isDefault: true,
        viewCount: d.views,
      },
    });

    await prisma.profileTheme.upsert({
      where: { profileId: profile.id },
      update: { config: preset(d.preset), preset: d.preset },
      create: { profileId: profile.id, config: preset(d.preset), preset: d.preset },
    });
    await prisma.profileSettings.upsert({
      where: { profileId: profile.id },
      update: {},
      create: { profileId: profile.id },
    });

    // Rebuild child collections.
    await prisma.$transaction([
      prisma.profileSection.deleteMany({ where: { profileId: profile.id } }),
      prisma.socialLink.deleteMany({ where: { profileId: profile.id } }),
      prisma.customLink.deleteMany({ where: { profileId: profile.id } }),
      prisma.project.deleteMany({ where: { profileId: profile.id } }),
      prisma.widget.deleteMany({ where: { profileId: profile.id } }),
    ]);

    await prisma.profileSection.createMany({
      data: d.sections.map((s, i) => ({
        profileId: profile.id,
        type: s.type,
        title: s.title ?? null,
        position: i,
        config: s.config ?? {},
      })),
    });

    await prisma.socialLink.createMany({
      data: d.socials
        .map(([provider, input], i) => {
          const parsed = parseSocial(provider, input);
          if (!parsed) return null;
          return { profileId: profile.id, provider, username: parsed.username, url: parsed.url, position: i };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    });

    await prisma.customLink.createMany({
      data: d.links.map((l, i) => ({
        profileId: profile.id,
        title: l.title,
        url: l.url,
        description: l.description ?? null,
        icon: l.icon ?? null,
        position: i,
        clicks: Math.floor(Math.random() * 800),
        uniqueClicks: Math.floor(Math.random() * 400),
      })),
    });

    for (const [i, p] of (d.projects ?? []).entries()) {
      await prisma.project.create({
        data: {
          profileId: profile.id,
          slug: slugify(p.title),
          title: p.title,
          description: p.description,
          technologies: p.tech,
          url: p.url ?? null,
          githubUrl: p.github ?? null,
          coverUrl: p.cover ?? null,
          featured: p.featured ?? false,
          position: i,
          status: "COMPLETED",
        },
      });
    }

    if (d.widgets?.length) {
      await prisma.widget.createMany({
        data: d.widgets.map((w, i) => ({ profileId: profile.id, type: w.type, config: w.config, position: i })),
      });
    }

    for (const key of d.badges) {
      const badgeId = badgeByKey.get(key);
      if (!badgeId) continue;
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId } },
        update: {},
        create: { userId: user.id, badgeId, grantedById: user.id },
      });
    }
  }

  // Backfill ~30 days of analytics for @alex so charts render real data.
  const alex = await prisma.profile.findUnique({ where: { username: "alex" }, include: { customLinks: true } });
  if (alex) {
    await prisma.profileView.deleteMany({ where: { profileId: alex.id } });
    await prisma.analyticsEvent.deleteMany({ where: { profileId: alex.id } });
    const devices = ["Desktop", "Mobile", "Tablet"];
    const countries = ["DE", "US", "FR", "GB", "JP", "BR", "CA", "IN"];
    const views: Prisma.ProfileViewCreateManyInput[] = [];
    const events: Prisma.AnalyticsEventCreateManyInput[] = [];
    for (let day = 30; day >= 0; day--) {
      const count = 30 + Math.floor(Math.random() * 90);
      for (let i = 0; i < count; i++) {
        const createdAt = new Date(Date.now() - day * 86400000 - Math.floor(Math.random() * 86400000));
        const country = countries[Math.floor(Math.random() * countries.length)];
        const device = devices[Math.floor(Math.random() * devices.length)];
        views.push({ profileId: alex.id, visitorHash: `seed-${day}-${i}`, country, device, createdAt });
        events.push({ profileId: alex.id, type: "VIEW", country, device, createdAt });
      }
    }
    await prisma.profileView.createMany({ data: views });
    await prisma.analyticsEvent.createMany({ data: events });
    console.log(`• Backfilled ${views.length} views for @alex`);
  }

  console.log("\n✔ Seed complete. Demo login: alex@vyper.lol / vyperdemo123\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
