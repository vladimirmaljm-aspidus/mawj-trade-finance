"use client";

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
  /** Compact variant used in narrower lists. */
  compact?: boolean;
}

/**
 * Flat CBI-style transaction row — bold counterparty, gray meta line,
 * right-aligned amount. No avatar bubbles, hairline separators only.
 */
export function TransactionItem({ tx, compact }: TransactionItemProps) {
  const { openTxDetails } = useNav();
  const isIncome = tx.type === "income";
  const isRejected = tx.status === "Rejected";
  const isBlocked = tx.status === "Processing";

  const sign = isIncome ? "+" : "-";
  const amountColor = isRejected
    ? "text-[#9E9E9E] line-through"
    : isIncome
      ? "text-[#217A3B]"
      : "text-[#222222]";

  const ts = new Date(tx.occurred_at).getTime();
  const dateLabel = relativeDateLabel(ts);
  const time = timeLabel(ts);

  return (
    <button
      onClick={() => openTxDetails(tx.id)}
      className={cn(
        "flex w-full items-start justify-between border-b border-[#E5E5E5] text-left last:border-b-0 active:opacity-70",
        compact ? "px-3 py-2.5" : "px-3 py-3"
      )}
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className="truncate text-[13px] font-bold leading-tight text-[#595959]">
          {tx.counterparty}
        </p>
        <p className="mt-1 text-[10.5px] text-[#8C8C8C]">
          {dateLabel}
          {!compact && ` · ${time}`}
          {` · ${tx.status}`}
        </p>
        {isRejected && (
          <p className="mt-0.5 text-[10px] text-[#82134C]">Rejected — return to sender</p>
        )}
        {isBlocked && (
          <p className="mt-0.5 text-[10px] text-[#82134C]">Held — compliance review</p>
        )}
      </div>
      <div className={cn("shrink-0 whitespace-nowrap text-right text-[13px] font-bold", amountColor)}>
        {sign}
        {formatAmount(tx.amount, tx.currency)}
        <p className="mt-0.5 text-[10px] font-normal text-[#8C8C8C]">{tx.currency}</p>
      </div>
    </button>
  );
}
