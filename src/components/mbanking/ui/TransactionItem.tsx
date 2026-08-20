"use client";

import { ArrowDownLeft, ArrowUpRight, Ban } from "lucide-react";
import type { Transaction } from "@/lib/mbanking/types";
import { formatEUR, formatUSD, formatAED, relativeDateLabel, timeLabel } from "@/lib/mbanking/format";
import { useNav } from "../nav";
import { cn } from "@/lib/utils";

/** Format amount using the transaction's own currency. */
function formatAmount(amount: number, currency: string): string {
  if (currency === "USD") return formatUSD(amount);
  if (currency === "AED") return formatAED(amount);
  return formatEUR(amount);
}

interface TransactionItemProps {
  tx: Transaction;
  /** Compact variant used in the home preview list. */
  compact?: boolean;
}

const TONE_CLASS: Record<string, string> = {
  indigo: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  slate: "bg-slate-900 text-white border border-slate-800",
  amber: "bg-amber-50 text-amber-700 border border-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  blue: "bg-blue-50 text-blue-700 border border-blue-100",
  purple: "bg-purple-50 text-purple-700 border border-purple-100",
};

export function TransactionItem({ tx, compact }: TransactionItemProps) {
  const { openTxDetails } = useNav();
  const isIncome = tx.type === "income";
  const isRejected = tx.status === "Rejected";
  const isBlocked = tx.status === "Processing";

  const sign = isIncome ? "+" : "-";
  // Rejected transactions are shown in muted/grey with strikethrough
  const amountColor = isRejected
    ? "text-slate-400 line-through"
    : isBlocked
      ? "text-amber-600"
      : isIncome
        ? "text-emerald-600"
        : "text-slate-900";

  const dateLabel = relativeDateLabel(tx.occurred_at);
  const time = timeLabel(tx.occurred_at);
  const badgeClass = TONE_CLASS[tx.color_tone] || TONE_CLASS.slate;

  return (
    <button
      onClick={() => openTxDetails(tx.id)}
      className={cn(
        "active-scale flex w-full items-center justify-between rounded-[1rem] text-left transition-colors hover:bg-slate-50",
        compact ? "p-3" : "border-b border-slate-100 p-4 last:border-0",
        isRejected && "opacity-75"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <div
          className={cn(
            "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.8rem] text-[13px] font-black shadow-sm",
            isRejected
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : badgeClass
          )}
        >
          {isRejected ? (
            <Ban className="h-5 w-5" />
          ) : tx.logo ? (
            tx.logo
          ) : isIncome ? (
            <ArrowDownLeft className="h-5 w-5" />
          ) : (
            <ArrowUpRight className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-black tracking-tight text-slate-900">
              {tx.counterparty}
            </p>
            {isRejected && (
              <span className="shrink-0 rounded bg-rose-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-rose-700">
                Rejected
              </span>
            )}
            {isBlocked && (
              <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-700">
                Held
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {compact ? dateLabel : `${dateLabel} • ${time}`}
          </p>
        </div>
      </div>
      <div className={cn(
        "shrink-0 whitespace-nowrap pl-2 text-right text-sm font-black",
        amountColor
      )}>
        {sign}
        {formatAmount(tx.amount, tx.currency)}
      </div>
    </button>
  );
}
