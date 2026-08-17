"use client";

import { Download, FileText } from "lucide-react";
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
      <div className="flex flex-col gap-4 p-5 pt-6">
        {/* Tax records */}
        <div className="flex flex-col gap-3">
          {TAX_RECORDS.map((r) => (
            <div
              key={r.title}
              className="flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-sm font-black text-slate-900">{r.title}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {r.period} · {r.amount}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>

        {/* Statements */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-3">
            <FileText className="h-4 w-4 text-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Monthly Statements
            </p>
          </div>
          {STATEMENTS.map((s) => (
            <button
              key={s}
              onClick={() => toast(`Downloading ${s}…`, "info")}
              className="active-scale flex w-full items-center justify-between border-b border-slate-50 p-4 text-left transition-colors last:border-0 hover:bg-slate-50"
            >
              <span className="text-sm font-black text-slate-900">{s}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Download className="h-4 w-4 stroke-[2.5]" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </SubPage>
  );
}

function StatusBadge({ status }: { status: TaxRecord["status"] }) {
  if (status === "Filed")
    return (
      <span className="rounded-lg border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700">
        Filed
      </span>
    );
  if (status === "Overdue")
    return (
      <span className="rounded-lg border border-rose-200 bg-rose-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-700">
        Overdue
      </span>
    );
  return (
    <span className="rounded-lg border border-amber-200 bg-amber-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700">
      Pending
    </span>
  );
}
