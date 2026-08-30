import { z } from "zod";
import { cssColor } from "@/lib/theme/types";

/** Per-link visual overrides stored in CustomLink.style. */
export const linkStyleSchema = z.object({
  background: cssColor.optional(),
  textColor: cssColor.optional(),
  iconColor: cssColor.optional(),
  border: z.boolean().default(false),
  borderColor: cssColor.optional(),
  animation: z.enum(["none", "pulse", "glow", "shake"]).default("none"),
  hoverAnimation: z.enum(["inherit", "lift", "glow", "scale", "slide"]).default("inherit"),
});

export type LinkStyle = z.infer<typeof linkStyleSchema>;

export const DEFAULT_LINK_STYLE: LinkStyle = linkStyleSchema.parse({});

export function parseLinkStyle(input: unknown): LinkStyle {
  const r = linkStyleSchema.safeParse(input);
  return r.success ? r.data : DEFAULT_LINK_STYLE;
}
