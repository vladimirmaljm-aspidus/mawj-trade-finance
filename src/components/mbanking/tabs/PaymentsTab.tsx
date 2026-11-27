"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowRightLeft,
  Landmark,
  CreditCard,
  MapPin,
  Globe,
  HeartHandshake,
  Lock,
  Check,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useMbanking } from "@/lib/mbanking/store";
import { useNav } from "../nav";
import { toast } from "@/lib/mbanking/toast";
import { CbiBackBar, CbiButton, CbiRow, HexagonIcon } from "../cbi";
import type { TransferMethod } from "@/lib/mbanking/types";
import { formatCompactEUR, formatEUR } from "@/lib/mbanking/format";

const METHOD_LABEL: Record<TransferMethod, string> = {
  SEPA: "SEPA (EUR)",
  SWIFT: "SWIFT International",
  LOCAL: "Local (AED)",
};

/**
 * Transfer menu — mirrors the real CBI app's cream transfer-services list.
 * Each entry maps to one of the demo's underlying transfer methods.
 */
const TRANSFER_MENU: { label: string; method: TransferMethod; icon: ReactNode }[] = [
  {
    label: "Transfer Within Own Account",
    method: "LOCAL",
    icon: <ArrowRightLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />,
  },
  {
    label: "Transfer Within CBI",
    method: "SEPA",
    icon: <Landmark className="h-[18px] w-[18px]" strokeWidth={1.8} />,
  },
  {
    label: "Pay CBI Credit Card",
    method: "LOCAL",
    icon: <CreditCard className="h-[18px] w-[18px]" strokeWidth={1.8} />,
  },
  {
    label: "Transfer Within UAE",
    method: "LOCAL",
    icon: <MapPin className="h-[18px] w-[18px]" strokeWidth={1.8} />,
  },
  {
    label: "International Transfer",
    method: "SWIFT",
    icon: <Globe className="h-[18px] w-[18px]" strokeWidth={1.8} />,
  },
  {
    label: "Donation Services",
    method: "LOCAL",
    icon: <HeartHandshake className="h-[18px] w-[18px]" strokeWidth={1.8} />,
  },
];

