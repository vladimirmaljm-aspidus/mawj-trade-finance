import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

interface AuthVerifyBody {
  credential: unknown;
  deviceLabel?: string;
}

/** POST /api/biometric/auth/verify — verify WebAuthn assertion + log in. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as AuthVerifyBody | null;
  if (!body || !body.credential) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const { finishAuthentication } = await import("@/lib/mawj/webauthn");
  const result = await finishAuthentication(req, body.credential as never);
  if (!result.ok) {
    // Record a failed attempt (audit trail) for credibility.
    const supabase = getSupabase();
    await supabase.from("login_events").insert({
      profile_id: PROFILE_ID,
      method: "biometric",
      success: false,
      device: body.deviceLabel || "WebAuthn device",
      location: null,
      ip: req.headers.get("x-forwarded-for") || null,
    });
    return NextResponse.json({ error: result.reason }, { status: 401 });
  }

  const supabase = getSupabase();
  await supabase.from("login_events").insert({
    profile_id: PROFILE_ID,
    method: "biometric",
    success: true,
    device: body.deviceLabel || "WebAuthn device",
    location: null,
    ip: req.headers.get("x-forwarded-for") || null,
  });

  await setSessionCookie("webauthn");
  return NextResponse.json({ ok: true });
}
