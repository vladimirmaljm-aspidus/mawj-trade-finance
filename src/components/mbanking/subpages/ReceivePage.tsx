"use client";

import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SubPage } from "../SubPage";
import { useMbanking, BANK } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";

export function ReceivePage() {
  const profile = useMbanking((s) => s.profile);
  const accounts = useMbanking((s) => s.accounts);

  const primary = accounts.find((a) => a.is_primary) ?? accounts[0];
  const companyName = profile?.company_name ?? "Aspidus DMCC";
  const iban = primary?.iban ?? "";
  const bic = primary?.bic ?? "COBADEFFXXX";

  const copy = (label: string, value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    toast(`${label} copied securely`, "success");
  };

  const sepaString = `SEPA\nIBAN:${iban}\nBIC:${bic}\nNAME:${companyName}`;

  return (
    <SubPage title="Funding Details">
      <div className="flex flex-col items-center p-6 pt-8">
        <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md">
          <QRCodeSVG
            value={sepaString}
            size={200}
            level="M"
            bgColor="#ffffff"
            fgColor="#0a1628"
          />
        </div>
        <h3 className="mb-1 text-2xl font-black tracking-tight text-slate-900">
          {companyName}
        </h3>
        <p className="mb-8 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
          {primary?.label ?? "EUR Main Treasury"}
        </p>

        <CopyRow label="IBAN (SEPA)" value={iban} onCopy={() => copy("IBAN", iban)} />
        <CopyRow label="BIC / SWIFT" value={bic} onCopy={() => copy("BIC", bic)} />
        <CopyRow
          label="Beneficiary"
          value={companyName}
          onCopy={() => copy("Beneficiary", companyName)}
        />

        <p className="mt-8 px-6 text-center text-[11px] font-semibold text-slate-400">
          Funds typically settle same business day for SEPA, 1–3 days for SWIFT.
        </p>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Routed via {BANK.shortName} · {BANK.license}
        </p>
      </div>
    </SubPage>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="mb-3 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="break-all font-mono text-sm font-black text-slate-900">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="active-scale ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900"
        aria-label={`Copy ${label}`}
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}
