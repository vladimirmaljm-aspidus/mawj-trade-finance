import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";
import { parseWorkMemo, workRef, CHECKER } from "@/lib/mawj/workbench";

export const dynamic = "force-dynamic";

const APPROVAL_CATEGORIES = ["Approval", "Beneficiary Activation", "Cheque Book", "Stop Cheque"];

/** GET /api/approvals — queue + decision history. */
export async function GET() {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("profile_id", PROFILE_ID)
    .in("category", APPROVAL_CATEGORIES)
    .order("occurred_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    items: (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) })),
  });
}

/**
 * POST /api/approvals — submit a new request into the maker-checker queue.
 * Body: { kind: "payment" | "beneficiary" | "chequebook" | "stopcheque", payload: {...} }
 */
export async function POST(req: NextRequest) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const { kind, payload } = (body ?? {}) as {
    kind?: string;
    payload?: Record<string, unknown>;
  };
  if (!kind || !payload) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  let category: string;
  let counterparty: string;
  let amount = 0;
  let currency = "AED";
  let accountId: string | null = null;
  let method = "LOCAL";
  let initials = "CB";

  const meta: Record<string, unknown> = { ...payload, kind, submitted: now, maker: payload.maker ?? "E. Petrova" };

  if (kind === "payment") {
    category = "Approval";
    counterparty = String(payload.beneficiary ?? "Payment");
    amount = Number(payload.amount ?? 0);
    currency = String(payload.currency ?? "AED");
    accountId = (payload.accountId as string) ?? null;
    method = String(payload.method ?? "LOCAL");
    initials = counterparty.slice(0, 2).toUpperCase();
  } else if (kind === "beneficiary") {
    category = "Beneficiary Activation";
    counterparty = String(payload.beneficiary ?? "New Beneficiary");
    initials = counterparty.slice(0, 2).toUpperCase();
  } else if (kind === "chequebook") {
    category = "Cheque Book";
    counterparty = "Commercial Bank International";
  } else if (kind === "stopcheque") {
    category = "Stop Cheque";
    counterparty = String(payload.payee ?? "Cheque");
  } else {
    return NextResponse.json({ error: "unknown_kind" }, { status: 400 });
  }

  const reference = workRef("APR");
  const { data: inserted, error } = await supabase
    .from("transactions")
    .insert({
      profile_id: PROFILE_ID,
      account_id: accountId,
      type: "expense",
      counterparty,
      category,
      amount,
      currency,
      occurred_at: now,
      method,
      reference,
      status: "Pending Approval",
      logo: initials,
      color_tone: "slate",
      memo: JSON.stringify(meta),
    })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, item: { ...inserted, amount: Number(inserted.amount) } });
}

/**
 * PATCH /api/approvals — checker decision.
 * Body: { id, decision: "approve" | "reject", note?: string }
 *
 * Payment approvals are blocked while a compliance case is active
 * (funds-blocked scenario). Service requests (beneficiary activation,
 * cheque book, stop cheque) remain approvable.
 */
