import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

interface RegisterVerifyBody {
  credential: unknown;
  deviceLabel?: string;
}

/** POST /api/biometric/register/verify — verify WebAuthn enrollment + log in. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as RegisterVerifyBody | null;
  if (!body || !body.credential) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const { finishRegistration } = await import("@/lib/mawj/webauthn");
  const result = await finishRegistration(
    req,
    body.credential as never,
    body.deviceLabel || "WebAuthn device"
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  // Record a successful login event (audit trail).
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
  return NextResponse.json({ ok: true, profile_id: PROFILE_ID });
}
