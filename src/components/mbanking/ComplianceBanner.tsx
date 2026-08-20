"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ChevronRight, Lock, AlertTriangle } from "lucide-react";
import { useMbanking } from "@/lib/mbanking/store";
import { useNav } from "./nav";
import type { ComplianceCase } from "@/lib/mbanking/compliance-types";
import { cn } from "@/lib/utils";

/** Computes the days/hours remaining until the final deadline. */
function useCountdown(targetIso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!targetIso) return { days: 0, hours: 0, minutes: 0, expired: false };
  const target = new Date(targetIso).getTime();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes, expired: false };
}

/** Prominent banner shown on the home screen when a compliance case is active. */
export function ComplianceBanner({ caseRow }: { caseRow: ComplianceCase }) {
  const { openSubPage } = useNav();
  const { days, hours, expired } = useCountdown(caseRow.deadline_2);

  return (
    <button
      onClick={() => openSubPage("compliance")}
      className={cn(
        "active-scale relative w-full overflow-hidden rounded-[1.5rem] border p-5 text-left shadow-lg transition-all",
        "border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50"
      )}
    >
      {/* Severity accent stripe on the left */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-500" />

      <div className="flex items-start gap-3 pl-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-sm">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-slate-900">
              Compliance Review in Progress
            </p>
            <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-800">
              Critical
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600">
            Funds blocked · {caseRow.case_reference}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 shadow-sm">
              <Lock className="h-3 w-3 text-amber-700" />
              <span className="text-[11px] font-black text-slate-900">
                €{Math.round(caseRow.amount_blocked).toLocaleString("en-IE")} held
              </span>
            </div>
            {!expired ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5">
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                <span className="font-mono text-[11px] font-black text-white">
                  {days}d {hours}h left
                </span>
              </div>
            ) : (
              <div className="rounded-lg bg-rose-600 px-2.5 py-1.5">
                <span className="text-[11px] font-black text-white">DEADLINE PASSED</span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
      </div>
    </button>
  );
}
