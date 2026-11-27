"use client";

import { useMemo, useState } from "react";
import { Search, ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import { SubPage } from "../SubPage";
import { CbiSectionTitle } from "../cbi";
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
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9E9E9E]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-8 w-40 rounded-[2px] border border-[#D9D9D9] bg-white pl-8 pr-2 text-[12px] text-[#222222] outline-none placeholder:text-[#9E9E9E] focus:border-[#82134C] sm:w-52"
          />
        </div>
      }
    >
      <div className="px-3 py-3">
        {/* Type filter — flat segmented tabs (navy active) */}
        <div className="cbi-card flex">
          {(["all", "income", "expense"] as TypeFilter[]).map((f, i) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-bold uppercase",
                i !== 0 && "border-l border-[#E5E5E5]",
                typeFilter === f ? "bg-[#000F32] text-white" : "text-[#595959] active:opacity-70"
              )}
            >
              {f === "income" && <ArrowDownLeft className="h-3.5 w-3.5" />}
              {f === "expense" && <ArrowUpRight className="h-3.5 w-3.5" />}
              {f}
            </button>
          ))}
        </div>

        {/* Account filter — flat hairline tabs (navy active) */}
        <div className="mb-3 mt-2 flex gap-1.5 overflow-x-auto hide-scrollbar">
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
                "shrink-0 px-3 py-1.5 text-[12px] font-bold",
                acctFilter === a.id
                  ? "bg-[#000F32] text-white"
                  : "border border-[#D9D9D9] bg-white text-[#7F7F7F] active:opacity-70"
              )}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Month-grouped transaction list */}
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto hide-scrollbar">
          {filtered.length === 0 ? (
            <div className="cbi-card px-6 py-8 text-center">
              <p className="text-[13px] font-bold text-[#7F7F7F]">No matching transactions</p>
              {hasFilters && (
                <button
                  onClick={() => {
                    setQuery("");
                    setTypeFilter("all");
                    setAcctFilter("all");
                  }}
                  className="mx-auto mt-3 flex items-center gap-1 text-[11px] font-bold uppercase text-[#7A1F3D] active:opacity-70"
                >
                  <X className="h-3 w-3" strokeWidth={1.8} /> Clear filters
                </button>
              )}
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="mb-3">
                <CbiSectionTitle>{group.label}</CbiSectionTitle>
                <div className="cbi-card">
                  {group.items.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <p className="mt-2 text-center text-[10px] uppercase text-[#9E9E9E]">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>
    </SubPage>
  );
}
