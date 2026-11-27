"use client";

import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SubPage } from "../SubPage";
import { CbiButton } from "../cbi";
import { useMbanking, BANK } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";

export function ReceivePage() {
  const profile = useMbanking((s) => s.profile);
  const accounts = useMbanking((s) => s.accounts);

  const primary = accounts.find((a) => a.is_primary) ?? accounts[0];
  const companyName = profile?.company_name ?? "Aspidus DMCC";
  const iban = primary?.iban ?? "";
  const bic = primary?.bic ?? "CLBIAEADXXX";

  const copy = (label: string, value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    toast(`${label} copied securely`, "success");
  };

  const sepaString = `SWIFT\nIBAN:${iban}\nBIC:${bic}\nNAME:${companyName}`;

  return (
    <SubPage title="Funding Details">
      <div className="px-3 py-3">
        {/* Beneficiary */}
        <div className="cbi-card px-3 py-3">
          <p className="text-[15px] font-bold text-[#595959]">{companyName}</p>
          <p className="mt-0.5 text-[11px] text-[#7F7F7F]">{primary?.label ?? "EUR Main Treasury"}</p>
        </div>

        {/* QR — flat white card */}
        <div className="mt-2 cbi-card flex flex-col items-center px-3 py-4">
          <QRCodeSVG
            value={sepaString}
            size={180}
            level="M"
            bgColor="#ffffff"
            fgColor="#000F32"
          />
          <p className="mt-2 text-[10px] uppercase text-[#9E9E9E]">Scan · SWIFT International Transfer</p>
        </div>

        {/* Account details rows */}
        <div className="mt-2 cbi-card px-3 py-2.5">
          <p className="pb-1 text-[15px] font-bold text-[#595959]">Account Details</p>
          <div className="border-t border-[#E5E5E5] pt-1">
            <CopyRow label="IBAN (CBI UAE)" value={iban} onCopy={() => copy("IBAN", iban)} />
            <CopyRow label="BIC / SWIFT" value={bic} onCopy={() => copy("BIC", bic)} />
            <CopyRow
              label="Beneficiary"
              value={companyName}
              onCopy={() => copy("Beneficiary", companyName)}
            />
            <CopyRow
              label="Bank"
              value={BANK.legalName}
              onCopy={() => copy("Bank", BANK.legalName)}
            />
          </div>
        </div>

        <div className="mt-3">
          <CbiButton onClick={() => copy("Account details", sepaString)}>
            <span className="flex items-center justify-center gap-2">
              <Copy className="h-4 w-4" strokeWidth={1.8} />
              Share Details
            </span>
          </CbiButton>
        </div>

        <p className="mt-3 px-2 text-center text-[11px] leading-relaxed text-[#7F7F7F]">
          Funds typically settle same business day for local AED transfers, 1–3 business days for SWIFT.
        </p>
        <p className="mt-2 text-center text-[10px] uppercase text-[#9E9E9E]">
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
    <div className="flex items-center justify-between border-b border-[#E5E5E5] py-2.5 last:border-b-0">
      <div className="min-w-0 pr-2">
        <p className="text-[12px] text-[#7F7F7F]">{label}</p>
        <p className="mt-0.5 break-all font-mono text-[13px] font-bold text-[#222222]">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center border border-[#D9D9D9] bg-white text-[#7A1F3D] active:opacity-70"
        aria-label={`Copy ${label}`}
      >
        <Copy className="h-4 w-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}
