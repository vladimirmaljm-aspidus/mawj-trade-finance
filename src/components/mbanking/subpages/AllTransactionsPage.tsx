"use client";

import { useMemo, useState } from "react";
import { Search, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { TransactionItem } from "../ui/TransactionItem";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";

export function AllTransactionsPage() {
  const transactions = useMbanking((s) => s.transactions);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [transactions, query, filter]);

  return (
    <SubPage
      title="All Activity"
      headerRight={
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-40 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-400 sm:w-52"
          />
        </div>
      }
    >
      <div className="px-5 pb-10 pt-4">
        {/* Filter pills */}
        <div className="mb-4 flex gap-2">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold capitalize transition-colors",
                filter === f
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-500"
              )}
            >
              {f === "income" && <ArrowDownLeft className="h-3.5 w-3.5" />}
              {f === "expense" && <ArrowUpRight className="h-3.5 w-3.5" />}
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-bold text-slate-400">No matching transactions</p>
            <button
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="mt-3 text-xs font-bold text-emerald-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
            {filtered.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        )}

        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>
    </SubPage>
  );
}
