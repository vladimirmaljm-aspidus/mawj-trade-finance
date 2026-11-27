"use client";

import { useState } from "react";
import { CalendarClock, Repeat, Ban, Lock, Info } from "lucide-react";
import { SubPage } from "../SubPage";
import { CbiButton, CbiRow, HexagonIcon } from "../cbi";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import type { Transaction } from "@/lib/mbanking/types";
import { formatEUR, formatUSD, formatAED } from "@/lib/mbanking/format";

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

/** Scheduled & standing transfers — future-dated and recurring payments. */
export function ScheduledPage() {
  const workItems = useMbanking((s) => s.workItems);
  const cancelWorkItem = useMbanking((s) => s.cancelWorkItem);
  const complianceCase = useMbanking((s) => s.complianceCase);
  const accounts = useMbanking((s) => s.accounts);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const scheduledCats = ["Scheduled Transfer", "Standing Order"];
  const active = workItems.filter(
    (w) => scheduledCats.includes(w.category) && w.status === "Scheduled"
  );
  const cancelled = workItems.filter(
    (w) => scheduledCats.includes(w.category) && w.status !== "Scheduled"
  );

  const accountLabel = (id: string | null): string =>
    accounts.find((a) => a.id === id)?.label ?? "—";

  const onCancel = async (item: Transaction) => {
    setBusyId(item.id);
    const r = await cancelWorkItem(item.id);
    setBusyId(null);
    setConfirmId(null);
    if (r.ok) toast("Standing instruction cancelled", "info");
    else toast(r.error ?? "Could not cancel", "error");
  };

  return (
    <SubPage title="Scheduled Transfers" stepIndicator="Standing Instructions">
      <div className="flex flex-col gap-3 px-3 py-3">
        {complianceCase && (
          <div className="border border-[#82134C]/40 bg-[#82134C]/[0.05] px-3 py-3">
            <p className="flex items-center gap-2 text-[12.5px] font-bold text-[#82134C]">
              <Lock className="h-4 w-4" strokeWidth={1.8} />
              Execution Suspended
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-[#7F7F7F]">
              Outgoing transfers are suspended pending compliance review
              ({complianceCase.case_reference}). Scheduled items remain queued and
              will be re-evaluated at their next execution date.
            </p>
          </div>
        )}

        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#595959]">Active Instructions</h2>
          <span className="text-[12px] text-[#7F7F7F]">{active.length} queued</span>
        </div>

        {active.length === 0 && (
          <div className="cbi-card px-4 py-6 text-center">
            <p className="text-[13px] text-[#595959]">No scheduled transfers</p>
          </div>
        )}

        {active.map((item) => {
          const meta = parseMemo(item.memo);
          const standing = item.category === "Standing Order";
          const next = new Date(item.occurred_at);
          const days = Math.ceil((next.getTime() - Date.now()) / 86_400_000);
          return (
            <div key={item.id} className="cbi-card overflow-hidden">
              <div className="h-[18px] w-full bg-[#82134C]" />
              <div className="px-3 pb-3 pt-2.5">
                <div className="flex items-center gap-3">
                  <HexagonIcon width={54}>
                    {standing ? (
                      <Repeat className="h-6 w-6" strokeWidth={1.6} />
                    ) : (
                      <CalendarClock className="h-6 w-6" strokeWidth={1.6} />
                    )}
                  </HexagonIcon>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#82134C]">
                      {standing ? "Standing Order" : "One-off Scheduled"}
                    </p>
                    <p className="mt-0.5 truncate text-[14px] font-bold text-[#333333]">
                      {item.counterparty}
                    </p>
                    <p className="text-[13px] font-bold text-[#222222]">
                      {fmtMoney(item.amount, item.currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 border-t border-[#E5E5E5] pt-1.5">
                  <CbiRow label="Next execution" value={next.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
                  <CbiRow label="Countdown" value={days > 0 ? `in ${days} days` : "due today"} />
                  {standing && (
                    <CbiRow label="Frequency" value={String(meta.frequency ?? "Monthly")} />
                  )}
                  <CbiRow label="Debit account" value={accountLabel(item.account_id)} />
                  {meta.iban ? <CbiRow label="IBAN" value={String(meta.iban)} /> : null}
                  {meta.purpose ? <CbiRow label="Purpose" value={String(meta.purpose)} /> : null}
                </div>

                {confirmId === item.id ? (
                  <div className="mt-2.5 border-t border-[#E5E5E5] pt-2.5">
                    <p className="mb-2 text-[11.5px] leading-relaxed text-[#7F7F7F]">
                      Cancel this {standing ? "standing order" : "scheduled transfer"}? This
                      cannot be re-activated.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <CbiButton
                        onClick={() => onCancel(item)}
                        disabled={busyId === item.id}
                        className="cbi-btn-outline"
                      >
                        {busyId === item.id ? "…" : "Confirm Cancel"}
                      </CbiButton>
                      <CbiButton onClick={() => setConfirmId(null)}>Keep</CbiButton>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5">
                    <CbiButton onClick={() => setConfirmId(item.id)} className="cbi-btn-outline">
                      <span className="flex items-center justify-center gap-1.5">
                        <Ban className="h-4 w-4" strokeWidth={1.8} />
                        Cancel Instruction
                      </span>
                    </CbiButton>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {cancelled.length > 0 && (
          <>
            <div className="mt-1 flex items-center gap-1.5 px-1">
              <Info className="h-3.5 w-3.5 text-[#7A1F3D]" strokeWidth={1.8} />
              <h2 className="text-[13px] font-bold text-[#595959]">Cancelled</h2>
            </div>
            <div className="cbi-card">
              {cancelled.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between border-b border-[#E5E5E5] px-3 py-2.5 last:border-b-0"
                >
                  <div>
                    <p className="text-[12.5px] font-bold text-[#595959]">{c.counterparty}</p>
                    <p className="mt-0.5 text-[11px] text-[#7F7F7F]">
                      {c.reference} · cancelled
                    </p>
                  </div>
                  <span className="text-[11px] font-bold uppercase text-[#8C8C8C]">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </SubPage>
  );
}
