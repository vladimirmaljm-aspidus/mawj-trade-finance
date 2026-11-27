"use client";

import { useState } from "react";
import { Ship, FileText, ShieldCheck, FileStack, Package, ChevronRight } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { useNav } from "../nav";
import { CbiAccordionCard, CbiRow } from "../cbi";
import { ComplianceGate } from "../ComplianceGate";
import { formatEUR, formatUSD, formatAED } from "@/lib/mbanking/format";
import { cn } from "@/lib/utils";
import type { TradeInstrument } from "@/lib/mbanking/corporate-types";

function fmtMoney(amount: number, currency: string): string {
  if (currency === "USD") return formatUSD(amount);
  if (currency === "AED") return formatAED(amount);
  return formatEUR(amount);
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Flat status chip — colour per tone, uppercase, hairline border. */
export function InstrumentStatusChip({
  status,
  tone,
}: {
  status: string;
  tone: TradeInstrument["statusTone"];
}) {
  const styles: Record<TradeInstrument["statusTone"], string> = {
    active: "text-[#217A3B] border-[#217A3B]/40",
    done: "text-[#595959] border-[#8C8C8C]/60",
    warning: "text-[#82134C] border-[#82134C]/50",
    danger: "text-[#82134C] border-[#82134C]/50",
    info: "text-[#1565C0] border-[#1565C0]/40",
  };
  return (
    <span
      className={cn(
        "border px-1.5 py-[1px] text-[9.5px] font-bold uppercase tracking-wide",
        styles[tone]
      )}
    >
      {status}
    </span>
  );
}

/** One instrument row inside a section accordion. */
function InstrumentRow({ instrument }: { instrument: TradeInstrument }) {
  const { openInstrument } = useNav();
  const available = instrument.amount - instrument.utilized;
  return (
    <div className="border-b border-[#E0E0E0] py-2.5 last:border-b-0">
      <button
        onClick={() => openInstrument(instrument.ref)}
        className="flex w-full items-center justify-between text-left active:opacity-70"
      >
        <span className="text-[13px] font-bold text-[#595959]">{instrument.ref}</span>
        <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
      </button>
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <p className="min-w-0 truncate text-[11px] text-[#7F7F7F]">
          {instrument.beneficiary} · {instrument.beneficiaryCountry}
        </p>
        <InstrumentStatusChip status={instrument.status} tone={instrument.statusTone} />
      </div>
      <div className="pt-1">
        <CbiRow
          label={`${instrument.kindLabel} Amount`}
          value={fmtMoney(instrument.amount, instrument.currency)}
          currency={instrument.currency}
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
        <CbiRow
          label="Expiry"
          value={fmtDate(instrument.expiry)}
        />
      </div>
    </div>
  );
}

interface Section {
  key: string;
  title: string;
  icon: typeof Ship;
  instruments: TradeInstrument[];
}

export function TradeFinancePage() {
  const instruments = useMbanking((s) => s.tradeInstruments);

  const importLcs = instruments.filter((i) => i.kind === "import-lc");
  const exportLcs = instruments.filter((i) => i.kind === "export-lc");
  const lgs = instruments.filter(
    (i) => i.kind === "lg-performance" || i.kind === "lg-advance"
  );
  const collections = instruments.filter(
    (i) => i.kind === "collection-import" || i.kind === "collection-export"
  );
  const trustReceipts = instruments.filter((i) => i.kind === "trust-receipt");

  // Exposure aggregates.
  const importCommitment = importLcs.reduce(
    (sum, i) => sum + (i.amount - i.utilized),
    0
  );
  const importLcCurrency = importLcs[0]?.currency ?? "EUR";
  const lgOutstanding = lgs.reduce((sum, i) => sum + i.utilized, 0);
  const collectionsValue = collections.reduce((sum, i) => sum + i.amount, 0);

  const sections: Section[] = [
    { key: "import", title: "Import Letters of Credit", icon: Ship, instruments: importLcs },
    { key: "export", title: "Export Letters of Credit", icon: FileText, instruments: exportLcs },
    { key: "lg", title: "Letters of Guarantee", icon: ShieldCheck, instruments: lgs },
    { key: "collections", title: "Documentary Collections", icon: FileStack, instruments: collections },
    { key: "tr", title: "Trust Receipts", icon: Package, instruments: trustReceipts },
  ];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    import: true,
    export: false,
    lg: true,
    collections: true,
    tr: false,
  });

  const toggle = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  return (
    <SubPage title="Trade Finance">
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* Exposure summary */}
        <div className="cbi-card overflow-hidden">
          <div className="h-[18px] w-full bg-[#82134C]" />
          <div className="px-3 pb-2.5 pt-2.5">
            <div className="flex items-baseline justify-between py-0.5">
              <span className="text-[15px] font-bold text-[#595959]">
                Trade Finance Exposure
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[#7F7F7F]">
                {instruments.length} instruments
              </span>
            </div>
            <div className="mt-1 border-t border-[#E0E0E0] pt-1.5">
              <CbiRow
                label="Import LC Commitment"
                value={fmtMoney(importCommitment, importLcCurrency)}
                currency={importLcCurrency}
              />
              <CbiRow
                label="Guarantees Outstanding"
                value={formatAED(lgOutstanding)}
                currency="AED"
              />
              <CbiRow
                label="Collections Under Processing"
                value={fmtMoney(collectionsValue, "EUR")}
                currency="EUR"
              />
              <CbiRow label="Trust Receipts Outstanding" value="0.00" currency="USD" />
            </div>
          </div>
        </div>

        {/* Instrument sections */}
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <CbiAccordionCard
              key={section.key}
              title={section.title}
              open={openSections[section.key] ?? false}
              onToggle={() => toggle(section.key)}
              summaryLabel="Instruments"
              summaryValue={String(section.instruments.length)}
            >
              <div className="pb-1">
                <div className="mb-1 flex items-center gap-1.5 text-[#7A1F3D]">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  <span className="text-[10px] uppercase tracking-wide">
                    {section.title}
                  </span>
                </div>
                {section.instruments.length === 0 ? (
                  <p className="py-2 text-center text-[12px] text-[#9E9E9E]">
                    No instruments
                  </p>
                ) : (
                  section.instruments.map((i) => (
                    <InstrumentRow key={i.ref} instrument={i} />
                  ))
                )}
              </div>
            </CbiAccordionCard>
          );
        })}

        {/* New applications suspended while the compliance case is open */}
        <ComplianceGate action="New Trade Finance Application" />
      </div>
    </SubPage>
  );
}
