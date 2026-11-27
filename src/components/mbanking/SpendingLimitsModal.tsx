"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { CardInfo } from "@/lib/mbanking/types";
import { formatEUR } from "@/lib/mbanking/format";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import { CbiButton } from "./cbi";

interface Props {
  card: CardInfo;
  onClose: () => void;
}

/**
 * Spending limits modal — flat white card, sharp corners, magenta header
 * strip. Shows daily/monthly limits and a simulated spend-so-far bar. Lets
 * the user adjust the daily limit (demo only — not persisted to the
 * backend in this version).
 */
export function SpendingLimitsModal({ card, onClose }: Props) {
  const [daily, setDaily] = useState(card.daily_limit);
  const [monthly, setMonthly] = useState(card.monthly_limit);

  // Simulated spend (in a real app this would come from the API).
  const spentToday = Math.round(card.daily_limit * 0.34);
  const spentMonth = Math.round(card.monthly_limit * 0.42);

  const dailyPct = Math.min(100, Math.round((spentToday / daily) * 100));
  const monthlyPct = Math.min(100, Math.round((spentMonth / monthly) * 100));

  const save = () => {
    toast("Limits updated (demo — not persisted).", "success");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-[#000F32]/60 px-4"
      onClick={onClose}
    >
      <div
        className="fade-in max-h-[88vh] w-full max-w-md overflow-y-auto hide-scrollbar bg-white shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Magenta header strip */}
        <div className="flex h-[48px] items-center justify-between bg-[#82134C] px-3">
          <div>
            <h2 className="text-[15px] font-bold text-white">
              Spending Limits
            </h2>
            <p className="text-[11px] text-white/80">{card.label}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center text-white active:opacity-70"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {/* Today's spend */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-[#7F7F7F]">Spent Today</span>
              <span className="text-[13px] font-bold text-[#222222]">
                {formatEUR(spentToday)}
              </span>
            </div>
            <div className="mt-1.5 h-[6px] w-full bg-[#E5E5E5]">
              <div
                className={cn(
                  "h-full transition-all",
                  dailyPct > 80 ? "bg-[#82134C]" : "bg-[#1565C0]"
                )}
                style={{ width: `${dailyPct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-[#7F7F7F]">
              {dailyPct}% of {formatEUR(daily)} daily limit
            </p>
          </div>

          {/* Monthly spend */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-[#7F7F7F]">
                Spent This Month
              </span>
              <span className="text-[13px] font-bold text-[#222222]">
                {formatEUR(spentMonth)}
              </span>
            </div>
            <div className="mt-1.5 h-[6px] w-full bg-[#E5E5E5]">
              <div
                className={cn(
                  "h-full transition-all",
                  monthlyPct > 80 ? "bg-[#82134C]" : "bg-[#1565C0]"
                )}
                style={{ width: `${monthlyPct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-[#7F7F7F]">
              {monthlyPct}% of {formatEUR(monthly)} monthly limit
            </p>
          </div>

          {/* Adjust limits */}
          <div className="flex flex-col gap-4 border-t border-[#E5E5E5] pt-4">
            <div>
              <label
                htmlFor="daily-limit"
                className="mb-1 block text-[12px] text-[#7F7F7F]"
              >
                Daily Limit (EUR)
              </label>
              <input
                id="daily-limit"
                type="number"
                value={daily}
                min={1000}
                step={5000}
                onChange={(e) => setDaily(Number(e.target.value) || 0)}
                className="w-full border-b border-[#E8306E] bg-white pb-2 pt-1 text-right font-mono text-[14px] font-bold text-[#222222] outline-none focus:border-[#82134C]"
              />
            </div>
            <div>
              <label
                htmlFor="monthly-limit"
                className="mb-1 block text-[12px] text-[#7F7F7F]"
              >
                Monthly Limit (EUR)
              </label>
              <input
                id="monthly-limit"
                type="number"
                value={monthly}
                min={5000}
                step={50000}
                onChange={(e) => setMonthly(Number(e.target.value) || 0)}
                className="w-full border-b border-[#E8306E] bg-white pb-2 pt-1 text-right font-mono text-[14px] font-bold text-[#222222] outline-none focus:border-[#82134C]"
              />
            </div>
          </div>

          {dailyPct > 80 && (
            <div className="flex items-center gap-2 border border-[#82134C]/40 px-3 py-2 text-[11.5px] text-[#82134C]">
              <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              Approaching daily limit threshold.
            </div>
          )}

          <CbiButton onClick={save}>Save Limits</CbiButton>
        </div>
      </div>
    </div>
  );
}
