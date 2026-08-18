import { NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

/** GET /api/me — full dashboard payload for the authenticated signatory. */
export async function GET() {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();

  const [profileRes, accountsRes, cardsRes, beneficiariesRes, fxRes, txRes, logRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", PROFILE_ID).single(),
      supabase
        .from("accounts")
        .select("*")
        .eq("profile_id", PROFILE_ID)
        .order("is_primary", { ascending: false }),
      supabase.from("cards").select("*").eq("profile_id", PROFILE_ID),
      supabase
        .from("beneficiaries")
        .select("*")
        .eq("profile_id", PROFILE_ID)
        .order("name"),
      supabase.from("fx_rates").select("*"),
      supabase
        .from("transactions")
        .select("*")
        .eq("profile_id", PROFILE_ID)
        .order("occurred_at", { ascending: false }),
      supabase
        .from("login_events")
        .select("*")
        .eq("profile_id", PROFILE_ID)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  if (profileRes.error) {
    return NextResponse.json({ error: "profile_not_found" }, { status: 500 });
  }

  const primary = accountsRes.data?.find((a) => a.is_primary) ?? accountsRes.data?.[0];
  const balance = primary ? Number(primary.balance) : 0;

  return NextResponse.json({
    session,
    profile: profileRes.data,
    accounts: accountsRes.data ?? [],
    cards: cardsRes.data ?? [],
    beneficiaries: beneficiariesRes.data ?? [],
    fxRates: fxRes.data ?? [],
    transactions: (txRes.data ?? []).map((t) => ({
      ...t,
      amount: Number(t.amount),
    })),
    loginEvents: logRes.data ?? [],
    balance,
  });
}
