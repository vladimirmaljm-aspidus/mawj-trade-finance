"use client";

import { CheckCircle2, ArrowDownToLine, ArrowDownLeft, ArrowUpRight, Ban } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { useNav } from "../nav";
import { formatEUR } from "@/lib/mbanking/format";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  indigo: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  slate: "bg-slate-900 text-white border border-slate-800",
  amber: "bg-amber-50 text-amber-700 border border-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  blue: "bg-blue-50 text-blue-700 border border-blue-100",
  purple: "bg-purple-50 text-purple-700 border border-purple-100",
};

export function TxDetailsPage() {
  const { selectedTxId } = useNav();
  const transactions = useMbanking((s) => s.transactions);
  const accounts = useMbanking((s) => s.accounts);
  const profile = useMbanking((s) => s.profile);
  const tx = transactions.find((t) => t.id === selectedTxId);

  if (!tx) {
    return (
      <SubPage title="Receipt">
        <div className="p-10 text-center text-sm font-bold text-slate-400">
          Transaction not found.
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

    doc.setFillColor(11, 61, 46);
    doc.rect(0, 0, W, 110, "F");
    doc.setTextColor(201, 161, 74);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("COMMERCIAL BANK INTERNATIONAL", 40, 50);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.text("CORPORATE BANKING · OFFICIAL RECEIPT", 40, 70);
    doc.text("CBI-UAE-1976 · United Arab Emirates", 40, 84);
    // UAE flag accent strip
    doc.setFillColor(200, 16, 46);
    doc.rect(40, 92, W - 80, 3, "F");
    doc.setFillColor(0, 122, 61);
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
    doc.setTextColor(isIncome ? 5 : 30, isIncome ? 150 : 30, isIncome ? 105 : 30);
    doc.text(`${sign}${formatEUR(tx.amount)}`, 40, y);

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
    doc.setFillColor(248, 250, 252);
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
      <div className="flex flex-col items-center px-6 pb-10">
        <div
          className={cn(
            "mb-5 mt-8 flex h-20 w-20 items-center justify-center rounded-[1.2rem] text-2xl font-black shadow-sm",
            TONE_CLASS[tx.color_tone] || TONE_CLASS.slate
          )}
        >
          {tx.logo ? (
            tx.logo
          ) : isIncome ? (
            <ArrowDownLeft className="h-8 w-8" />
          ) : (
            <ArrowUpRight className="h-8 w-8" />
          )}
        </div>
        <h2 className="mb-1 text-center text-2xl font-black text-slate-900">
          {tx.counterparty}
        </h2>
        <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500">
          {occurredAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at{" "}
          {occurredAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <h1
          className={cn(
            "mb-10 text-[2.5rem] font-black tracking-tighter",
            isIncome ? "text-emerald-600" : "text-slate-900"
          )}
        >
          {sign}
          {formatEUR(tx.amount)}
        </h1>

        <div className="w-full rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
          <DetailRow label="Status">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-black",
                tx.status === "Settled"
                  ? "bg-emerald-50 text-emerald-600"
                  : tx.status === "Rejected"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-amber-50 text-amber-600"
              )}
            >
              {tx.status === "Rejected" ? (
                <Ban className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {tx.status}
            </span>
          </DetailRow>
          <DetailRow label="Category">
            <span className="text-sm font-black text-slate-900">{tx.category}</span>
          </DetailRow>
          <DetailRow label="Method">
            <span className="text-sm font-black text-slate-900">{tx.method}</span>
          </DetailRow>
          <DetailRow label="Reference">
            <span className="font-mono text-sm font-bold text-slate-900">{tx.reference}</span>
          </DetailRow>
          <DetailRow label="Account Holder">
            <span className="text-sm font-black text-slate-900">
              {profile?.company_name || "Aspidus DMCC"}
            </span>
          </DetailRow>
          <DetailRow label="Account Used" last>
            <span className="text-sm font-black text-slate-900">
              CBI (••{accountMask})
            </span>
          </DetailRow>
        </div>

        {/* Rejected warning box */}
        {tx.status === "Rejected" && (
          <div className="mt-4 w-full rounded-[1rem] border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-2.5">
              <Ban className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <p className="text-xs font-black text-rose-900">Transaction Rejected</p>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-rose-700">
                  This transaction was refused by the bank. All accounts linked to
                  Aspidus DMCC are restricted pending compliance review (Case CBI-CMP-2026-0047).
                </p>
              </div>
            </div>
          </div>
        )}

        {tx.memo && (
          <div className={cn(
            "mt-4 w-full rounded-[1rem] border p-4",
            tx.status === "Rejected"
              ? "border-rose-100 bg-rose-50/50"
              : "border-slate-200 bg-slate-50"
          )}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Memo
            </p>
            <p className="text-xs font-medium text-slate-600">{tx.memo}</p>
          </div>
        )}

        <button
          onClick={downloadPdf}
          className="active-scale mt-6 flex w-full items-center justify-center gap-2 rounded-[1rem] bg-slate-900 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Download Official PDF
        </button>
      </div>
    </SubPage>
  );
}

function DetailRow({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-5",
        !last && "border-b border-slate-50"
      )}
    >
      <span className="text-sm font-bold text-slate-500">{label}</span>
      {children}
    </div>
  );
}
