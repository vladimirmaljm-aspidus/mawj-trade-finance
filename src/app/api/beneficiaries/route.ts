import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

/** GET /api/beneficiaries — the saved beneficiary list. */
export async function GET() {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("profile_id", PROFILE_ID)
    .order("name");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ beneficiaries: data ?? [] });
}

/**
 * POST /api/beneficiaries — create a NEW-beneficiary activation REQUEST.
 * The beneficiary itself is inserted only when a checker approves the request
 * (see PATCH /api/approvals). Body: { name, iban, country, method, note }
 */
export async function POST(req: NextRequest) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const { name, iban, country, method, note } = (body ?? {}) as {
    name?: string;
    iban?: string;
    country?: string;
    method?: string;
    note?: string;
  };
  if (!name?.trim() || !iban?.trim()) {
    return NextResponse.json({ error: "Name and IBAN are required." }, { status: 422 });
  }
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const initials = name.trim().slice(0, 2).toUpperCase();
  const transferMethod = method ?? "LOCAL";

  const { data: inserted, error } = await supabase
    .from("transactions")
    .insert({
      profile_id: PROFILE_ID,
      account_id: null,
      type: "expense",
      counterparty: name.trim(),
      category: "Beneficiary Activation",
      amount: 0,
      currency: "AED",
      occurred_at: now,
      method: transferMethod,
      reference: `APR-${Math.floor(100000 + Math.random() * 899999)}`,
      status: "Pending Approval",
      logo: initials,
      color_tone: "slate",
      memo: JSON.stringify({
        kind: "beneficiary",
        maker: "V. Maljm",
        submitted: now,
        beneficiary: name.trim(),
        iban: iban.trim().toUpperCase(),
        country: country?.trim() || "United Arab Emirates",
        method: transferMethod,
        note: note?.trim() || null,
      }),
    })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, item: { ...inserted, amount: Number(inserted.amount) } });
}

/** DELETE /api/beneficiaries?id= — remove a saved beneficiary. */
export async function DELETE(req: NextRequest) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const supabase = getSupabase();
  const { error } = await supabase
    .from("beneficiaries")
    .delete()
    .eq("id", id)
    .eq("profile_id", PROFILE_ID);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
