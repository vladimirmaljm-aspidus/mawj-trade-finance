"use client";

import { Download, FileText, ChevronRight } from "lucide-react";
import { SubPage } from "../SubPage";
import { toast } from "@/lib/mbanking/toast";

interface TaxRecord {
  title: string;
  period: string;
  status: "Filed" | "Pending" | "Overdue";
  amount: string;
}

const TAX_RECORDS: TaxRecord[] = [
  {
    title: "UAE Corporate Tax",
    period: "FY 2026",
    status: "Pending",
    amount: "€482,300",
  },
  {
    title: "VAT Return Q4",
    period: "2025",
    status: "Filed",
    amount: "€124,150",
  },
  {
    title: "Transfer Pricing",
    period: "FY 2025",
    status: "Filed",
    amount: "—",
  },
];

const STATEMENTS = [
  "March 2026 Statement",
  "February 2026 Statement",
  "January 2026 Statement",
  "Q4 2025 Summary",
];

export function TaxesPage() {
  return (
    <SubPage title="Tax Records">
      <div className="px-3 py-3">
        {/* Tax records — label left, amount/status right */}
        <div className="cbi-card">
          {TAX_RECORDS.map((r) => (
            <div
              key={r.title}
              className="flex items-center justify-between border-b border-[#E5E5E5] px-3 py-3 last:border-b-0"
            >
              <div>
                <p className="text-[13px] font-bold text-[#595959]">{r.title}</p>
                <p className="mt-0.5 text-[11px] text-[#7F7F7F]">{r.period}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-bold text-[#222222]">{r.amount}</p>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Statements — white rows with chevrons */}
        <div className="mt-3 cbi-card">
          <div className="flex items-center gap-1.5 border-b border-[#E5E5E5] px-3 py-2.5">
            <FileText className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
            <p className="text-[15px] font-bold text-[#595959]">Monthly Statements</p>
          </div>
          {STATEMENTS.map((s) => (
            <button
              key={s}
              onClick={() => toast(`Downloading ${s}…`, "info")}
              className="flex w-full items-center justify-between border-b border-[#E5E5E5] px-3 py-3 text-left last:border-b-0 active:opacity-70"
            >
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
                <span className="text-[13px] font-bold text-[#595959]">{s}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
            </button>
          ))}
        </div>
      </div>
    </SubPage>
  );
}

function StatusBadge({ status }: { status: TaxRecord["status"] }) {
  const color =
    status === "Filed" ? "text-[#217A3B]" : "text-[#82134C]";
  return (
    <span className={`mt-0.5 block text-[11px] font-bold uppercase ${color}`}>
      {status}
    </span>
  );
}
