"use client";

import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { formatEUR } from "@/lib/mbanking/format";

export function AnalyticsPage() {
  const transactions = useMbanking((s) => s.transactions);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;
  const incomePct = income > 0 ? Math.round((income / (income + expenses)) * 100) : 0;

  // Category breakdown for expenses
  const byCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});
  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = categories[0]?.[1] ?? 1;

  return (
    <SubPage title="Data Insights">
      <div className="flex flex-col gap-4 p-5 pt-6">
        {/* Cashflow */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Cashflow (Period)
          </p>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Money In
            </span>
            <span className="text-lg font-black text-emerald-600">
              +{formatEUR(income)}
            </span>
          </div>
          <div className="mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Money Out
            </span>
            <span className="text-lg font-black text-rose-600">
              -{formatEUR(expenses)}
            </span>
          </div>
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full rounded-r-full bg-emerald-500"
              style={{ width: `${incomePct}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Net Flow
            </span>
            <span
              className={
                net >= 0
                  ? "text-sm font-black text-emerald-600"
                  : "text-sm font-black text-rose-600"
              }
            >
              {net >= 0 ? "+" : "−"}
              {formatEUR(Math.abs(net))}
            </span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Spend by Category
          </p>
          {categories.length === 0 ? (
            <p className="py-6 text-center text-xs font-bold text-slate-400">
              No expenses recorded
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {categories.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-slate-900">{formatEUR(amt)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${Math.max(4, (amt / maxCat) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SubPage>
  );
}
