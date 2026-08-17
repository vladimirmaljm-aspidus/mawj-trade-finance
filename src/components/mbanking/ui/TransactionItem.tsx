"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@/lib/mbanking/types";
import { formatEUR, relativeDateLabel, timeLabel } from "@/lib/mbanking/format";
import { useNav } from "../nav";
import { cn } from "@/lib/utils";

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
  const sign = isIncome ? "+" : "-";
  const amountColor = isIncome ? "text-emerald-600" : "text-slate-900";

  const dateLabel = relativeDateLabel(tx.occurred_at);
  const time = timeLabel(tx.occurred_at);
  const badgeClass = TONE_CLASS[tx.color_tone] || TONE_CLASS.slate;

  return (
    <button
      onClick={() => openTxDetails(tx.id)}
      className={cn(
        "active-scale flex w-full items-center justify-between rounded-[1rem] text-left transition-colors hover:bg-slate-50",
        compact ? "p-3" : "border-b border-slate-100 p-4 last:border-0"
      )}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-[0.8rem] text-[13px] font-black shadow-sm",
            badgeClass
          )}
        >
          {tx.logo ? (
            tx.logo
          ) : isIncome ? (
            <ArrowDownLeft className="h-5 w-5" />
          ) : (
            <ArrowUpRight className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black tracking-tight text-slate-900">
            {tx.counterparty}
          </p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {compact ? dateLabel : `${dateLabel} • ${time}`}
          </p>
        </div>
      </div>
      <div className={cn("text-sm font-black", amountColor)}>
        {sign}
        {formatEUR(tx.amount)}
      </div>
    </button>
  );
}
