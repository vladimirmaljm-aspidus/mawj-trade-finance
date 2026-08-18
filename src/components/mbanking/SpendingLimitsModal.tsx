"use client";

import { useState } from "react";
import { X, SlidersHorizontal, TrendingUp, AlertTriangle } from "lucide-react";
import type { CardInfo } from "@/lib/mbanking/types";
import { formatEUR } from "@/lib/mbanking/format";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";

interface Props {
  card: CardInfo;
  onClose: () => void;
}

/**
 * Spending limits modal — shows daily/monthly limits and a simulated
 * spend-so-far bar. Lets the user adjust the daily limit (demo only —
 * not persisted to the backend in this version).
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
      className="fixed inset-0 z-[85] flex items-end justify-center bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="aspidus-sheet w-full max-w-md rounded-t-[2rem] bg-white p-6 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Spending Limits</h2>
              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Today's spend */}
        <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <TrendingUp className="h-3.5 w-3.5" />
              Spent Today
            </span>
            <span className="text-sm font-black text-slate-900">
              {formatEUR(spentToday)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                dailyPct > 80 ? "bg-rose-500" : "bg-slate-900"
              )}
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {dailyPct}% of {formatEUR(daily)} daily limit
          </p>
        </div>

        {/* Monthly spend */}
        <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <TrendingUp className="h-3.5 w-3.5" />
              Spent This Month
            </span>
            <span className="text-sm font-black text-slate-900">
              {formatEUR(spentMonth)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                monthlyPct > 80 ? "bg-rose-500" : "bg-slate-900"
              )}
              style={{ width: `${monthlyPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {monthlyPct}% of {formatEUR(monthly)} monthly limit
          </p>
        </div>

        {/* Adjust limits */}
        <div className="mb-4">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Daily Limit (EUR)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={daily}
              min={1000}
              step={5000}
              onChange={(e) => setDaily(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Monthly Limit (EUR)
          </label>
          <input
            type="number"
            value={monthly}
            min={5000}
            step={50000}
            onChange={(e) => setMonthly(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>

        {dailyPct > 80 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Approaching daily limit threshold.
          </div>
        )}

        <button
          onClick={save}
          className="active-scale w-full rounded-xl bg-slate-900 py-3.5 text-sm font-black text-white shadow-md transition-colors hover:bg-slate-800"
        >
          Save Limits
        </button>

        <style jsx>{`
          .aspidus-sheet {
            animation: aspidus-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes aspidus-up {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
