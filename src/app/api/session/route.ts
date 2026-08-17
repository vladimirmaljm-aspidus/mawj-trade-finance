import { NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

/** Returns whether the caller has a valid session, plus a minimal profile. */
export async function GET() {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  const supabase = getSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_name, role")
    .eq("id", PROFILE_ID)
    .single();
  return NextResponse.json({
    authenticated: true,
    method: session.method,
    profile,
  });
}
