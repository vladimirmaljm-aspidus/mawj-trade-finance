"use client";

import {
  Eye,
  EyeOff,
  ArrowDownToLine,
  Send,
  Landmark,
  CreditCard,
  BarChart2,
  FileCheck2,
  ChevronRight,
} from "lucide-react";
import { useMbanking } from "@/lib/mbanking/store";
import { formatBalanceParts, formatEUR } from "@/lib/mbanking/format";
import { useNav } from "../nav";
import { TransactionItem } from "../ui/TransactionItem";
import { toast } from "@/lib/mbanking/toast";

export function HomeTab() {
  const { balance, transactions, hideBalance, setHideBalance } = useMbanking();
  const { openSubPage, setTab } = useNav();

  const { whole, cents } = formatBalanceParts(balance);
  const recent = transactions.slice(0, 4);

  // Monthly spending: sum of expenses in the last 30 days, capped to a 10M limit for the bar.
  const monthExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyLimit = 10_000_000;
  const spentPct = Math.min(100, Math.round((monthExpenses / monthlyLimit) * 100));

  return (
    <div className="fade-in flex flex-col gap-6">
      {/* Balance card */}
      <div className="premium-navy-card relative overflow-hidden rounded-[2rem] p-7 text-white shadow-2xl">
        {/* UAE flag accent strip — top of balance card */}
        <div className="uae-flag-accent absolute left-0 right-0 top-0 h-1 opacity-80" />
        <div className="relative z-10 mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                Total Liquidity (EUR)
              </p>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="text-slate-400 transition-colors hover:text-white"
                aria-label={hideBalance ? "Show balance" : "Hide balance"}
              >
                {hideBalance ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            {hideBalance ? (
              <h1 className="text-[2.5rem] font-black leading-none tracking-tighter drop-shadow-md">
                ••••••••
              </h1>
            ) : (
              <h1 className="text-[2.5rem] font-black leading-none tracking-tighter text-white drop-shadow-md">
                €{whole}.<span className="text-2xl font-bold text-slate-400">{cents}</span>
              </h1>
            )}
          </div>
        </div>

        <div className="relative z-10 mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
              Yield Earned YTD
            </p>
            <p className="mt-0.5 text-sm font-bold text-emerald-400">
              +€452,100.00 (4.2% APY)
            </p>
          </div>
          <div className="h-8 w-[1px] bg-white/20" />
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
              Pending Clearing
            </p>
            <p className="mt-0.5 text-sm font-bold text-amber-400">€1,200,000.00</p>
          </div>
        </div>

        <div className="relative z-10 flex gap-3">
          <button
            onClick={() => openSubPage("receive")}
            className="active-scale flex flex-1 items-center justify-center gap-2 rounded-[1rem] bg-white py-3.5 text-[13px] font-black text-emerald-950 shadow-lg transition-colors hover:bg-slate-100"
          >
            <ArrowDownToLine className="h-4 w-4 stroke-[2.5]" />
            Add Funds
          </button>
          <button
            onClick={() => setTab("payments")}
            className="active-scale flex flex-1 items-center justify-center gap-2 rounded-[1rem] border border-amber-400/30 bg-amber-500/20 py-3.5 text-[13px] font-black text-white backdrop-blur-md transition-colors hover:bg-amber-500/30"
          >
            <Send className="h-4 w-4 stroke-[2.5]" />
            Send Money
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-1 grid grid-cols-4 gap-3">
        <QuickAction
          label="Accounts"
          icon={<Landmark className="h-5 w-5 stroke-[2]" />}
          tone="blue"
          onClick={() => openSubPage("accounts")}
        />
        <QuickAction
          label="Cards"
          icon={<CreditCard className="h-5 w-5 stroke-[2]" />}
          tone="purple"
          onClick={() => setTab("cards")}
        />
        <QuickAction
          label="Insights"
          icon={<BarChart2 className="h-5 w-5 stroke-[2]" />}
          tone="emerald"
          onClick={() => openSubPage("analytics")}
        />
        <QuickAction
          label="Taxes"
          icon={<FileCheck2 className="h-5 w-5 stroke-[2]" />}
          tone="amber"
          onClick={() => openSubPage("taxes")}
        />
      </div>

      {/* Monthly spending */}
      <button
        onClick={() => openSubPage("analytics")}
        className="active-scale rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-emerald-300"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Monthly Spending</h3>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
        <div className="flex items-end gap-3">
          <p className="text-2xl font-black tracking-tight text-rose-600">
            {formatEUR(monthExpenses)}
          </p>
          <p className="mb-1 text-xs font-bold text-slate-500">
            of {formatEUR(monthlyLimit)} Limit
          </p>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-rose-500 transition-all"
            style={{ width: `${spentPct}%` }}
          />
        </div>
      </button>

      {/* Recent activity */}
      <div className="mt-2">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-[1.1rem] font-black tracking-tight text-slate-900">
            Recent Activity
          </h2>
          <button
            onClick={() => openSubPage("all-transactions")}
            className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:text-emerald-900"
          >
            View All
          </button>
        </div>
        <div className="flex flex-col rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-xs font-bold text-slate-400">
              No activity yet
            </p>
          ) : (
            recent.map((tx) => <TransactionItem key={tx.id} tx={tx} compact />)
          )}
        </div>
      </div>
    </div>
  );
}

const TONE_MAP = {
  blue: { ring: "group-hover:border-blue-400", bg: "bg-blue-50", text: "text-blue-600" },
  purple: { ring: "group-hover:border-purple-400", bg: "bg-purple-50", text: "text-purple-600" },
  emerald: { ring: "group-hover:border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-600" },
  amber: { ring: "group-hover:border-amber-400", bg: "bg-amber-50", text: "text-amber-600" },
} as const;

function QuickAction({
  label,
  icon,
  tone,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  tone: keyof typeof TONE_MAP;
  onClick: () => void;
}) {
  const t = TONE_MAP[tone];
  return (
    <button onClick={onClick} className="active-scale group flex flex-col items-center gap-2">
      <div
        className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white shadow-sm transition-all ${t.ring}`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${t.bg} ${t.text}`}
        >
          {icon}
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
        {label}
      </span>
    </button>
  );
}
