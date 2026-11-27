import { NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";
import { parseWorkMemo } from "@/lib/mawj/workbench";
import { TRADE_INSTRUMENTS, DEPOSITS } from "@/lib/mbanking/corporate-data";

export const dynamic = "force-dynamic";

interface NotificationOut {
  id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning";
  ts: string; // ISO — for ordering
  action?: "compliance" | "approvals" | "scheduled" | "cheques" | "trade-finance" | "deposits";
}

const CUR: Record<string, string> = { EUR: "€", USD: "$", AED: "AED " };

/**
 * GET /api/notifications — the notification inbox, computed live from the
 * actual data state (compliance case, approval queue, cheques, trade
 * instruments, deposits, recent statement events). Read-state is tracked
 * client-side.
 */
export async function GET() {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();

  const [caseRes, approvalRes, chequeRes, txRes] = await Promise.all([
    supabase
      .from("compliance_cases")
      .select("*")
      .eq("profile_id", PROFILE_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("transactions")
      .select("id, status, occurred_at, memo, counterparty, category, amount, currency")
      .eq("profile_id", PROFILE_ID)
      .eq("status", "Pending Approval")
      .in("category", ["Approval", "Beneficiary Activation", "Cheque Book", "Stop Cheque"]),
    supabase
      .from("transactions")
      .select("id, reference, status, occurred_at, counterparty, amount")
      .eq("profile_id", PROFILE_ID)
      .eq("category", "Cheque"),
    supabase
      .from("transactions")
      .select("id, reference, status, occurred_at, counterparty, category, amount, currency")
      .eq("profile_id", PROFILE_ID)
      .eq("status", "Rejected")
      .order("occurred_at", { ascending: false })
      .limit(2),
  ]);

  const out: NotificationOut[] = [];

  // 1) Compliance escalation — the headline event.
  const activeCase = caseRes.data;
  if (activeCase) {
    out.push({
      id: "cmp-escalation",
      title: "Compliance Escalation",
      body: `Final deadline for ${activeCase.case_reference} passed on ${new Date(
        activeCase.deadline_2
      ).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} — €18,500,000 remains blocked pending Source of Funds documents.`,
      tone: "warning",
      ts: activeCase.deadline_2 as string,
      action: "compliance",
    });
  }

  // 2) Approval queue — every pending item.
  for (const a of approvalRes.data ?? []) {
    const meta = parseWorkMemo(a.memo as string) ?? {};
    const kind = String(meta.kind ?? "payment");
    const titles: Record<string, string> = {
      payment: "Payment Awaiting Approval",
      beneficiary: "Beneficiary Activation Awaiting Approval",
      chequebook: "Cheque Book Request Awaiting Approval",
      stopcheque: "Stop Cheque Request Awaiting Approval",
    };
    out.push({
      id: `apr-${a.id}`,
      title: titles[kind] ?? "Item Awaiting Approval",
      body:
        kind === "payment"
          ? `${a.counterparty} · ${CUR[a.currency as string] ?? ""}${Number(a.amount).toLocaleString("en-US")} — submitted by ${String(meta.maker ?? "E. Petrova")}.`
          : `${a.counterparty} — submitted by ${String(meta.maker ?? "E. Petrova")}. Dual authorization required.`,
      tone: "info",
      ts: a.occurred_at as string,
      action: "approvals",
    });
  }

  // 3) Cheque events — returned unpaid / stopped.
  for (const c of chequeRes.data ?? []) {
    if (c.status === "Returned") {
      out.push({
        id: `chq-returned-${c.id}`,
        title: "Cheque Returned Unpaid",
        body: `${c.counterparty} — cheque ${c.reference.replace("CHQ-", "No. ")} was returned unpaid. Account restriction ${activeCase?.case_reference ?? "in effect"}.`,
        tone: "warning",
        ts: c.occurred_at as string,
        action: "cheques",
      });
    }
    if (c.status === "Stopped") {
      out.push({
        id: `chq-stopped-${c.id}`,
        title: "Stop Payment Confirmed",
        body: `${c.counterparty} — cheque ${c.reference.replace("CHQ-", "No. ")} stopped. AED 105 fee debited.`,
        tone: "info",
        ts: c.occurred_at as string,
        action: "cheques",
      });
    }
  }

  // 4) Recent rejected outgoing payments.
  for (const r of txRes.data ?? []) {
    out.push({
      id: `rej-${r.id}`,
      title: "Payment Rejected",
      body: `${r.counterparty} · ${CUR[r.currency as string] ?? ""}${Number(r.amount).toLocaleString("en-US")} — outgoing transfers suspended (${activeCase?.case_reference ?? "compliance review"}).`,
      tone: "warning",
      ts: r.occurred_at as string,
      action: "compliance",
    });
  }

  // 5) Trade finance calendar — live from the corporate module data.
  for (const ins of TRADE_INSTRUMENTS) {
    const expiry = new Date(ins.expiry);
    const days = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
    if (days < 0 || days > 60) continue;
    if (ins.kind === "lg-advance" && days <= 60) {
      out.push({
        id: `lg-exp-${ins.ref}`,
        title: "Advance Payment Guarantee Expiring",
        body: `${ins.beneficiary} · ${CUR[ins.currency] ?? ""}${ins.utilized.toLocaleString("en-US")} outstanding — expires ${expiry.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} unless a claim is lodged.`,
        tone: "info",
        ts: new Date(Date.now() - 86_400_000 * 7).toISOString(),
        action: "trade-finance",
      });
    } else if (ins.kind === "import-lc" && days <= 45) {
      out.push({
        id: `lc-mat-${ins.ref}`,
        title: "LC Presentation Pending",
        body: `Documents under ${ins.ref} (${ins.beneficiary}) are held — settlement awaits compliance release.`,
        tone: "warning",
        ts: new Date(Date.now() - 86_400_000 * 6).toISOString(),
        action: "trade-finance",
      });
    }
  }

  // 6) Deposits maturing soon.
  for (const d of DEPOSITS) {
    if (!d.maturity || d.status !== "Active") continue;
    const days = Math.ceil((new Date(d.maturity).getTime() - Date.now()) / 86_400_000);
    if (days < 0 || days > 60) continue;
    out.push({
      id: `dep-mat-${d.ref}`,
      title: "Term Deposit Maturity",
      body: `${d.ref} matures on ${new Date(d.maturity).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}. Instruction: ${d.rollover.toLowerCase()}.`,
      tone: "info",
      ts: new Date(Date.now() - 86_400_000 * 2).toISOString(),
      action: "deposits",
    });
  }

  // Sort newest-first.
  out.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  return NextResponse.json({ notifications: out });
}
