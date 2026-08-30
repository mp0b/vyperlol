"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { SocialIcon } from "@/components/icons/social-icon";
import { getSocialProvider } from "@/lib/providers/social";
import type { RenderSocialLink } from "@/lib/profile/types";

export function SocialLinks({ links }: { links: RenderSocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="vy-socials">
      {links.map((link) => (
        <SocialItem key={link.id} link={link} />
      ))}
    </div>
  );
}

function SocialItem({ link }: { link: RenderSocialLink }) {
  const provider = getSocialProvider(link.provider);
  const [copied, setCopied] = useState(false);
  const iconSlug = provider?.icon ?? "link";
  const label = provider?.label ?? link.provider;

  // Copy-only providers (crypto) have no destination URL.
  if (!link.url) {
    const value = link.username ?? "";
    return (
      <button
        type="button"
        className="vy-social"
        title={`${label}: ${value} (click to copy)`}
        aria-label={`Copy ${label}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          } catch {
            /* clipboard blocked */
          }
        }}
      >
        {copied ? <Check size={22} /> : <SocialIcon slug={iconSlug} size={22} />}
      </button>
    );
  }

  return (
    <a
      className="vy-social"
      href={link.url}
      target="_blank"
      rel="noopener noreferrer nofollow ugc"
      title={label}
      aria-label={label}
    >
      <SocialIcon slug={iconSlug} size={22} />
    </a>
  );
}
