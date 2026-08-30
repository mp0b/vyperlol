import { NextResponse, type NextRequest } from "next/server";
import { validateUsernameFormat } from "@/lib/username";
import { isUsernameAvailable } from "@/lib/username-server";
import { getRequestMeta } from "@/lib/request";
import { limiters } from "@/lib/rate-limit";

/** Real-time username availability check for the register/onboarding forms. */
export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u") ?? "";
  const meta = await getRequestMeta();
  const rl = await limiters.usernameCheck(meta.ipHash);
  if (!rl.success) {
    return NextResponse.json({ available: false, reason: "Slow down a moment." }, { status: 429 });
  }
  const fmt = validateUsernameFormat(u);
  if (!fmt.ok) return NextResponse.json({ available: false, reason: fmt.reason });
  const available = await isUsernameAvailable(u);
  return NextResponse.json({
    available,
    reason: available ? null : "That username is taken.",
  });
}
