"use client";

import { useMemo, useState } from "react";
import { Download, Landmark, ChevronRight } from "lucide-react";
import { SubPage } from "../SubPage";
import { CbiButton, CbiRow } from "../cbi";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import { formatPlain } from "@/lib/mbanking/format";

/** Period option for the statement generator. */
interface Period {
  label: string;
  from: string;
  to: string;
}

function monthOption(d: Date): Period {
  const from = new Date(d.getFullYear(), d.getMonth(), 1);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const iso = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return {
    label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    from: iso(from),
    to: iso(to),
  };
}

/** Account statements — period picker + real PDF generation. */
export function StatementsPage() {
  const accounts = useMbanking((s) => s.accounts);
  const transactions = useMbanking((s) => s.transactions);
  const downloadStatement = useMbanking((s) => s.downloadStatement);
  const complianceCase = useMbanking((s) => s.complianceCase);

  const [accountId, setAccountId] = useState<string | null>(null);
  const activeAccount = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const [period, setPeriod] = useState<Period | null>(null);

  const periods = useMemo<Period[]>(() => {
    const now = new Date();
    const list: Period[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push(monthOption(d));
    }
    return list;
  }, []);
  const activePeriod = period ?? periods[0];

  const rowsInPeriod = useMemo(() => {
    if (!activeAccount) return [];
    return transactions.filter((t) => {
      if (t.account_id !== activeAccount.id) return false;
      const at = new Date(t.occurred_at).getTime();
      const from = new Date(activePeriod.from).getTime();
      const to = new Date(`${activePeriod.to}T23:59:59Z`).getTime();
      return at >= from && at <= to;
    });
  }, [transactions, activeAccount, activePeriod]);

  const [busy, setBusy] = useState(false);

  const onDownload = async () => {
    if (!activeAccount) return;
    setBusy(true);
    try {
      await downloadStatement(activeAccount.id, activePeriod.from, activePeriod.to);
      toast(`Statement ${activePeriod.label} downloaded`, "success");
    } catch {
      toast("Statement could not be generated", "error");
    }
    setBusy(false);
  };

  return (
    <SubPage title="Statements" stepIndicator="e-Statements">
      <div className="flex flex-col gap-3 px-3 py-3">
        {complianceCase ? (
          <p className="px-1 text-[10.5px] leading-relaxed text-[#8C8C8C]">
            Statements continue to be generated and mailed while transfers are
            suspended under {complianceCase.case_reference}.
          </p>
        ) : null}

        {/* Account picker */}
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#595959]">Select Account</h2>
        </div>
        <div className="cbi-card">
          {accounts.map((a) => {
            const selected = activeAccount?.id === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setAccountId(a.id)}
                className="flex w-full items-center gap-3 border-b border-[#E5E5E5] px-3 py-3 text-left last:border-b-0 active:opacity-70"
              >
                <Landmark className="h-5 w-5 text-[#7A1F3D]" strokeWidth={1.7} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#333333]">{a.label}</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-[#7F7F7F]">
                    {a.iban.replace(/\s/g, "")}
                  </p>
                </div>
                <span
                  className={cn(
                    "h-4 w-4 shrink-0 border",
                    selected ? "border-[#82134C] bg-[#82134C]" : "border-[#D9D9D9]"
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Period picker */}
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#595959]">Statement Period</h2>
        </div>
        <div className="cbi-card">
          {periods.map((p) => {
            const selected = activePeriod.label === p.label;
            return (
              <button
                key={p.label}
                onClick={() => setPeriod(p)}
                className={cn(
                  "flex w-full items-center justify-between border-b border-[#E5E5E5] px-3 py-[13px] text-left last:border-b-0 active:opacity-70",
                  selected && "bg-[#82134C]/[0.04]"
                )}
              >
                <span className="text-[13px] font-bold text-[#595959]">{p.label}</span>
                {selected ? (
                  <span className="h-4 w-4 border border-[#82134C] bg-[#82134C]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Summary + download */}
        <div className="cbi-card px-3 py-3">
          <p className="border-b border-[#E0E0E0] pb-2 text-[15px] font-bold text-[#595959]">
            Statement Summary
          </p>
          <div className="pt-1">
            <CbiRow label="Account" value={activeAccount?.label ?? "—"} bold />
            <CbiRow label="Period" value={activePeriod.label} />
            <CbiRow label="Entries" value={String(rowsInPeriod.length)} />
            <CbiRow
              label="Closing balance"
              value={formatPlain(activeAccount?.balance ?? 0)}
              currency={activeAccount?.currency}
              bold
            />
          </div>
          <div className="mt-3">
            <CbiButton onClick={onDownload} disabled={busy || rowsInPeriod.length === 0}>
              <span className="flex items-center justify-center gap-1.5">
                <Download className="h-4 w-4" strokeWidth={1.9} />
                {busy ? "Generating PDF…" : "Download PDF Statement"}
              </span>
            </CbiButton>
          </div>
          {rowsInPeriod.length === 0 && (
            <p className="mt-2 text-[11px] leading-relaxed text-[#8C8C8C]">
              No entries in this period — pick another month.
            </p>
          )}
        </div>
      </div>
    </SubPage>
  );
}
