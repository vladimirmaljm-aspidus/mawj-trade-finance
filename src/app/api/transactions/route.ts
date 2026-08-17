import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";
import { generateReference } from "@/lib/mawj/format";

export const dynamic = "force-dynamic";

/** GET /api/transactions — all transactions (optionally filtered by type). */
export async function GET(req: NextRequest) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // income | expense

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("profile_id", PROFILE_ID)
    .order("occurred_at", { ascending: false });
  if (type === "income" || type === "expense") {
    query = query.eq("type", type);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    transactions: (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) })),
  });
}

/** POST /api/transactions — execute a new outgoing transfer. */
export async function POST(req: NextRequest) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad_body" }, { status: 400 });
  const { recipient, iban, amount, method, memo } = body as {
    recipient?: string;
    iban?: string;
    amount?: number;
    method?: "SEPA" | "SWIFT" | "LOCAL";
    memo?: string;
  };

  if (!recipient || !recipient.trim())
    return NextResponse.json({ error: "Recipient is required." }, { status: 422 });
  if (!amount || amount <= 0)
    return NextResponse.json({ error: "Enter a valid amount." }, { status: 422 });
  const transferMethod = method ?? "SEPA";

  const supabase = getSupabase();

  // Load the primary account and check funds.
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, balance")
    .eq("profile_id", PROFILE_ID)
    .eq("is_primary", true)
    .limit(1);
  const primary = accounts?.[0];
  if (!primary) return NextResponse.json({ error: "no_primary_account" }, { status: 500 });

  const balance = Number(primary.balance);
  if (amount > balance) {
    return NextResponse.json(
      { error: "Insufficient liquidity for this transfer." },
      { status: 422 }
    );
  }

  // Insert the transaction (expense).
  const occurredAt = new Date();
  const reference = generateReference();
  const initials = recipient.trim().substring(0, 2).toUpperCase();

  const { data: inserted, error: insErr } = await supabase
    .from("transactions")
    .insert({
      profile_id: PROFILE_ID,
      account_id: primary.id,
      type: "expense",
      counterparty: recipient.trim(),
      category:
        transferMethod === "SEPA"
          ? "SEPA Transfer"
          : transferMethod === "SWIFT"
            ? "SWIFT Transfer"
            : "Local Transfer",
      amount,
      currency: "EUR",
      occurred_at: occurredAt.toISOString(),
      method: transferMethod,
      reference,
      status: "Settled",
      logo: initials,
      color_tone: "slate",
      memo: memo || null,
    })
    .select("*")
    .single();

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  // Debit the primary account.
  const newBalance = balance - amount;
  await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", primary.id);

  return NextResponse.json({
    ok: true,
    transaction: { ...inserted, amount: Number(inserted.amount) },
    balance: newBalance,
  });
}
