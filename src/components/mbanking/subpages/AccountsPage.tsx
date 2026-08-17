"use client";

import { Plus } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { formatCurrency } from "@/lib/mbanking/format";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/mbanking/types";

export function AccountsPage() {
  const accounts = useMbanking((s) => s.accounts);

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
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] p-6 shadow-sm",
        isPrimary
          ? "premium-navy-card text-white shadow-xl"
          : "border border-slate-200 bg-white text-slate-900"
      )}
    >
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
      <h2 className="relative z-10 mb-6 text-3xl font-black tracking-tighter">
        {formatCurrency(account.balance, account.currency)}
      </h2>
      <p
        className={cn(
          "relative z-10 font-mono text-xs font-bold",
          isPrimary ? "text-slate-400" : "text-slate-400"
        )}
      >
        …{account.iban.slice(-8)}
      </p>
    </div>
  );
}
