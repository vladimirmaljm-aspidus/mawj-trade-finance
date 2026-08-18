import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

interface PasscodeBody {
  passcode?: string;
}

/**
 * POST /api/passcode — fallback login for devices without WebAuthn.
 * Verifies against the DEMO_PASSCODE env var, then issues a session cookie.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as PasscodeBody | null;
  const expected = process.env.DEMO_PASSCODE;
  if (!expected) {
    return NextResponse.json({ error: "passcode_disabled" }, { status: 503 });
  }
  if (!body?.passcode || body.passcode !== expected) {
    const supabase = getSupabase();
    await supabase.from("login_events").insert({
      profile_id: PROFILE_ID,
      method: "passcode",
      success: false,
      device: "Unknown",
      location: null,
      ip: req.headers.get("x-forwarded-for") || null,
    });
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }
  await setSessionCookie("passcode");
  const supabase = getSupabase();
  await supabase.from("login_events").insert({
    profile_id: PROFILE_ID,
    method: "passcode",
    success: true,
    device: "Manual access code",
    location: null,
    ip: req.headers.get("x-forwarded-for") || null,
  });
  return NextResponse.json({ ok: true });
}