export function PaymentsTab() {
  const balance = useMbanking((s) => s.balance);
  const sendTransfer = useMbanking((s) => s.sendTransfer);
  const beneficiaries = useMbanking((s) => s.beneficiaries);
  const complianceCase = useMbanking((s) => s.complianceCase);
  const { setTab, openSubPage } = useNav();

  const [method, setMethod] = useState<TransferMethod>("SEPA");
  const [recipient, setRecipient] = useState("");
  const [iban, setIban] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [view, setView] = useState<"menu" | "form">("menu");
  const [step, setStep] = useState(1);

  // If a compliance case is active, outgoing transfers are blocked.
  if (complianceCase) {
    return (
      <div className="fade-in cbi-cream flex flex-col gap-3 p-3">
        <div className="cbi-card overflow-hidden">
          <div className="h-[18px] w-full bg-[#82134C]" />
          <div className="flex flex-col items-center px-4 py-6 text-center">
            <HexagonIcon width={64}>
              <Lock className="h-7 w-7" strokeWidth={1.6} />
            </HexagonIcon>
            <h3 className="mt-3 text-[15px] font-bold text-[#595959]">
              Transfers Suspended
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-[#7F7F7F]">
              Outgoing transfers are suspended pending compliance review
              ({complianceCase.case_reference}). All accounts are restricted
              until the required documentation is submitted and verified.
            </p>
            <div className="mt-4 flex w-full items-baseline justify-between border-b border-[#E0E0E0] pb-1.5">
              <span className="text-[12px] text-[#7F7F7F]">Amount Held</span>
              <span className="text-[13px] font-bold text-[#82134C]">
                {formatEUR(complianceCase.amount_blocked)}
              </span>
            </div>
            <div className="mt-6 w-full">
              <CbiButton onClick={() => openSubPage("compliance")}>
                View Compliance Case
              </CbiButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const reset = () => {
    setRecipient("");
    setIban("");
    setAmount("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      // Step 1 is the details form; native validation gates advancing.
      setStep(2);
      return;
    }
    const amt = parseFloat(amount);
    setSubmitting(true);
    const result = await sendTransfer({
      recipient,
      iban,
      amount: amt,
      method,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast(result.reason, "error");
      setStep(1);
      return;
    }
    setSuccessMsg(
      `${formatEUR(amt)} routed to ${recipient.trim()} via ${method}. Ref ${result.tx.reference}.`
    );
    setSuccess(true);
    reset();
  };

  if (success) {
    return (
      <div className="fade-in cbi-cream flex min-h-full flex-col items-center justify-center p-6">
        <div className="cbi-card w-full max-w-sm px-5 py-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#217A3B]/50 text-[#217A3B]">
            <Check className="h-8 w-8" strokeWidth={2} />
          </div>
          <h2 className="mt-4 text-[16px] font-bold text-[#000F32]">
            Transfer Verified
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-[#7F7F7F]">
            {successMsg}
          </p>
          <div className="mt-6">
            <CbiButton
              onClick={() => {
                setSuccess(false);
                setView("menu");
                setStep(1);
                setTab("home");
              }}
            >
              Done
            </CbiButton>
          </div>
        </div>
      </div>
    );
  }

  // Transfer services menu (real CBI app layout).
  if (view === "menu") {
    return (
      <div className="fade-in cbi-cream flex min-h-full flex-col gap-2 p-3">
        {TRANSFER_MENU.map((m) => (
          <button
            key={m.label}
            onClick={() => {
              setMethod(m.method);
              setStep(1);
              setView("form");
            }}
            className="cbi-card flex h-[58px] items-center gap-3 px-3 text-left active:opacity-70"
          >
            <HexagonIcon width={48}>{m.icon}</HexagonIcon>
            <span className="flex-1 text-[13px] font-bold text-[#333333]">
              {m.label}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#8C8C8C]" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in cbi-cream flex min-h-full flex-col">
      <CbiBackBar
        onBack={() => (step === 2 ? setStep(1) : setView("menu"))}
        right={`Step ${step} of 2`}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-3 p-3">
        <div className="cbi-card px-3 py-3">
          <div className="flex items-baseline justify-between border-b border-[#E0E0E0] pb-2">
            <span className="text-[15px] font-bold text-[#595959]">
              Transfer Details
            </span>
            <span className="text-[11px] text-[#7F7F7F]">
              {METHOD_LABEL[method]}
            </span>
          </div>

          <div className="pt-1">
            <CbiRow label="Available Balance" value={formatCompactEUR(balance)} />
          </div>

          {step === 1 ? (
            <>
              {/* Saved beneficiaries */}
              <div className="mt-2">
                <p className="mb-2 text-[12px] text-[#7F7F7F]">
                  Saved Beneficiaries
                </p>
                <div className="hide-scrollbar flex gap-2.5 overflow-x-auto pb-1">
                  {beneficiaries.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setRecipient(c.full_name);
                        setIban(c.iban || "");
                        setMethod(c.method);
                      }}
                      className="active-scale flex w-[88px] shrink-0 flex-col items-center gap-1.5"
                    >
                      <span className="flex h-[44px] w-[44px] items-center justify-center border border-[#D9D9D9] bg-white text-[13px] font-bold text-[#7A1F3D]">
                        {c.initials}
                      </span>
                      <span className="w-full truncate text-center text-[10.5px] text-[#595959]">
                        {c.name}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => toast("Add new beneficiary", "info")}
                    className="active-scale flex w-[88px] shrink-0 flex-col items-center gap-1.5"
                  >
                    <span className="flex h-[44px] w-[44px] items-center justify-center border border-dashed border-[#D9D9D9] bg-white text-[#7A1F3D]">
                      <Plus className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="text-[10.5px] text-[#595959]">New</span>
                  </button>
                </div>
              </div>

              {/* Fields */}
              <div className="mt-3 flex flex-col gap-4 py-1">
                <div>
                  <label
                    htmlFor="recipient"
                    className="mb-1.5 block text-[12px] text-[#7F7F7F]"
                  >
                    Beneficiary Name
                  </label>
                  <input
                    id="recipient"
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                    placeholder="Enter company name"
                    className="w-full border-b border-[#E8306E] bg-white pb-2 pt-1 text-[13px] font-bold text-[#222222] outline-none placeholder:font-normal placeholder:text-[#BFBFBF] focus:border-[#82134C]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="iban"
                    className="mb-1.5 block text-[12px] text-[#7F7F7F]"
                  >
                    IBAN / Account
                  </label>
                  <input
                    id="iban"
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    required
                    placeholder="AE89 0330 0044 0532 01"
                    className="w-full border-b border-[#E8306E] bg-white pb-2 pt-1 font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-[#222222] outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-[#BFBFBF] focus:border-[#82134C]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="mb-1.5 block text-[12px] text-[#7F7F7F]"
                  >
                    Amount to Send
                  </label>
                  <div className="flex items-baseline justify-between gap-3 border-b border-[#E8306E] pb-2">
                    <span className="text-[13px] font-bold text-[#7F7F7F]">
                      EUR
                    </span>
                    <input
                      id="amount"
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      className="min-w-0 flex-1 bg-transparent text-right text-[20px] font-bold text-[#222222] outline-none placeholder:font-normal placeholder:text-[#BFBFBF]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#7F7F7F]">Transfer Fee</span>
                  <span className="text-[12px] font-bold text-[#217A3B]">
                    FREE (VIP)
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Step 2 — review & confirm */
            <div className="flex flex-col py-1">
              <CbiRow label="Transfer Type" value={METHOD_LABEL[method]} bold />
              <CbiRow label="Beneficiary Name" value={recipient || "—"} bold />
              <CbiRow label="IBAN / Account" value={iban || "—"} />
              <CbiRow
                label="Amount to Send"
                value={formatEUR(parseFloat(amount) || 0)}
                bold
              />
              <CbiRow label="Transfer Fee" value="FREE (VIP)" />
              <p className="mt-2 text-[11px] leading-relaxed text-[#8C8C8C]">
                Please verify the beneficiary details before confirming the
                transfer.
              </p>
            </div>
          )}
        </div>

        <CbiButton type="submit" disabled={submitting}>
          {step === 1 ? "Next" : submitting ? "Processing" : "Confirm Transfer"}
        </CbiButton>

        <div className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-[#7F7F7F]">
          <ArrowRightLeft
            className="h-3.5 w-3.5 text-[#7A1F3D]"
            strokeWidth={1.8}
          />
          Funds settle instantly for SEPA
        </div>
      </form>
    </div>
  );
}
