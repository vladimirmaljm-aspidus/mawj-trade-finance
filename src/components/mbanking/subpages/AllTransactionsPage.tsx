"use client";

import { useMemo, useState } from "react";
import { Search, ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { TransactionItem } from "../ui/TransactionItem";
import { monthGroupLabel } from "@/lib/mbanking/format";
import { cn } from "@/lib/utils";

type TypeFilter = "all" | "income" | "expense";
type AccountFilter = "all" | "eur" | "usd" | "aed";

export function AllTransactionsPage() {
  const transactions = useMbanking((s) => s.transactions);
  const accounts = useMbanking((s) => s.accounts);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [acctFilter, setAcctFilter] = useState<AccountFilter>("all");

  // Map account_id → currency for filtering
  const acctCurrency = useMemo(() => {
    const m: Record<string, string> = {};
    for (const a of accounts) m[a.id] = a.currency;
    return m;
  }, [accounts]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      // Account filter
      if (acctFilter !== "all") {
        const cur = t.account_id ? acctCurrency[t.account_id] : null;
        if (cur !== acctFilter.toUpperCase()) return false;
      }
      // Search
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        t.counterparty.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.reference || "").toLowerCase().includes(q)
      );
    });
  }, [transactions, typeFilter, acctFilter, query, acctCurrency]);

  // Group by month
  const grouped = useMemo(() => {
    const groups: { label: string; items: typeof filtered }[] = [];
    let lastLabel = "";
    for (const tx of filtered) {
      const label = monthGroupLabel(tx.occurred_at);
      if (label !== lastLabel) {
        groups.push({ label, items: [] });
        lastLabel = label;
      }
      groups[groups.length - 1].items.push(tx);
    }
    return groups;
  }, [filtered]);

  const hasFilters = typeFilter !== "all" || acctFilter !== "all" || query.trim() !== "";

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
            className="w-40 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-400 sm:w-52"
          />
        </div>
      }
    >
      <div className="px-5 pb-10 pt-4">
        {/* Type filter pills */}
        <div className="mb-3 flex gap-2">
          {(["all", "income", "expense"] as TypeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold capitalize transition-colors",
                typeFilter === f
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

        {/* Account filter pills */}
        <div className="mb-4 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {([
            { id: "all", label: "All Accounts" },
            { id: "eur", label: "EUR Treasury" },
            { id: "usd", label: "USD Reserve" },
            { id: "aed", label: "AED Operating" },
          ] as { id: AccountFilter; label: string }[]).map((a) => (
            <button
              key={a.id}
              onClick={() => setAcctFilter(a.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors",
                acctFilter === a.id
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "border border-slate-200 bg-white text-slate-500"
              )}
            >
              {a.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-bold text-slate-400">No matching transactions</p>
            {hasFilters && (
              <button
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                  setAcctFilter("all");
                }}
                className="mt-3 flex items-center gap-1 mx-auto text-xs font-bold text-slate-500"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {group.label}
                </p>
                <div className="flex flex-col rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
                  {group.items.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} />
                  ))}
                </div>
              </div>
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
