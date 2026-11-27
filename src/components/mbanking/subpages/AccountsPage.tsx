"use client";

import { useState } from "react";
import { Plus, Lock } from "lucide-react";
import { SubPage } from "../SubPage";
import { CbiAccordionCard, CbiAccountRow, CbiRow } from "../cbi";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { useNav } from "../nav";

/** Indicative AED equivalent for one account using live fx rates. */
function aedEquivalent(
  amount: number,
  currency: string,
  rates: { base: string; quote: string; rate: number }[]
): number {
  if (currency === "AED") return amount;
  const r = rates.find((x) => x.base === currency && x.quote === "AED")?.rate;
  if (r) return amount * r;
  if (currency === "EUR") return amount * 3.9545;
  if (currency === "USD") return amount * 3.6725;
  return amount;
}

function fmt(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function AccountsPage() {
  const accounts = useMbanking((s) => s.accounts);
  const fxRates = useMbanking((s) => s.fxRates);
  const complianceCase = useMbanking((s) => s.complianceCase);
  const { openSubPage } = useNav();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  return (
    <SubPage
      title="Portfolios"
      headerRight={
        <button
          onClick={() => toast("Open a new portfolio", "info")}
          className="flex h-8 w-8 items-center justify-center border border-[#D9D9D9] bg-white active:opacity-70"
          aria-label="Add account"
        >
          <Plus className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
        </button>
      }
    >
      <div className="px-3 py-3">
        {/* One accordion per account — same pattern as the Home dashboard */}
        {accounts.map((a, i) => {
          const isOpen = openIds[a.id] ?? i === 0;
          return (
            <div key={a.id} className="mb-3">
              <CbiAccordionCard
                title={a.label}
                open={isOpen}
                onToggle={() => setOpenIds((m) => ({ ...m, [a.id]: !isOpen }))}
                summaryLabel="Available Bal."
                summaryValue={`${a.currency} ${fmt(a.balance)}`}
              >
                <CbiAccountRow
                  accountNumber={a.iban.replace(/\s/g, "")}
                  onClick={() => {
                    toast(`Showing transactions for ${a.label}`, "info");
                    openSubPage("all-transactions");
                  }}
                >
                  <p className="pb-0.5 text-[11px] text-[#7F7F7F]">
                    {a.currency}
                    {a.is_primary && " · Primary"}
                  </p>
                  <CbiRow label="Available Bal." value={fmt(a.balance)} currency={a.currency} />
                  <CbiRow
                    label="Indicative AED Equivalent"
                    value={fmt(aedEquivalent(a.balance, a.currency, fxRates))}
                    currency="AED"
                  />
                  {complianceCase && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#82134C]">
                      <Lock className="h-3 w-3" strokeWidth={1.8} />
                      Blocked — compliance review
                    </p>
                  )}
                </CbiAccountRow>
              </CbiAccordionCard>
            </div>
          );
        })}

        {accounts.length === 0 && (
          <div className="cbi-card px-3 py-6 text-center">
            <p className="text-[12px] text-[#9E9E9E]">No accounts available</p>
          </div>
        )}

        <button
          onClick={() => toast("Link an external account", "info")}
          className="cbi-card flex w-full items-center justify-center gap-1.5 py-3 active:opacity-70"
        >
          <Plus className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
          <span className="text-[12px] font-bold text-[#595959]">Link External Account</span>
        </button>
      </div>
    </SubPage>
  );
}
