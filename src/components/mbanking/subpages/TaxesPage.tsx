"use client";

import { useState } from "react";
import { Download, FileText, ChevronRight } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { useNav } from "../nav";

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

/** Monthly statement descriptor: month index (0 = current) back to March 2026. */
interface StatementOption {
  label: string;
  from: string;
  to: string;
}

function monthOpt(y: number, m: number): StatementOption {
  const from = new Date(y, m, 1);
  const to = new Date(y, m + 1, 0);
  const iso = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return {
    label: `${from.toLocaleDateString("en-GB", { month: "long" })} ${from.getFullYear()} Statement`,
    from: iso(from),
    to: iso(to),
  };
}

function buildStatementOptions(): StatementOption[] {
  const now = new Date();
  const list: StatementOption[] = [];
  // Walk months back, stopping at the compliance block (March 2026).
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    if (d.getFullYear() === 2026 && d.getMonth() < 2) break;
    list.push(monthOpt(d.getFullYear(), d.getMonth()));
  }
  // Quarterly summary for Q4 2025.
  list.push({ label: "Q4 2025 Summary", from: "2025-10-01", to: "2025-12-31" });
  return list;
}

export function TaxesPage() {
  const accounts = useMbanking((s) => s.accounts);
  const downloadStatement = useMbanking((s) => s.downloadStatement);
  const { openSubPage } = useNav();
  const [busy, setBusy] = useState<string | null>(null);

  const statements = buildStatementOptions();
  const primary = accounts.find((a) => a.is_primary) ?? accounts[0];

  const onDownload = async (s: StatementOption) => {
    if (!primary) return;
    setBusy(s.label);
    try {
      await downloadStatement(primary.id, s.from, s.to);
      toast(`${s.label} downloaded (PDF)`, "success");
    } catch {
      toast("Statement could not be generated", "error");
    }
    setBusy(null);
  };

  return (
    <SubPage title="Tax Records" stepIndicator="Statements & Tax">
      <div className="flex flex-col gap-3 px-3 py-3">
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

        {/* Monthly statements — real PDF generation */}
        <div className="cbi-card">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] px-3 py-2.5">
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
              <p className="text-[15px] font-bold text-[#595959]">Monthly Statements</p>
            </span>
            <span className="text-[10.5px] uppercase text-[#7F7F7F]">
              {primary ? `${primary.currency} · ${primary.label}` : ""}
            </span>
          </div>
          {statements.map((s) => (
            <button
              key={s.label}
              onClick={() => onDownload(s)}
              disabled={busy === s.label}
              className="flex w-full items-center justify-between border-b border-[#E5E5E5] px-3 py-3 text-left last:border-b-0 active:opacity-70 disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
                <span className="text-[13px] font-bold text-[#595959]">{s.label}</span>
              </span>
              <span className="flex items-center gap-1.5">
                {busy === s.label && (
                  <span className="text-[10.5px] uppercase text-[#1565C0]">Generating…</span>
                )}
                <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
              </span>
            </button>
          ))}
        </div>

        {/* Multi-account statement generator */}
        <button
          onClick={() => openSubPage("statements")}
          className="cbi-card flex w-full items-center justify-between px-3 py-3 text-left active:opacity-70"
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
            <span className="text-[13px] font-bold text-[#595959]">
              Generate for any account / period
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
        </button>
      </div>
    </SubPage>
  );
}

function StatusBadge({ status }: { status: TaxRecord["status"] }) {
  const color = status === "Filed" ? "text-[#217A3B]" : "text-[#82134C]";
  return (
    <span className={`mt-0.5 block text-[11px] font-bold uppercase ${color}`}>
      {status}
    </span>
  );
}
