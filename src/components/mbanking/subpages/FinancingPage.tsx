"use client";

import { useState } from "react";
import { ArrowLeftRight, Building2, Landmark } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { CbiAccordionCard, CbiRow, HexagonIcon } from "../cbi";
import { ComplianceGate } from "../ComplianceGate";
import { formatAED, formatPlain } from "@/lib/mbanking/format";
import { fmtDate } from "./TradeFinancePage";
import type { LoanFacility } from "@/lib/mbanking/corporate-types";

/** Indicative AED conversion for mixed-currency aggregates. */
const USD_TO_AED = 3.6725;
const EUR_TO_AED = 3.9545;

function toAed(amount: number, currency: string): number {
  if (currency === "AED") return amount;
  if (currency === "USD") return amount * USD_TO_AED;
  return amount * EUR_TO_AED;
}

/** Stable glyph component for the facility type (icons must not be created during render). */
function FacilityGlyph({ type }: { type: LoanFacility["type"] }) {
  if (type === "revolving")
    return <ArrowLeftRight className="h-[15px] w-[15px]" strokeWidth={1.7} />;
  if (type === "term")
    return <Building2 className="h-[15px] w-[15px]" strokeWidth={1.7} />;
  return <Landmark className="h-[15px] w-[15px]" strokeWidth={1.7} />;
}

/** One facility card with rows, utilization and recent movements. */
function FacilityCard({ facility }: { facility: LoanFacility }) {
  const [open, setOpen] = useState(false);
  const available = facility.limit - facility.outstanding;
  const utilizationPct = (facility.outstanding / facility.limit) * 100;

  return (
    <CbiAccordionCard
      title={facility.kindLabel}
      open={open}
      onToggle={() => setOpen((v) => !v)}
      summaryLabel="Outstanding"
      summaryValue={formatPlain(facility.outstanding)}
    >
      <div className="pb-1">
        <div className="flex items-center gap-2 pb-1">
          <HexagonIcon width={34}>
            <FacilityGlyph type={facility.type} />
          </HexagonIcon>
          <span className="text-[11px] font-bold text-[#7A1F3D]">
            {facility.ref}
          </span>
        </div>
        <CbiRow
          label="Approved Limit"
          value={formatPlain(facility.limit)}
          currency={facility.currency}
        />
        <CbiRow
          label="Outstanding"
          value={formatPlain(facility.outstanding)}
          currency={facility.currency}
        />
        <CbiRow
          label="Available"
          value={formatPlain(available)}
          currency={facility.currency}
        />
        <CbiRow label="Rate Basis" value={facility.rateBasis} />
        <CbiRow label="Current Rate" value={facility.currentRate} bold />
        <CbiRow label="Expiry" value={fmtDate(facility.expiry)} />
        {(facility.extras ?? []).map((x) => (
          <CbiRow key={x.label} label={x.label} value={x.value} />
        ))}
        {facility.servicingNote && (
          <p className="mt-1 border-t border-[#E5E5E5] pt-1.5 text-[10.5px] leading-relaxed text-[#9E9E9E]">
            {facility.servicingNote}
          </p>
        )}

        {/* Utilization */}
        <div className="mt-2 border-t border-[#E5E5E5] pt-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] text-[#7F7F7F]">Utilization</span>
            <span className="text-[12.5px] font-bold text-[#222222]">
              {utilizationPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 h-[6px] w-full bg-[#E5E5E5]">
            <div
              className="h-full bg-[#000F32]"
              style={{ width: `${Math.min(100, Math.max(2, utilizationPct))}%` }}
            />
          </div>
        </div>

        {/* Next payment */}
        <div className="mt-2 border-t border-[#E5E5E5] pt-1.5">
          <CbiRow
            label="Next Debit"
            value={fmtDate(facility.nextPayment.date)}
          />
          <CbiRow
            label="Amount"
            value={formatPlain(facility.nextPayment.amount)}
            currency={facility.currency}
            bold
          />
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-[#9E9E9E]">
            {facility.nextPayment.description}
          </p>
        </div>

        {/* Recent movements */}
        <div className="mt-2 border-t border-[#E5E5E5] pt-1.5">
          <p className="pb-1 text-[12px] font-bold text-[#595959]">
            Recent Movements
          </p>
          {facility.movements.map((m, idx) => (
            <div
              key={idx}
              className="flex items-baseline justify-between gap-2 border-b border-[#E5E5E5] py-[6px] last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-[11.5px] text-[#333333]">
                  {m.description}
                </p>
                <p className="text-[10px] text-[#9E9E9E]">{fmtDate(m.date)}</p>
              </div>
              <p className="shrink-0 text-[11.5px] font-bold text-[#222222]">
                {formatPlain(m.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </CbiAccordionCard>
  );
}

export function FinancingPage() {
  const facilities = useMbanking((s) => s.facilities);

  const totalLimitAed = facilities.reduce(
    (sum, f) => sum + toAed(f.limit, f.currency),
    0
  );
  const totalOutstandingAed = facilities.reduce(
    (sum, f) => sum + toAed(f.outstanding, f.currency),
    0
  );
  const totalAvailableAed = totalLimitAed - totalOutstandingAed;

  return (
    <SubPage title="Financing">
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* Portfolio summary */}
        <div className="cbi-card overflow-hidden">
          <div className="h-[18px] w-full bg-[#82134C]" />
          <div className="px-3 pb-2.5 pt-2.5">
            <div className="flex items-baseline justify-between py-0.5">
              <span className="text-[15px] font-bold text-[#595959]">
                Credit Facilities
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[#7F7F7F]">
                {facilities.length} facilities
              </span>
            </div>
            <div className="mt-1 border-t border-[#E0E0E0] pt-1.5">
              <CbiRow
                label="Approved Limits (AED eq.)"
                value={formatAED(totalLimitAed)}
              />
              <CbiRow
                label="Outstanding (AED eq.)"
                value={formatAED(totalOutstandingAed)}
              />
              <CbiRow
                label="Available (AED eq.)"
                value={formatAED(totalAvailableAed)}
              />
              <p className="mt-1 text-[10px] text-[#9E9E9E]">
                Indicative equivalents at today&apos;s board rates.
              </p>
            </div>
          </div>
        </div>

        {/* Facility cards */}
        {facilities.map((f) => (
          <FacilityCard key={f.ref} facility={f} />
        ))}

        {/* New financing requests suspended */}
        <ComplianceGate action="New Financing Request" />
      </div>
    </SubPage>
  );
}
