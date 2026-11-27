"use client";

import { Ban, ArrowDownToLine } from "lucide-react";
import { SubPage } from "../SubPage";
import { CbiButton, CbiRow } from "../cbi";
import { useNav } from "../nav";
import { useMbanking } from "@/lib/mbanking/store";
import { formatEUR, formatUSD, formatAED } from "@/lib/mbanking/format";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";

/** Format amount using the transaction's own currency. */
function formatAmount(amount: number, currency: string): string {
  if (currency === "USD") return formatUSD(amount);
  if (currency === "AED") return formatAED(amount);
  return formatEUR(amount);
}

export function TxDetailsPage() {
  const { selectedTxId } = useNav();
  const transactions = useMbanking((s) => s.transactions);
  const accounts = useMbanking((s) => s.accounts);
  const profile = useMbanking((s) => s.profile);
  const tx = transactions.find((t) => t.id === selectedTxId);

  if (!tx) {
    return (
      <SubPage title="Receipt">
        <div className="px-3 py-8 text-center">
          <p className="text-[13px] text-[#7F7F7F]">Transaction not found.</p>
        </div>
      </SubPage>
    );
  }

  const isIncome = tx.type === "income";
  const sign = isIncome ? "+" : "-";
  const occurredAt = new Date(tx.occurred_at);

  const primary = accounts.find((a) => a.is_primary) ?? accounts[0];
  const accountMask = primary?.iban ? primary.iban.replace(/\s/g, "").slice(-4) : "4289";

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    let y = 60;

    doc.setFillColor(0, 15, 50);
    doc.rect(0, 0, W, 110, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("COMMERCIAL BANK INTERNATIONAL", 40, 50);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.text("CORPORATE BANKING · OFFICIAL RECEIPT", 40, 70);
    doc.text("CBI-UAE-1976 · United Arab Emirates", 40, 84);
    // Brand accent strip
    doc.setFillColor(130, 19, 76);
    doc.rect(40, 92, W - 80, 3, "F");
    doc.setFillColor(0, 15, 50);
    doc.rect(40, 95, W - 80, 3, "F");
    doc.setFillColor(255, 255, 255);
    doc.rect(40, 98, W - 80, 3, "F");
    doc.setFillColor(0, 0, 0);
    doc.rect(40, 101, W - 80, 3, "F");

    y = 150;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Receipt", 40, y);

    y += 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, W - 40, y);

    y += 30;
    doc.setFontSize(22);
    doc.setTextColor(isIncome ? 33 : 34, isIncome ? 122 : 34, isIncome ? 59 : 34);
    doc.text(`${sign}${formatAmount(tx.amount, tx.currency)}`, 40, y);

    y += 24;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(tx.counterparty, 40, y);

    y += 18;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
      `${occurredAt.toLocaleDateString("en-GB")} at ${occurredAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
      40,
      y
    );

    y += 40;
    const rows: [string, string][] = [
      ["Status", tx.status],
      ["Category", tx.category],
      ["Method", tx.method],
      ["Reference", tx.reference],
      ["Account Holder", profile?.company_name || "Aspidus DMCC"],
      ["Account Used", `CBI (••${accountMask})`],
    ];

    doc.setDrawColor(230, 230, 230);
    for (const [label, value] of rows) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(9);
      doc.text(label.toUpperCase(), 40, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(11);
      doc.text(value, 200, y);
      y += 26;
      doc.line(40, y - 18, W - 40, y - 18);
    }

    const H = doc.internal.pageSize.getHeight();
    doc.setFillColor(247, 247, 247);
    doc.rect(0, H - 70, W, 70, "F");
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("System-generated receipt from Commercial Bank International PJSC.", 40, H - 45);
    doc.text(`Generated ${new Date().toLocaleString("en-GB")}`, 40, H - 32);

    doc.save(`CBI-Receipt-${tx.reference}.pdf`);
    toast("Official PDF Receipt downloaded.", "success");
  };

  return (
    <SubPage title="Receipt">
      <div className="px-3 py-3">
        {/* Summary card — magenta ribbon like the real app's statement cards */}
        <div className="cbi-card overflow-hidden">
          <div className="h-[18px] w-full bg-[#82134C]" />
          <div className="px-3 pb-3 pt-2.5">
            <p className="text-[13px] font-bold text-[#595959]">{tx.counterparty}</p>
            <p className="mt-0.5 text-[11px] text-[#7F7F7F]">
              {occurredAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at{" "}
              {occurredAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p
              className={cn(
                "mt-1.5 text-[26px] font-bold leading-none",
                isIncome ? "text-[#217A3B]" : "text-[#222222]"
              )}
            >
              {sign}
              {formatAmount(tx.amount, tx.currency)}
              <span className="ml-1 text-[13px] font-normal text-[#7F7F7F]">{tx.currency}</span>
            </p>

            <div className="mt-2.5 border-t border-[#E5E5E5] pt-1.5">
              <div className="flex items-baseline justify-between py-[3px]">
                <span className="text-[12.5px] text-[#7F7F7F]">Status</span>
                <span
                  className={cn(
                    "text-[13px] font-bold",
                    tx.status === "Settled" ? "text-[#217A3B]" : "text-[#82134C]"
                  )}
                >
                  {tx.status}
                </span>
              </div>
              <CbiRow label="Category" value={tx.category} />
              <CbiRow label="Method" value={tx.method} />
              <CbiRow label="Reference" value={tx.reference} />
              <CbiRow label="Account Holder" value={profile?.company_name || "Aspidus DMCC"} />
              <CbiRow label="Account Used" value={`CBI (••${accountMask})`} />
            </div>
          </div>
        </div>

        {/* Rejected warning — flat card, magenta text */}
        {tx.status === "Rejected" && (
          <div className="mt-3 cbi-card px-3 py-3">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#82134C]">
              <Ban className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              Transaction Rejected
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#82134C]">
              This transaction was refused by the bank. All accounts linked to
              Aspidus DMCC are restricted pending compliance review (Case CBI-CMP-2026-0047).
            </p>
          </div>
        )}

        {/* Memo */}
        {tx.memo && (
          <div className="mt-3 cbi-card px-3 py-2.5">
            <p className="text-[12px] text-[#7F7F7F]">Memo</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#222222]">{tx.memo}</p>
          </div>
        )}

        <div className="mt-3">
          <CbiButton onClick={downloadPdf}>
            <span className="flex items-center justify-center gap-2">
              <ArrowDownToLine className="h-4 w-4" strokeWidth={1.8} />
              Download Official PDF
            </span>
          </CbiButton>
        </div>
      </div>
    </SubPage>
  );
}
