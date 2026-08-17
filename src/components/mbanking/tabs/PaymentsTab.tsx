"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Check,
  Plus,
  ArrowRightLeft,
} from "lucide-react";
import { useMbanking } from "@/lib/mbanking/store";
import { useNav } from "../nav";
import { toast } from "@/lib/mbanking/toast";
import type { TransferMethod } from "@/lib/mbanking/types";
import { formatCompactEUR, formatEUR } from "@/lib/mbanking/format";
import { cn } from "@/lib/utils";

const METHODS: { id: TransferMethod; label: string }[] = [
  { id: "SEPA", label: "SEPA (EUR)" },
  { id: "SWIFT", label: "SWIFT" },
  { id: "LOCAL", label: "Local (AED)" },
];

export function PaymentsTab() {
  const balance = useMbanking((s) => s.balance);
  const sendTransfer = useMbanking((s) => s.sendTransfer);
  const beneficiaries = useMbanking((s) => s.beneficiaries);
  const { setTab } = useNav();

  const [method, setMethod] = useState<TransferMethod>("SEPA");
  const [recipient, setRecipient] = useState("");
  const [iban, setIban] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const reset = () => {
    setRecipient("");
    setIban("");
    setAmount("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="fade-in flex h-72 flex-col items-center justify-center rounded-[1.5rem] border border-emerald-200 bg-white px-6 text-center shadow-xl shadow-emerald-100/50">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-50 bg-emerald-100 text-emerald-600">
          <Check className="h-10 w-10 stroke-[3.5]" />
        </div>
        <h2 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
          Transfer Verified
        </h2>
        <p className="text-sm font-medium text-slate-500">{successMsg}</p>
        <button
          onClick={() => {
            setSuccess(false);
            setTab("home");
          }}
          className="active-scale mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-md hover:bg-indigo-700"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <h2 className="px-1 text-[1.3rem] font-black tracking-tight text-slate-900">
        Send Money
      </h2>

      {/* Method selector */}
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-200/50 p-1.5">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-bold transition-colors",
              method === m.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:bg-white/50"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Quick contacts */}
      <div>
        <p className="mb-3 px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Quick Send Contacts
        </p>
        <div className="hide-scrollbar flex gap-4 overflow-x-auto px-1 pb-2">
          {beneficiaries.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setRecipient(c.full_name);
                setIban(c.iban || "");
                setMethod(c.method);
              }}
              className="active-scale flex min-w-[4.5rem] flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "flex h-[3.5rem] w-[3.5rem] items-center justify-center rounded-[1.2rem] text-lg font-black shadow-sm",
                  c.tone === "indigo" &&
                    "border border-indigo-100 bg-indigo-50 text-indigo-600",
                  c.tone === "slate" &&
                    "border border-slate-800 bg-slate-900 text-white",
                  c.tone === "amber" &&
                    "border border-amber-100 bg-amber-50 text-amber-600",
                  c.tone === "emerald" &&
                    "border border-emerald-100 bg-emerald-50 text-emerald-600",
                  c.tone === "blue" &&
                    "border border-blue-100 bg-blue-50 text-blue-600",
                  c.tone === "purple" &&
                    "border border-purple-100 bg-purple-50 text-purple-600"
                )}
              >
                {c.initials}
              </div>
              <span className="text-[10px] font-bold text-slate-600">{c.name}</span>
            </button>
          ))}
          <button
            onClick={() => toast("Add new beneficiary", "info")}
            className="active-scale flex min-w-[4.5rem] flex-col items-center gap-2"
          >
            <div className="flex h-[3.5rem] w-[3.5rem] items-center justify-center rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-100 text-slate-500 shadow-sm">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-600">New</span>
          </button>
        </div>
      </div>

      {/* Transfer form */}
      <form
        onSubmit={onSubmit}
        className="relative flex flex-col gap-5 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="absolute right-6 top-5 text-right">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Available
          </p>
          <p className="mt-0.5 text-sm font-black text-emerald-600">
            {formatCompactEUR(balance)}
          </p>
        </div>

        <div className="mt-2">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Recipient Name
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            placeholder="Enter company name"
            className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
            IBAN / Account
          </label>
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
            required
            placeholder="AE89 0330 0044 0532 01"
            className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 p-3.5 font-mono text-sm font-bold uppercase text-slate-900 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Amount to Send
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-xl font-black text-slate-900">€</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-[1rem] border border-slate-200 bg-slate-50 py-4 pl-10 pr-4 text-2xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-indigo-100/50 bg-indigo-50/50 p-3">
          <span className="text-xs font-bold text-slate-500">Transfer Fee</span>
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-600">
            FREE (VIP)
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="active-scale mt-2 flex w-full items-center justify-center gap-2 rounded-[1rem] bg-indigo-600 py-4 text-sm font-black text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:opacity-70"
        >
          <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
          {submitting ? "Authorizing…" : "Authorize Transfer"}
        </button>
      </form>

      <div className="flex items-center justify-center gap-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <ArrowRightLeft className="h-3.5 w-3.5" />
        Funds settle instantly for SEPA
      </div>
    </div>
  );
}
