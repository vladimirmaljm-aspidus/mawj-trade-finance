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
      <div className="px-3 py-3">
        {/* Cashflow */}
        <div className="cbi-card px-3 py-3">
          <p className="text-[15px] font-bold text-[#595959]">Cashflow (Period)</p>
          <div className="mt-2 flex items-center justify-between border-t border-[#E5E5E5] pt-2">
            <span className="flex items-center gap-2 text-[12.5px] text-[#7F7F7F]">
              <span className="h-[8px] w-[8px] bg-[#000F32]" /> Money In
            </span>
            <span className="text-[16px] font-bold text-[#217A3B]">+{formatEUR(income)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12.5px] text-[#7F7F7F]">
              <span className="h-[8px] w-[8px] bg-[#82134C]" /> Money Out
            </span>
            <span className="text-[16px] font-bold text-[#222222]">-{formatEUR(expenses)}</span>
          </div>
          {/* Flat proportional bar */}
          <div className="mt-3 h-[6px] w-full bg-[#E5E5E5]">
            <div className="h-full bg-[#000F32]" style={{ width: `${incomePct}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between bg-[#F7F7F7] px-2.5 py-2">
            <span className="text-[11px] uppercase text-[#7F7F7F]">Net Flow</span>
            <span
              className={
                net >= 0
                  ? "text-[13px] font-bold text-[#217A3B]"
                  : "text-[13px] font-bold text-[#82134C]"
              }
            >
              {net >= 0 ? "+" : "−"}
              {formatEUR(Math.abs(net))}
            </span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="mt-3 cbi-card px-3 py-3">
          <p className="text-[15px] font-bold text-[#595959]">Spend by Category</p>
          {categories.length === 0 ? (
            <p className="mt-2 border-t border-[#E5E5E5] pt-2 py-6 text-center text-[12px] text-[#9E9E9E]">
              No expenses recorded
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-2.5 border-t border-[#E5E5E5] pt-2">
              {categories.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[12px] text-[#595959]">{cat}</span>
                    <span className="text-[12px] font-bold text-[#222222]">{formatEUR(amt)}</span>
                  </div>
                  <div className="h-[5px] w-full bg-[#E5E5E5]">
                    <div
                      className="h-full bg-[#7A1F3D]"
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
