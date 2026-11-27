"use client";

import { useState } from "react";
import { BookOpen, Ban, Plus, X, ChevronDown } from "lucide-react";
import { SubPage } from "../SubPage";
import { CbiButton, CbiRow, HexagonIcon } from "../cbi";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/mbanking/types";
import { formatAED } from "@/lib/mbanking/format";

function parseMemo(memo: string | null): Record<string, unknown> {
  if (!memo) return {};
  try {
    const v = JSON.parse(memo);
    return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const STATUS_TONE: Record<string, string> = {
  Cleared: "text-[#217A3B]",
  Issued: "text-[#1565C0]",
  Returned: "text-[#82134C]",
  Stopped: "text-[#8C8C8C]",
};

const LEAF_OPTIONS = [25, 50, 100];

/** Cheque Services — book requests, register and stop-cheque instructions. */
export function ChequesPage() {
  const workItems = useMbanking((s) => s.workItems);
  const requestApproval = useMbanking((s) => s.requestApproval);
  const accounts = useMbanking((s) => s.accounts);
  const complianceCase = useMbanking((s) => s.complianceCase);

  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [leaves, setLeaves] = useState(50);
  const [busy, setBusy] = useState(false);
  const [stopFor, setStopFor] = useState<Transaction | null>(null);
  const [stopReason, setStopReason] = useState("");
  const [confirmStop, setConfirmStop] = useState(false);

  const aed = accounts.find((a) => a.currency === "AED");
  const books = workItems.filter((w) => w.category === "Cheque Book" && w.status !== "Pending Approval");
  const cheques = workItems
    .filter((w) => w.category === "Cheque")
    .sort((a, b) => String(b.reference).localeCompare(String(a.reference)));

  const pendingBook = workItems.find(
    (w) => w.category === "Cheque Book" && w.status === "Pending Approval"
  );

  const submitBookRequest = async () => {
    if (!aed) return;
    setBusy(true);
    const r = await requestApproval("chequebook", {
      account: aed.label,
      leaves,
      delivery: "Branch pickup — Deira Main",
    });
    setBusy(false);
    if (r.ok) {
      toast("Cheque book request submitted — awaiting approval", "success");
      setBookFormOpen(false);
    } else {
      toast(r.error ?? "Request failed", "error");
    }
  };

  const submitStop = async () => {
    if (!stopFor) return;
    const meta = parseMemo(stopFor.memo);
    setBusy(true);
    const r = await requestApproval("stopcheque", {
      cheque_ref: stopFor.reference,
      cheque_no: String(meta.cheque_no ?? stopFor.reference.replace("CHQ-", "")),
      payee: stopFor.counterparty,
      amount: stopFor.amount,
      reason: stopReason,
    });
    setBusy(false);
    if (r.ok) {
      toast("Stop instruction submitted — awaiting approval", "success");
      setStopFor(null);
      setStopReason("");
      setConfirmStop(false);
    } else {
      toast(r.error ?? "Request failed", "error");
    }
  };

  return (
    <SubPage title="Cheque Services" stepIndicator="Corporate Cheques">
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* Request cheque book */}
        <div className="cbi-card overflow-hidden">
          <div className="h-[18px] w-full bg-[#82134C]" />
          <div className="px-3 pb-3 pt-2.5">
            <div className="flex items-center gap-3">
              <HexagonIcon width={54}>
                <BookOpen className="h-6 w-6" strokeWidth={1.6} />
              </HexagonIcon>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-[#333333]">Cheque Book</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#7F7F7F]">
                  AED Operating Account · issued by CBI Deira Main
                </p>
              </div>
            </div>

            {pendingBook ? (
              <p className="mt-2 border-t border-[#E5E5E5] pt-2 text-[11.5px] font-bold text-[#82134C]">
                Request {pendingBook.reference} pending checker approval.
              </p>
            ) : bookFormOpen ? (
              <div className="mt-2 border-t border-[#E5E5E5] pt-2">
                <p className="mb-2 text-[12px] text-[#7F7F7F]">Number of leaves</p>
                <div className="grid grid-cols-3 gap-2">
                  {LEAF_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setLeaves(n)}
                      className={cn(
                        "border py-2.5 text-[14px] font-bold active:opacity-70",
                        leaves === n
                          ? "border-[#82134C] bg-[#82134C]/[0.07] text-[#82134C]"
                          : "border-[#D9D9D9] text-[#595959]"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[#8C8C8C]">
                  Requests are subject to dual authorization and issued within 2
                  working days.
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <CbiButton onClick={submitBookRequest} disabled={busy}>
                    {busy ? "Submitting…" : "Submit Request"}
                  </CbiButton>
                  <CbiButton onClick={() => setBookFormOpen(false)} className="cbi-btn-outline">
                    Cancel
                  </CbiButton>
                </div>
              </div>
            ) : (
              <div className="mt-2.5">
                <CbiButton onClick={() => setBookFormOpen(true)}>
                  <span className="flex items-center justify-center gap-1.5">
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Request Cheque Book
                  </span>
                </CbiButton>
              </div>
            )}
          </div>
        </div>

        {/* Issued books */}
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#595959]">Issued Books</h2>
        </div>
        <div className="cbi-card">
          {books.length === 0 ? (
            <p className="px-3 py-5 text-center text-[12px] text-[#9E9E9E]">No books issued</p>
          ) : (
            books.map((b) => {
              const meta = parseMemo(b.memo);
              const series = String(meta.series ?? "—");
              const bLeaves = Number(meta.leaves ?? 50);
              const used = cheques.filter((c) => parseMemo(c.memo).book === b.reference).length;
              return (
                <div key={b.id} className="border-b border-[#E5E5E5] px-3 py-3 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold text-[#595959]">
                      Series {series}
                    </p>
                    <span className="text-[10.5px] font-bold uppercase text-[#217A3B]">
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    <CbiRow label="Leaves" value={`${used} of ${bLeaves} drawn`} />
                    <CbiRow
                      label="Issued"
                      value={new Date(b.occurred_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cheque register */}
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#595959]">Cheque Register</h2>
          <span className="text-[12px] text-[#7F7F7F]">{cheques.length} cheques</span>
        </div>
        <div className="cbi-card">
          {cheques.length === 0 && (
            <p className="px-3 py-5 text-center text-[12px] text-[#9E9E9E]">No cheques drawn</p>
          )}
          {cheques.map((c) => {
            const meta = parseMemo(c.memo);
            const stoppable = c.status === "Issued";
            return (
              <div key={c.id} className="border-b border-[#E5E5E5] px-3 py-3 last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-[#595959]">
                      {c.counterparty}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#7F7F7F]">
                      No. {String(meta.cheque_no ?? c.reference.replace("CHQ-", ""))} ·{" "}
                      {new Date(c.occurred_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                    {meta.note ? (
                      <p className="mt-0.5 text-[10.5px] italic text-[#8C8C8C]">{String(meta.note)}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[12.5px] font-bold text-[#222222]">
                      {formatAED(c.amount)}
                    </p>
                    <span
                      className={cn(
                        "mt-0.5 block text-[10.5px] font-bold uppercase",
                        STATUS_TONE[c.status] ?? "text-[#7F7F7F]"
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
                {stoppable && (
                  <button
                    onClick={() => {
                      setStopFor(c);
                      setStopReason("");
                      setConfirmStop(false);
                    }}
                    className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#82134C] active:opacity-60"
                  >
                    <Ban className="h-3.5 w-3.5" strokeWidth={1.9} />
                    Stop payment
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Stop-cheque modal */}
        {stopFor && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm cbi-card px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold text-[#595959]">Stop Cheque Payment</p>
                <button onClick={() => setStopFor(null)} aria-label="Close">
                  <X className="h-5 w-5 text-[#7F7F7F]" />
                </button>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#7F7F7F]">
                Cheque No. {String(parseMemo(stopFor.memo).cheque_no ?? "")} ·{" "}
                {stopFor.counterparty} · {formatAED(stopFor.amount)}. A AED 105 fee applies.
              </p>
              <div className="mt-3">
                <label className="mb-1.5 block text-[12px] text-[#7F7F7F]">
                  Reason for stop
                </label>
                <select
                  value={stopReason}
                  onChange={(e) => setStopReason(e.target.value)}
                  className="w-full border border-[#D9D9D9] bg-white px-2.5 py-2.5 text-[13px] text-[#222222] outline-none"
                >
                  <option value="">Select a reason…</option>
                  <option value="Cheque lost in transit">Cheque lost in transit</option>
                  <option value="Goods/services not delivered">Goods/services not delivered</option>
                  <option value="Amount dispute with payee">Amount dispute with payee</option>
                  <option value="Duplicate issuance">Duplicate issuance</option>
                </select>
              </div>
              {complianceCase ? (
                <p className="mt-2 text-[10.5px] leading-relaxed text-[#8C8C8C]">
                  Stop instructions are service operations and remain available
                  while transfers are suspended.
                </p>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {confirmStop ? (
                  <>
                    <CbiButton onClick={submitStop} disabled={busy || !stopReason}>
                      {busy ? "…" : "Confirm Stop"}
                    </CbiButton>
                    <CbiButton onClick={() => setConfirmStop(false)} className="cbi-btn-outline">
                      Back
                    </CbiButton>
                  </>
                ) : (
                  <>
                    <CbiButton
                      onClick={() => setConfirmStop(true)}
                      disabled={!stopReason}
                    >
                      Continue
                    </CbiButton>
                    <CbiButton onClick={() => setStopFor(null)} className="cbi-btn-outline">
                      Cancel
                    </CbiButton>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SubPage>
  );
}
