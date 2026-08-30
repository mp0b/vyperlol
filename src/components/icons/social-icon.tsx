import {
  SiDiscord,
  SiGithub,
  SiYoutube,
  SiTwitch,
  SiTiktok,
  SiInstagram,
  SiX,
  SiTelegram,
  SiSpotify,
  SiSteam,
  SiRoblox,
  SiReddit,
  SiKick,
  SiSoundcloud,
  SiApplemusic,
  SiFacebook,
  SiThreads,
  SiPatreon,
  SiKofi,
  SiBuymeacoffee,
  SiPaypal,
  SiCashapp,
  SiBitcoin,
} from "@icons-pack/react-simple-icons";
import { Linkedin, Mail, Link2 } from "lucide-react";
import type { ComponentType } from "react";

type IconProps = { size?: number; color?: string; className?: string; title?: string };

/**
 * Brand icons come from simple-icons; LinkedIn and generic email aren't in that
 * set (brand policy), so they fall back to Lucide. Unknown providers get a
 * neutral link glyph, so the registry can grow without breaking the UI.
 */
const SIMPLE: Record<string, ComponentType<IconProps>> = {
  discord: SiDiscord,
  github: SiGithub,
  youtube: SiYoutube,
  twitch: SiTwitch,
  tiktok: SiTiktok,
  instagram: SiInstagram,
  x: SiX,
  telegram: SiTelegram,
  spotify: SiSpotify,
  steam: SiSteam,
  roblox: SiRoblox,
  reddit: SiReddit,
  kick: SiKick,
  soundcloud: SiSoundcloud,
  applemusic: SiApplemusic,
  facebook: SiFacebook,
  threads: SiThreads,
  patreon: SiPatreon,
  kofi: SiKofi,
  buymeacoffee: SiBuymeacoffee,
  paypal: SiPaypal,
  cashapp: SiCashapp,
  bitcoin: SiBitcoin,
};

export function SocialIcon({
  slug,
  size = 20,
  color,
  className,
}: {
  slug: string;
  size?: number;
  color?: string;
  className?: string;
}) {
  if (slug === "linkedin") return <Linkedin size={size} color={color} className={className} />;
  if (slug === "email") return <Mail size={size} color={color} className={className} />;
  const C = SIMPLE[slug];
  if (!C) return <Link2 size={size} color={color} className={className} />;
  return <C size={size} color={color} className={className} />;
}
