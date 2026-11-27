"use client";

import { FileText, Clock, Bell, Info } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { useNav } from "../nav";
import { CbiButton, CbiRow, HexagonIcon } from "../cbi";
import { toast } from "@/lib/mbanking/toast";
import { formatEUR, formatUSD, formatAED } from "@/lib/mbanking/format";
import { InstrumentStatusChip, fmtDate } from "./TradeFinancePage";
import { cn } from "@/lib/utils";

function fmtMoney(amount: number, currency: string): string {
  if (currency === "USD") return formatUSD(amount);
  if (currency === "AED") return formatAED(amount);
  return formatEUR(amount);
}

/** Flat utilization bar — navy fill on a hairline track. */
function UtilizationBar({ pct }: { pct: number }) {
  return (
    <div className="mt-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-[#7F7F7F]">Utilization</span>
        <span className="text-[12.5px] font-bold text-[#222222]">
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="mt-1 h-[6px] w-full bg-[#E5E5E5]">
        <div
          className="h-full bg-[#000F32]"
          style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
        />
      </div>
    </div>
  );
}

export function TradeInstrumentPage() {
  const ref = useNav((n) => n.selectedInstrumentRef);
  const instruments = useMbanking((s) => s.tradeInstruments);
  const complianceCase = useMbanking((s) => s.complianceCase);
  const instrument = instruments.find((i) => i.ref === ref) ?? null;

  if (!instrument) {
    return (
      <SubPage title="Trade Finance">
        <div className="px-3 py-8 text-center">
          <p className="text-[13px] text-[#7F7F7F]">Instrument not found.</p>
        </div>
      </SubPage>
    );
  }

  const available = instrument.amount - instrument.utilized;
  const utilizationPct = (instrument.utilized / instrument.amount) * 100;
  const marginAmount = instrument.marginPct
    ? instrument.amount * instrument.marginPct
    : null;

  return (
    <SubPage title={instrument.ref}>
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* Header — kind + status chip */}
        <div className="cbi-card px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HexagonIcon width={40}>
                <FileText className="h-[18px] w-[18px]" strokeWidth={1.7} />
              </HexagonIcon>
              <p className="text-[14px] font-bold text-[#595959]">
                {instrument.kindLabel}
              </p>
            </div>
            <InstrumentStatusChip
              status={instrument.status}
              tone={instrument.statusTone}
            />
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#7F7F7F]">
            {instrument.goods}
          </p>
        </div>

        {/* Overview rows */}
        <div className="cbi-card px-3 py-2.5">
          <p className="pb-1 text-[13px] font-bold text-[#595959]">
            Instrument Overview
          </p>
          <CbiRow label="Type" value={instrument.kindLabel} />
          <CbiRow
            label={instrument.kind === "export-lc" ? "Applicant" : "Beneficiary"}
            value={`${instrument.beneficiary} — ${instrument.beneficiaryCountry}`}
          />
          {instrument.issuingBank && (
            <CbiRow label="Issuing Bank" value={instrument.issuingBank} />
          )}
          <CbiRow
            label="Instrument Amount"
            value={fmtMoney(instrument.amount, instrument.currency)}
            currency={instrument.currency}
            bold
          />
          <CbiRow
            label="Utilized"
            value={fmtMoney(instrument.utilized, instrument.currency)}
            currency={instrument.currency}
          />
          {available > 0 && (
            <CbiRow
              label="Available Commitment"
              value={fmtMoney(available, instrument.currency)}
              currency={instrument.currency}
            />
          )}
          <CbiRow label="Issued / Advised" value={fmtDate(instrument.openedAt)} />
          <CbiRow label="Expiry / Final Due" value={fmtDate(instrument.expiry)} />
          <CbiRow label="Payment Terms" value={instrument.tenor} />
          {instrument.incoterms && (
            <CbiRow label="Incoterms" value={instrument.incoterms} />
          )}
          {instrument.loadingPort && (
            <CbiRow label="Loading Port" value={instrument.loadingPort} />
          )}
          {instrument.dischargePort && (
            <CbiRow label="Discharge Port" value={instrument.dischargePort} />
          )}
          {instrument.latestShipment && (
            <CbiRow
              label="Latest Shipment Date"
              value={fmtDate(instrument.latestShipment)}
            />
          )}
          {instrument.partialShipments && (
            <CbiRow label="Partial Shipments" value={instrument.partialShipments} />
          )}
          {instrument.transferable !== undefined && (
            <CbiRow
              label="Transferable"
              value={instrument.transferable ? "Yes" : "No"}
            />
          )}
          {marginAmount !== null && (
            <CbiRow
              label={`Cash Margin (${(instrument.marginPct ?? 0) * 100}%)`}
              value={fmtMoney(marginAmount, instrument.currency)}
              currency={instrument.currency}
            />
          )}
          <div className="mt-1.5 border-t border-[#E5E5E5] pt-1.5">
            <UtilizationBar pct={utilizationPct} />
          </div>
        </div>

        {/* Charges */}
        {instrument.charge && (
          <div className="cbi-card px-3 py-2.5">
            <div className="flex items-center gap-1.5 pb-1">
              <Clock className="h-3.5 w-3.5 text-[#7A1F3D]" strokeWidth={1.8} />
              <p className="text-[13px] font-bold text-[#595959]">
                Charges & Commissions
              </p>
            </div>
            <CbiRow label="Rate" value={instrument.charge.rate} />
            <CbiRow label="Basis" value={instrument.charge.basis} />
            <CbiRow
              label="Next Debit"
              value={fmtDate(instrument.charge.nextDebit)}
            />
            <CbiRow
              label="Next Debit Amount"
              value={fmtMoney(instrument.charge.amount, instrument.currency)}
              currency={instrument.currency}
              bold
            />
            <p className="mt-1 text-[10px] leading-relaxed text-[#9E9E9E]">
              Debited automatically by the bank under the standing issuance
              agreement — continues while the account is under compliance review.
            </p>
          </div>
        )}

        {/* Documents required */}
        {instrument.documentsRequired && (
          <div className="cbi-card px-3 py-2.5">
            <div className="flex items-center gap-1.5 pb-1">
              <FileText className="h-3.5 w-3.5 text-[#7A1F3D]" strokeWidth={1.8} />
              <p className="text-[13px] font-bold text-[#595959]">
                Documents Required
              </p>
            </div>
            {instrument.documentsRequired.map((doc) => (
              <div
                key={doc}
                className="flex items-center gap-2 border-b border-[#E5E5E5] py-[7px] last:border-b-0"
              >
                <span className="h-[6px] w-[6px] shrink-0 bg-[#000F32]" />
                <span className="text-[12px] text-[#333333]">{doc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="cbi-card px-3 py-2.5">
          <p className="pb-1.5 text-[13px] font-bold text-[#595959]">
            Transaction History
          </p>
          {instrument.events.map((ev, idx) => (
            <div
              key={idx}
              className="relative border-l-2 border-[#E5E5E5] pb-3 pl-3 last:pb-0"
            >
              <span
                className={cn(
                  "absolute -left-[5px] top-[3px] h-2 w-2",
                  idx === instrument.events.length - 1
                    ? "bg-[#82134C]"
                    : "bg-[#000F32]"
                )}
              />
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[12.5px] font-bold text-[#333333]">{ev.title}</p>
                <p className="shrink-0 text-[10px] text-[#9E9E9E]">
                  {fmtDate(ev.date)}
                </p>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#7F7F7F]">
                {ev.description}
              </p>
            </div>
          ))}
        </div>

        {/* Compliance restriction note */}
        {instrument.complianceNote && (
          <div className="cbi-card overflow-hidden">
            <div className="h-[6px] w-full bg-[#82134C]" />
            <div className="flex items-start gap-2.5 px-3 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#82134C]" strokeWidth={1.8} />
              <p className="text-[11.5px] leading-relaxed text-[#595959]">
                {instrument.complianceNote}
              </p>
            </div>
          </div>
        )}

        {/* Amendment request — suspended under the compliance case */}
        <CbiButton
          onClick={() =>
            toast(
              complianceCase
                ? `Amendment requests suspended pending compliance review (${complianceCase.case_reference})`
                : "Amendment request submitted to your relationship manager",
              "error"
            )
          }
        >
          Request Amendment
        </CbiButton>

        {/* Expiry reminder toast trigger */}
        <button
          onClick={() =>
            toast(
              `Reminder set for ${fmtDate(instrument.expiry)} — we will notify you 30 days before expiry`,
              "success"
            )
          }
          className="flex w-full items-center justify-center gap-2 py-2 text-[12px] text-[#1565C0] active:opacity-70"
        >
          <Bell className="h-3.5 w-3.5" strokeWidth={1.8} />
          Set Expiry Reminder
        </button>
      </div>
    </SubPage>
  );
}
