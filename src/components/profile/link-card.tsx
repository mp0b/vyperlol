import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { RenderCustomLink } from "@/lib/profile/types";

/**
 * A single profile link. The href points at /l/[id] which records the click
 * server-side and 302-redirects to the destination, so click analytics work
 * without any client JS.
 */
export function LinkCard({
  link,
  defaultHover,
}: {
  link: RenderCustomLink;
  defaultHover: string;
}) {
  const s = link.style;
  const hover = s.hoverAnimation === "inherit" ? defaultHover : s.hoverAnimation;

  const style: CSSProperties = {};
  if (s.background) style.background = s.background;
  if (s.textColor) style.color = s.textColor;
  if (s.border) style.border = `1px solid ${s.borderColor ?? "currentColor"}`;

  return (
    <a
      className="vy-link"
      data-hover={hover}
      data-anim={s.animation}
      style={style}
      href={`/l/${link.id}`}
      target="_blank"
      rel="noopener noreferrer nofollow ugc"
    >
      {link.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="vy-link-thumb" src={link.imageUrl} alt="" loading="lazy" />
      ) : link.icon ? (
        <span className="vy-link-icon" aria-hidden>
          {link.icon}
        </span>
      ) : null}
      <span className="vy-link-body">
        <span className="vy-link-title">{link.title}</span>
        {link.description ? <span className="vy-link-desc">{link.description}</span> : null}
      </span>
      <ArrowUpRight className="vy-link-arrow" size={16} aria-hidden />
    </a>
  );
}
