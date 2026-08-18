import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

/** GET /api/biometric/register/options — start WebAuthn enrollment. */
export async function GET(req: NextRequest) {
  // Allow even without a session, but record the device for the demo profile.
  const supabase = getSupabase();
  const { count } = await supabase
    .from("webauthn_credentials")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", PROFILE_ID);
  const alreadyEnrolled = (count ?? 0) > 0;

  const { beginRegistration } = await import("@/lib/mawj/webauthn");
  try {
    const options = await beginRegistration(req);
    return NextResponse.json({ options, alreadyEnrolled });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