export async function PATCH(req: NextRequest) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const { id, decision, note } = (body ?? {}) as {
    id?: string;
    decision?: "approve" | "reject";
    note?: string;
  };
  if (!id || (decision !== "approve" && decision !== "reject")) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const supabase = getSupabase();

  const { data: row } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("profile_id", PROFILE_ID)
    .maybeSingle();
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (row.status !== "Pending Approval") {
    return NextResponse.json({ error: "already_decided" }, { status: 422 });
  }

  const meta = parseWorkMemo(row.memo) ?? {};
  const kind = String(meta.kind ?? "payment");
  const now = new Date().toISOString();

  // Compliance gate — outgoing payments cannot be executed while blocked.
  if (decision === "approve" && kind === "payment") {
    const { data: activeCase } = await supabase
      .from("compliance_cases")
      .select("case_reference")
      .eq("profile_id", PROFILE_ID)
      .eq("status", "Awaiting Documents")
      .limit(1)
      .maybeSingle();
    if (activeCase) {
      return NextResponse.json(
        {
          error: `Execution blocked — compliance case ${activeCase.case_reference} active. Outgoing transfers remain suspended.`,
        },
        { status: 422 }
      );
    }
  }

  if (decision === "reject") {
    const { error } = await supabase
      .from("transactions")
      .update({
        status: "Rejected",
        memo: JSON.stringify({ ...meta, checker: CHECKER, decided: now, reason: note ?? "Rejected by checker" }),
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "Rejected" });
  }

  // ---------- approve ----------
  let extraNote = "";
  let approvedStatus = "Approved";

  if (kind === "beneficiary") {
    const { error: bErr } = await supabase.from("beneficiaries").insert({
      profile_id: PROFILE_ID,
      name: String(meta.beneficiary ?? "").split(" ").slice(0, 2).join(" ") || "Beneficiary",
      full_name: String(meta.beneficiary ?? ""),
      initials: String(meta.beneficiary ?? "B").slice(0, 2).toUpperCase(),
      tone: "slate",
      iban: String(meta.iban ?? ""),
      country: String(meta.country ?? "United Arab Emirates"),
      method: String(meta.method ?? "LOCAL"),
    });
    if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });
    extraNote = "Beneficiary activated.";
  } else if (kind === "chequebook") {
    // Assign the next series range after any existing issued book.
    const { data: books } = await supabase
      .from("transactions")
      .select("memo")
      .eq("profile_id", PROFILE_ID)
      .eq("category", "Cheque Book")
      .eq("status", "Issued");
    let start = 351;
    for (const b of books ?? []) {
      const m = parseWorkMemo(b.memo as string);
      const end = Number(String(m?.series ?? "").split("–")[1]);
      if (!Number.isNaN(end) && end >= start) start = end + 1;
    }
    const leaves = Number(meta.leaves ?? 50);
    const series = `${String(start).padStart(6, "0")}–${String(start + leaves - 1).padStart(6, "0")}`;
    meta.series = series;
    approvedStatus = "Issued";
    extraNote = `Cheque book ${series} will be ready for ${String(meta.delivery ?? "branch pickup")}.`;
  } else if (kind === "stopcheque") {
    const targetRef = String(meta.cheque_ref ?? "");
    const { data: cheque } = await supabase
      .from("transactions")
      .select("id, status, account_id, amount, counterparty")
      .eq("profile_id", PROFILE_ID)
      .eq("reference", targetRef)
      .maybeSingle();
    if (!cheque) {
      return NextResponse.json({ error: "cheque_not_found" }, { status: 404 });
    }
    await supabase.from("transactions").update({ status: "Stopped" }).eq("id", cheque.id);
    // Bank charge — debited directly, allowed while blocked.
    const aedAccount = cheque.account_id;
    await supabase.from("transactions").insert({
      profile_id: PROFILE_ID,
      account_id: aedAccount,
      type: "expense",
      counterparty: "Commercial Bank International",
      category: "Cheque Stop Fee",
      amount: 105,
      currency: "AED",
      occurred_at: now,
      method: "LOCAL",
      reference: workRef("REF-MWJ"),
      status: "Settled",
      logo: "CB",
      color_tone: "slate",
      memo: `Stop payment order — cheque ${String(meta.cheque_no ?? "")} (${cheque.counterparty})`,
    });
    extraNote = "Cheque stopped — AED 105 fee debited.";
  } else if (kind === "payment") {
    // No active compliance case → execute the payment as a settled statement row.
    const accountId = (row.account_id as string) ?? null;
    let newBalance: number | null = null;
    if (accountId) {
      const { data: acc } = await supabase
        .from("accounts")
        .select("id, balance, currency")
        .eq("id", accountId)
        .maybeSingle();
      if (acc) {
        newBalance = Number(acc.balance) - Number(row.amount);
        await supabase.from("accounts").update({ balance: newBalance }).eq("id", accountId);
      }
    }
    const executedRef = workRef("REF-MWJ");
    await supabase.from("transactions").insert({
      profile_id: PROFILE_ID,
      account_id: accountId,
      type: "expense",
      counterparty: row.counterparty,
      category:
        row.method === "SWIFT" ? "SWIFT Transfer" : row.method === "SEPA" ? "SEPA Transfer" : "Local Transfer",
      amount: row.amount,
      currency: row.currency,
      occurred_at: now,
      method: row.method,
      reference: executedRef,
      status: "Settled",
      logo: row.logo,
      color_tone: row.color_tone,
      memo: `Executed via dual authorization ${row.reference}`,
    });
    meta.executed_ref = executedRef;
    extraNote = "Payment executed.";
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      status: approvedStatus,
      memo: JSON.stringify({ ...meta, checker: CHECKER, decided: now, note: note ?? null }),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: approvedStatus, note: extraNote });
}
