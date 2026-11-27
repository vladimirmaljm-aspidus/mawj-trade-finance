"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNav } from "./nav";
import type { ComplianceCase } from "@/lib/mbanking/compliance-types";

/** Computes the days/hours remaining until the final deadline. */
function useCountdown(targetIso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!targetIso) return { days: 0, hours: 0, expired: false };
  const target = new Date(targetIso).getTime();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours, expired: false };
}

/** CBI flat notice card (magenta ribbon + white body) for the active compliance case. */
export function ComplianceBanner({ caseRow }: { caseRow: ComplianceCase }) {
  const { openSubPage } = useNav();
  const { days, hours, expired } = useCountdown(caseRow.deadline_2);

  return (
    <div className="cbi-card overflow-hidden">
      <div className="h-[18px] w-full bg-[#82134C]" />
      <button
        onClick={() => openSubPage("compliance")}
        className="flex w-full items-start justify-between px-3 py-2.5 text-left active:opacity-70"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-[#595959]">Compliance Notice</p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#7F7F7F]">
            Funds temporarily blocked pending document review · {caseRow.case_reference}
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="text-[11px] text-[#82134C]">
              €{Math.round(caseRow.amount_blocked).toLocaleString("en-IE")} held
            </span>
            <span className="text-[11px] font-bold text-[#82134C]">
              {expired ? "DEADLINE PASSED" : `${days}d ${hours}h to deadline`}
            </span>
          </div>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#8C8C8C]" />
      </button>
    </div>
  );
}
