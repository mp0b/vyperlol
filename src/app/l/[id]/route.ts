import { NextResponse, type NextRequest } from "next/server";
import { getRequestMeta } from "@/lib/request";
import { recordLinkClick } from "@/lib/analytics/record";

/**
 * Link click tracker: records the click, then 302-redirects to the (validated)
 * destination. Works with no client JS.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const meta = await getRequestMeta();
  const url = await recordLinkClick(id, meta);

  const home = new URL("/", req.url);
  if (!url) return NextResponse.redirect(home);

  try {
    const target = new URL(url);
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return NextResponse.redirect(home);
    }
    return NextResponse.redirect(target.toString(), { status: 302 });
  } catch {
    return NextResponse.redirect(home);
  }
}
