"use client";

import { useState } from "react";
import {
  Landmark,
  ArrowRightLeft,
  CreditCard,
  ShieldAlert,
  BarChart3,
  UserCog,
  ChevronRight,
  Lock,
} from "lucide-react";
import { useMbanking } from "@/lib/mbanking/store";
import { useNav } from "../nav";
import {
  CbiAccordionCard,
  CbiAccountRow,
  CbiRow,
  CbiTile,
} from "../cbi";
import { TransactionItem } from "../ui/TransactionItem";
import { ComplianceBanner } from "../ComplianceBanner";

/** Indicative AED equivalent for one account using live fx rates. */
function aedEquivalent(amount: number, currency: string, rates: { base: string; quote: string; rate: number }[]): number {
  if (currency === "AED") return amount;
  const r = rates.find((x) => x.base === currency && x.quote === "AED")?.rate;
  if (r) return amount * r;
  if (currency === "EUR") return amount * 3.9545;
  if (currency === "USD") return amount * 3.6725;
  return amount;
}

function fmt(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AE", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount) + (currency === "AED" ? "" : "");
}

export function HomeTab() {
  const accounts = useMbanking((s) => s.accounts);
  const transactions = useMbanking((s) => s.transactions);
  const complianceCase = useMbanking((s) => s.complianceCase);
  const fxRates = useMbanking((s) => s.fxRates);
  const { openSubPage, setTab } = useNav();
  const [open, setOpen] = useState(true);

  const recent = transactions.slice(0, 5);

  // Funds blocked by compliance on the account matching the case currency.
  const blockedFor = (currency: string): number =>
    complianceCase && complianceCase.currency === currency
      ? complianceCase.amount_blocked
      : 0;

  // Total indicative AED equivalent across all accounts.
  const totalAed = accounts.reduce(
    (sum, a) => sum + aedEquivalent(a.balance, a.currency, fxRates),
    0
  );

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Compliance notice — CBI flat card with magenta ribbon */}
      {complianceCase && <ComplianceBanner caseRow={complianceCase} />}

      {/* Account Summary accordion — like the real CBI dashboard */}
      <div className="px-3 pt-3">
        <CbiAccordionCard
          title="Current Accounts"
          open={open}
          onToggle={() => setOpen((v) => !v)}
          summaryLabel="Indicative AED Equivalent"
          summaryValue={`AED ${fmt(totalAed, "AED")}`}
        >
          {accounts.map((acc) => {
            const blocked = blockedFor(acc.currency);
            const available = Math.max(0, acc.balance - blocked);
            return (
              <CbiAccountRow
                key={acc.id}
                accountNumber={acc.iban.replace(/\s/g, "")}
                onClick={() => openSubPage("accounts")}
              >
                <p className="pb-0.5 text-[11px] text-[#7F7F7F]">{acc.label}</p>
                <CbiRow
                  label="Available Bal."
                  value={fmt(available, acc.currency)}
                  currency={acc.currency}
                />
                {blocked > 0 && (
                  <CbiRow
                    label="Blocked Funds (Compliance)"
                    value={fmt(blocked, acc.currency)}
                    currency={acc.currency}
                    danger
                  />
                )}
                <CbiRow
                  label="Indicative AED Equivalent"
                  value={fmt(aedEquivalent(acc.balance, acc.currency, fxRates), "AED")}
                  currency="AED"
                />
              </CbiAccountRow>
            );
          })}
          {accounts.length === 0 && (
            <p className="py-3 text-center text-[12px] text-[#9E9E9E]">
              No accounts available
            </p>
          )}
        </CbiAccordionCard>
      </div>

      {/* Main menu — 2×3 grid of hexagon tiles like the real app */}
      <div className="px-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <CbiTile
            label="My Accounts"
            icon={<Landmark className="h-8 w-8" strokeWidth={1.6} />}
            onClick={() => openSubPage("accounts")}
          />
          <CbiTile
            label="Transfers"
            icon={<ArrowRightLeft className="h-8 w-8" strokeWidth={1.6} />}
            onClick={() =>
              complianceCase ? openSubPage("compliance") : setTab("payments")
            }
          />
          <CbiTile
            label="Cards"
            icon={<CreditCard className="h-8 w-8" strokeWidth={1.6} />}
            onClick={() => setTab("cards")}
          />
          <CbiTile
            label="Compliance"
            icon={
              complianceCase ? (
                <Lock className="h-8 w-8" strokeWidth={1.6} />
              ) : (
                <ShieldAlert className="h-8 w-8" strokeWidth={1.6} />
              )
            }
            onClick={() => openSubPage("compliance")}
          />
          <CbiTile
            label="FX Rates"
            icon={<BarChart3 className="h-8 w-8" strokeWidth={1.6} />}
            onClick={() => setTab("fx")}
          />
          <CbiTile
            label="Manage My Account"
            icon={<UserCog className="h-8 w-8" strokeWidth={1.6} />}
            onClick={() => setTab("profile")}
          />
        </div>
      </div>

      {/* Recent transactions — flat list card */}
      <div className="px-3">
        <div className="flex items-center justify-between px-1 pb-1.5">
          <h2 className="text-[15px] font-bold text-[#595959]">Recent Transactions</h2>
          <button
            onClick={() => openSubPage("all-transactions")}
            className="flex items-center gap-0.5 text-[12px] text-[#1565C0] active:opacity-60"
          >
            View All
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="cbi-card">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-[#9E9E9E]">
              No recent activity
            </p>
          ) : (
            recent.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
          )}
        </div>
      </div>
    </div>
  );
}
