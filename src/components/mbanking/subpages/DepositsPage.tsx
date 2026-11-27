"use client";

import { Vault, CalendarClock, Percent, Info } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { CbiRow, HexagonIcon } from "../cbi";
import { ComplianceGate } from "../ComplianceGate";
import { formatAED, formatPlain } from "@/lib/mbanking/format";
import { fmtDate } from "./TradeFinancePage";
import type { Deposit } from "@/lib/mbanking/corporate-types";

const USD_TO_AED = 3.6725;
const EUR_TO_AED = 3.9545;

/** Whole days from today until an ISO date (negative if past). */
function daysUntil(iso: string): number {
  const now = new Date();
  const d = new Date(iso);
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((b - a) / 86_400_000);
}

function DepositStatusChip({ status }: { status: Deposit["status"] }) {
  const style =
    status === "Active"
      ? "text-[#217A3B] border-[#217A3B]/40"
      : "text-[#82134C] border-[#82134C]/50";
  return (
    <span
      className={`border px-1.5 py-[1px] text-[9.5px] font-bold uppercase tracking-wide ${style}`}
    >
      {status}
    </span>
  );
}

function DepositCard({ deposit }: { deposit: Deposit }) {
  const days = deposit.maturity ? daysUntil(deposit.maturity) : null;

  return (
    <div className="cbi-card px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HexagonIcon width={38}>
            <Vault className="h-[17px] w-[17px]" strokeWidth={1.7} />
          </HexagonIcon>
          <div>
            <p className="text-[13.5px] font-bold text-[#595959]">
              {deposit.kindLabel}
            </p>
            <p className="text-[10.5px] text-[#7F7F7F]">{deposit.ref}</p>
          </div>
        </div>
        <DepositStatusChip status={deposit.status} />
      </div>

      <div className="mt-2 border-t border-[#E5E5E5] pt-1.5">
        <CbiRow
          label="Principal"
          value={formatPlain(deposit.principal)}
          currency={deposit.currency}
          bold
        />
        <CbiRow label="Interest Rate" value={deposit.rate} />
        <CbiRow label="Value Date" value={fmtDate(deposit.placedAt)} />
        {deposit.maturity && (
          <CbiRow label="Maturity" value={fmtDate(deposit.maturity)} />
        )}
        {days !== null && days > 0 && (
          <CbiRow label="Days to Maturity" value={String(days)} />
        )}
        {deposit.interestAtMaturity !== undefined && (
          <CbiRow
            label="Interest at Maturity"
            value={formatPlain(deposit.interestAtMaturity)}
            currency={deposit.currency}
          />
        )}
        {deposit.lastInterestCredit && (
          <CbiRow
            label="Last Interest Credit"
            value={formatPlain(deposit.lastInterestCredit.amount)}
            currency={deposit.currency}
          />
        )}
        <div className="flex items-start gap-1.5 pt-1.5">
          <CalendarClock
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7A1F3D]"
            strokeWidth={1.8}
          />
          <p className="text-[11px] leading-relaxed text-[#7F7F7F]">
            <span className="font-bold text-[#595959]">Rollover: </span>
            {deposit.rollover}
          </p>
        </div>
        {deposit.note && (
          <div className="mt-1.5 border-t border-[#E5E5E5] pt-1.5">
            <div className="flex items-start gap-2">
              <Info
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#82134C]"
                strokeWidth={1.8}
              />
              <p className="text-[10.5px] leading-relaxed text-[#595959]">
                {deposit.note}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DepositsPage() {
  const deposits = useMbanking((s) => s.deposits);

  const totalPrincipalAed = deposits.reduce((sum, d) => {
    const rate =
      d.currency === "USD" ? USD_TO_AED : d.currency === "EUR" ? EUR_TO_AED : 1;
    return sum + d.principal * rate;
  }, 0);
  const totalMaturityInterestAed = deposits.reduce((sum, d) => {
    const rate =
      d.currency === "USD" ? USD_TO_AED : d.currency === "EUR" ? EUR_TO_AED : 1;
    return sum + (d.interestAtMaturity ?? 0) * rate;
  }, 0);

  return (
    <SubPage title="Deposits">
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* Portfolio summary */}
        <div className="cbi-card overflow-hidden">
          <div className="h-[18px] w-full bg-[#82134C]" />
          <div className="px-3 pb-2.5 pt-2.5">
            <div className="flex items-baseline justify-between py-0.5">
              <span className="text-[15px] font-bold text-[#595959]">
                Deposit Portfolio
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[#7F7F7F]">
                {deposits.length} placements
              </span>
            </div>
            <div className="mt-1 border-t border-[#E0E0E0] pt-1.5">
              <CbiRow
                label="Total Principal (AED eq.)"
                value={formatAED(totalPrincipalAed)}
              />
              <CbiRow
                label="Interest at Maturity (AED eq.)"
                value={formatAED(totalMaturityInterestAed)}
              />
              <div className="flex items-start gap-1.5 pt-1">
                <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7A1F3D]" strokeWidth={1.8} />
                <p className="text-[10px] leading-relaxed text-[#9E9E9E]">
                  Indicative AED equivalents at today&apos;s board rates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit cards */}
        {deposits.map((d) => (
          <DepositCard key={d.ref} deposit={d} />
        ))}

        {/* New placements suspended */}
        <ComplianceGate action="New Deposit Placement" />
      </div>
    </SubPage>
  );
}
