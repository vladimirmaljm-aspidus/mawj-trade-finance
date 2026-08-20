"use client";

import { Plus, Lock, ChevronRight } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { formatCurrency, formatAED } from "@/lib/mbanking/format";
import { toast } from "@/lib/mbanking/toast";
import { useNav } from "../nav";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/mbanking/types";

export function AccountsPage() {
  const accounts = useMbanking((s) => s.accounts);
  const { openSubPage } = useNav();

  return (
    <SubPage
      title="Portfolios"
      headerRight={
        <button
          onClick={() => toast("Open a new portfolio", "info")}
          className="active-scale flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
          aria-label="Add account"
        >
          <Plus className="h-4 w-4" />
        </button>
      }
    >
      <div className="flex flex-col gap-4 p-5 pt-6">
        {accounts.map((a) => (
          <AccountCard key={a.id} account={a} />
        ))}

        <button
          onClick={() => toast("Link an external account", "info")}
          className="active-scale mt-2 flex items-center justify-center gap-2 rounded-[1.5rem] border border-dashed border-slate-300 bg-white/50 py-5 text-xs font-bold text-slate-500 hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          Link External Account
        </button>
      </div>
    </SubPage>
  );
}

function AccountCard({ account }: { account: Account }) {
  const isPrimary = account.primary;
  const complianceCase = useMbanking((s) => s.complianceCase);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] p-6 shadow-sm",
        isPrimary
          ? "premium-navy-card text-white shadow-xl"
          : "border border-slate-200 bg-white text-slate-900"
      )}
    >
      {/* BLOCKED overlay when compliance case is active */}
      {complianceCase && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/90 px-2.5 py-1 shadow-sm">
          <Lock className="h-3 w-3 text-white" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white">
            Blocked
          </span>
        </div>
      )}
      <div className="relative z-10 mb-2 flex items-center justify-between">
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            isPrimary ? "text-slate-300" : "text-slate-500"
          )}
        >
          {account.label}
        </p>
        {isPrimary && (
          <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">
            Primary
          </span>
        )}
      </div>
      <h2 className="relative z-10 mb-1 text-3xl font-black tracking-tighter">
        {formatCurrency(account.balance, account.currency)}
      </h2>
      {account.currency !== "AED" && (
        <p
          className={cn(
            "relative z-10 mb-5 text-[11px] font-semibold",
            isPrimary ? "text-amber-300/80" : "text-slate-500"
          )}
        >
          ≈ {formatAED(account.balance * 3.9545)}
        </p>
      )}
      {account.currency === "AED" && <div className="relative z-10 mb-5" />}
      <p
        className={cn(
          "relative z-10 font-mono text-xs font-bold",
          isPrimary ? "text-slate-400" : "text-slate-400"
        )}
      >
        …{account.iban.slice(-8)}
      </p>

      <button
        onClick={() => {
          toast(`Showing transactions for ${account.label}`, "info");
          openSubPage("all-transactions");
        }}
        className={cn(
          "active-scale relative z-10 mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-black transition-colors",
          isPrimary
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
        )}
      >
        View transactions
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
