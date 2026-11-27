import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";
import { generateReference } from "@/lib/mawj/format";
import { WORK_CATEGORIES } from "@/lib/mawj/workbench";

export const dynamic = "force-dynamic";

/** GET /api/transactions — statement transactions (optionally filtered by type). */
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
    .not("category", "in", `(${WORK_CATEGORIES.map((c) => `"${c}"`).join(",")})`)
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

/**
 * POST /api/transactions — execute a new outgoing transfer.
 *
 * Blocked while a compliance case is active (server-side enforcement of the
 * funds-blocked scenario). Debits the selected account (any currency).
 */
export async function POST(req: NextRequest) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad_body" }, { status: 400 });
  const { recipient, iban, amount, method, memo, fromAccountId } = body as {
    recipient?: string;
    iban?: string;
    amount?: number;
    method?: "SEPA" | "SWIFT" | "LOCAL";
    memo?: string;
    fromAccountId?: string;
  };

  if (!recipient || !recipient.trim())
    return NextResponse.json({ error: "Recipient is required." }, { status: 422 });
  if (!amount || amount <= 0)
    return NextResponse.json({ error: "Enter a valid amount." }, { status: 422 });
  const transferMethod = method ?? "SEPA";

  const supabase = getSupabase();

  // Compliance gate — outgoing transfers are suspended while the case is active.
  const { data: activeCase } = await supabase
    .from("compliance_cases")
    .select("case_reference")
    .eq("profile_id", PROFILE_ID)
    .eq("status", "Awaiting Documents")
    .limit(1)
    .maybeSingle();
  if (activeCase) {
    return NextResponse.json(
      { error: `Transfers suspended — compliance case ${activeCase.case_reference} active.` },
      { status: 403 }
    );
  }

  // Load the debit account (selected, or the primary account).
  const accQuery = fromAccountId
    ? supabase
        .from("accounts")
        .select("id, balance, currency, is_primary")
        .eq("id", fromAccountId)
        .eq("profile_id", PROFILE_ID)
        .limit(1)
    : supabase
        .from("accounts")
        .select("id, balance, currency, is_primary")
        .eq("profile_id", PROFILE_ID)
        .eq("is_primary", true)
        .limit(1);
  const { data: accounts } = await accQuery;
  const account = accounts?.[0];
  if (!account) return NextResponse.json({ error: "no_account" }, { status: 500 });

  const balance = Number(account.balance);
  if (amount > balance) {
    return NextResponse.json(
      { error: "Insufficient liquidity for this transfer." },
      { status: 422 }
    );
  }

  // Insert the transaction (expense) in the account's currency.
  const occurredAt = new Date();
  const reference = generateReference();
  const initials = recipient.trim().substring(0, 2).toUpperCase();

  const { data: inserted, error: insErr } = await supabase
    .from("transactions")
    .insert({
      profile_id: PROFILE_ID,
      account_id: account.id,
      type: "expense",
      counterparty: recipient.trim(),
      category:
        transferMethod === "SEPA"
          ? "SEPA Transfer"
          : transferMethod === "SWIFT"
            ? "SWIFT Transfer"
            : "Local Transfer",
      amount,
      currency: account.currency,
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

  // Debit the account.
  const newBalance = balance - amount;
  await supabase.from("accounts").update({ balance: newBalance }).eq("id", account.id);

  return NextResponse.json({
    ok: true,
    transaction: { ...inserted, amount: Number(inserted.amount) },
    balance: newBalance,
    accountPrimary: Boolean(account.is_primary),
  });
}
