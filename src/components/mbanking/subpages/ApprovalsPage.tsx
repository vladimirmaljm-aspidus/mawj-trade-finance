"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  UserCog,
  Lock,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
} from "lucide-react";
import { SubPage } from "../SubPage";
import { CbiButton, CbiRow, HexagonIcon } from "../cbi";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/mbanking/types";
import { formatEUR, formatUSD, formatAED } from "@/lib/mbanking/format";

const KIND_LABEL: Record<string, string> = {
  payment: "Payment Authorization",
  beneficiary: "Beneficiary Activation",
  chequebook: "Cheque Book Request",
  stopcheque: "Stop Cheque Request",
};

const KIND_ICON: Record<string, React.ReactNode> = {
  payment: <BadgeCheck className="h-6 w-6" strokeWidth={1.6} />,
  beneficiary: <UserCog className="h-6 w-6" strokeWidth={1.6} />,
  chequebook: <Clock className="h-6 w-6" strokeWidth={1.6} />,
  stopcheque: <X className="h-6 w-6" strokeWidth={1.6} />,
};

function parseMemo(memo: string | null): Record<string, unknown> {
  if (!memo) return {};
  try {
    const v = JSON.parse(memo);
    return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function fmtMoney(amount: number, currency: string): string {
  if (currency === "EUR") return formatEUR(amount);
  if (currency === "USD") return formatUSD(amount);
  return formatAED(amount);
}

function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Approvals — the corporate maker-checker queue (dual authorization). */
export function ApprovalsPage() {
  const workItems = useMbanking((s) => s.workItems);
  const decideApproval = useMbanking((s) => s.decideApproval);
  const complianceCase = useMbanking((s) => s.complianceCase);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(true);

  const approvalCats = ["Approval", "Beneficiary Activation", "Cheque Book", "Stop Cheque"];
  const queue = workItems.filter(
    (w) => approvalCats.includes(w.category) && w.status === "Pending Approval"
  );
  const history = workItems
    .filter(
      (w) => approvalCats.includes(w.category) && (w.status === "Approved" || w.status === "Rejected")
    )
    .sort((a, b) => {
      const am = parseMemo(a.memo).decided as string | undefined;
      const bm = parseMemo(b.memo).decided as string | undefined;
      return new Date(bm ?? b.occurred_at).getTime() - new Date(am ?? a.occurred_at).getTime();
    });

  const onDecide = async (item: Transaction, decision: "approve" | "reject") => {
    setBusyId(item.id);
    const r = await decideApproval(item.id, decision);
    setBusyId(null);
    if (r.ok) {
      toast(
        decision === "approve"
          ? r.note || "Approved — request executed."
          : "Request rejected and returned to maker.",
        decision === "approve" ? "success" : "info"
      );
    } else {
      toast(r.error ?? "Decision failed", "error");
    }
  };

  return (
    <SubPage title="Approvals" stepIndicator="Dual Authorization">
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* Dual-authorization matrix */}
        <div className="bg-[#000F32] px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 text-[14px] font-bold text-white">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.7} />
                Dual Authorization Matrix
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/70">
                Payments ≥ AED 250,000 · new beneficiaries · cheque services require
                second (checker) approval. Maker: E. Petrova · Checker: V. Maljm
              </p>
            </div>
          </div>
        </div>

        {/* Pending queue */}
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#595959]">Pending Queue</h2>
          <span className="text-[12px] text-[#7F7F7F]">{queue.length} awaiting</span>
        </div>

        {queue.length === 0 ? (
          <div className="cbi-card px-4 py-6 text-center">
            <p className="text-[13px] text-[#595959]">No items awaiting approval</p>
            <p className="mt-1 text-[11.5px] text-[#7F7F7F]">
              Requests submitted by the maker appear here for second authorization.
            </p>
          </div>
        ) : (
          queue.map((item) => {
            const meta = parseMemo(item.memo);
            const kind = String(meta.kind ?? "payment");
            const isPayment = kind === "payment";
            const blocked = isPayment && Boolean(complianceCase);
            return (
              <div key={item.id} className="cbi-card overflow-hidden">
                <div className="h-[18px] w-full bg-[#82134C]" />
                <div className="px-3 pb-3 pt-2.5">
                  <div className="flex items-center gap-3">
                    <HexagonIcon width={54}>
                      {KIND_ICON[kind] ?? <Clock className="h-6 w-6" strokeWidth={1.6} />}
                    </HexagonIcon>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#82134C]">
                        {KIND_LABEL[kind] ?? "Request"} · {item.reference}
                      </p>
                      <p className="mt-0.5 truncate text-[14px] font-bold text-[#333333]">
                        {item.counterparty}
                      </p>
                      {item.amount > 0 && (
                        <p className="text-[13px] font-bold text-[#222222]">
                          {fmtMoney(item.amount, item.currency)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 border-t border-[#E5E5E5] pt-1.5">
                    <CbiRow
                      label="Submitted by"
                      value={String(meta.maker ?? "E. Petrova")}
                    />
                    <CbiRow label="Submitted" value={fmtWhen(item.occurred_at)} />
                    {isPayment && (
                      <>
                        <CbiRow label="Method" value={String(meta.method ?? item.method)} />
                        {meta.iban ? (
                          <CbiRow label="IBAN / Account" value={String(meta.iban)} />
                        ) : null}
                      </>
                    )}
                    {kind === "beneficiary" && meta.iban ? (
                      <CbiRow label="IBAN" value={String(meta.iban)} />
                    ) : null}
                    {kind === "chequebook" && (
                      <CbiRow
                        label="Leaves"
                        value={`${String(meta.leaves ?? 50)} · ${String(meta.delivery ?? "Branch pickup")}`}
                      />
                    )}
                    {meta.purpose ? (
                      <CbiRow label="Purpose" value={String(meta.purpose)} />
                    ) : null}
                    {meta.note ? <CbiRow label="Note" value={String(meta.note)} /> : null}
                  </div>

                  {blocked && (
                    <p className="mt-1.5 flex items-start gap-1.5 border border-[#82134C]/30 bg-[#82134C]/[0.06] px-2.5 py-2 text-[11px] leading-relaxed text-[#82134C]">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                      Execution suspended — compliance case {complianceCase?.case_reference} active.
                      Approval will be recorded but funds remain blocked.
                    </p>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <CbiButton
                      onClick={() => onDecide(item, "approve")}
                      disabled={busyId === item.id}
                      className="cbi-btn-approve"
                    >
                      {busyId === item.id ? "…" : "Approve"}
                    </CbiButton>
                    <CbiButton
                      onClick={() => onDecide(item, "reject")}
                      disabled={busyId === item.id}
                      className="cbi-btn-outline"
                    >
                      Reject
                    </CbiButton>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Decision history */}
        <div className="mt-1 flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#595959]">Decision History</h2>
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex items-center text-[12px] text-[#1565C0] active:opacity-60"
          >
            {history.length} items
            {historyOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {historyOpen && (
          <div className="cbi-card">
            {history.length === 0 ? (
              <p className="px-3 py-5 text-center text-[12px] text-[#9E9E9E]">
                No decisions recorded yet
              </p>
            ) : (
              history.map((h) => {
                const meta = parseMemo(h.memo);
                const approved = h.status === "Approved";
                return (
                  <div
                    key={h.id}
                    className="flex items-start justify-between gap-3 border-b border-[#E5E5E5] px-3 py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[#595959]">
                        {h.counterparty}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#7F7F7F]">
                        {KIND_LABEL[String(meta.kind ?? "payment")] ?? "Request"} · {h.reference}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#7F7F7F]">
                        Checker: {String(meta.checker ?? "V. Maljm")} · {fmtWhen(String(meta.decided ?? h.occurred_at))}
                      </p>
                      {meta.reason ? (
                        <p className="mt-1 text-[10.5px] italic leading-relaxed text-[#82134C]">
                          “{String(meta.reason)}”
                        </p>
                      ) : null}
                      {meta.executed_ref ? (
                        <p className="mt-0.5 text-[10.5px] text-[#217A3B]">
                          Executed as {String(meta.executed_ref)}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      {h.amount > 0 && (
                        <p className="text-[12.5px] font-bold text-[#222222]">
                          {fmtMoney(h.amount, h.currency)}
                        </p>
                      )}
                      <span
                        className={cn(
                          "mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-bold uppercase",
                          approved ? "text-[#217A3B]" : "text-[#82134C]"
                        )}
                      >
                        {approved ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                        ) : (
                          <X className="h-3.5 w-3.5" strokeWidth={2.4} />
                        )}
                        {approved ? "Approved" : "Rejected"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </SubPage>
  );
}
