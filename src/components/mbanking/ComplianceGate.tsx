"use client";

import { Lock } from "lucide-react";
import { useMbanking } from "@/lib/mbanking/store";
import { useNav } from "./nav";
import { CbiButton, HexagonIcon } from "./cbi";

/**
 * Notice block used on corporate modules (Trade Finance, Financing,
 * Deposits): new applications / placements / withdrawal requests are
 * suspended while compliance case CBI-CMP-2026-0047 is open — the same
 * restriction that suspends outgoing transfers.
 */
export function ComplianceGate({ action }: { action: string }) {
  const complianceCase = useMbanking((s) => s.complianceCase);
  const { openSubPage } = useNav();

  return (
    <div className="cbi-card overflow-hidden">
      <div className="h-[18px] w-full bg-[#82134C]" />
      <div className="flex flex-col items-center px-4 py-6 text-center">
        <HexagonIcon width={64}>
          <Lock className="h-7 w-7" strokeWidth={1.6} />
        </HexagonIcon>
        <h3 className="mt-3 text-[15px] font-bold text-[#595959]">
          {action} Suspended
        </h3>
        <p className="mt-2 text-[12px] leading-relaxed text-[#7F7F7F]">
          {action} requests are suspended pending compliance review
          {complianceCase ? ` (${complianceCase.case_reference})` : ""}. Existing
          arrangements and bank-side charges continue to operate normally
          under their standing agreements.
        </p>
        {complianceCase && (
          <div className="mt-4 w-full">
            <CbiButton onClick={() => openSubPage("compliance")}>
              View Compliance Case
            </CbiButton>
          </div>
        )}
      </div>
    </div>
  );
}
