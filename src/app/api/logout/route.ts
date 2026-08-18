import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/mawj/session";

export const dynamic = "force-dynamic";

/** POST /api/logout — terminate the session. */
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
