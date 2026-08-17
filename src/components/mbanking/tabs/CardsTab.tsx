"use client";

import { useState } from "react";
import {
  Plus,
  Wifi,
  CreditCard,
  Lock,
  Snowflake,
  SlidersHorizontal,
  Eye,
  ChevronRight,
} from "lucide-react";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import { formatEUR } from "@/lib/mbanking/format";

export function CardsTab() {
  const { cards, toggleCardFreeze } = useMbanking();
  const physical = cards.find((c) => c.kind === "physical")!;
  const virtual = cards.find((c) => c.kind === "virtual")!;

  return (
    <div className="fade-in flex flex-col gap-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[1.3rem] font-black tracking-tight text-slate-900">
          Corporate Cards
        </h2>
        <button
          onClick={() => toast("Card issuance request sent", "info")}
          className="active-scale flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
          aria-label="Add card"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Physical metal card */}
      <div
        className={cn(
          "premium-navy-card relative flex h-56 flex-col justify-between overflow-hidden rounded-[1.5rem] border border-slate-800 p-6 text-white shadow-2xl transition-all",
          physical.frozen && "opacity-60 saturate-0"
        )}
      >
        {physical.frozen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-sky-300">
              <Snowflake className="h-4 w-4" />
              Frozen
            </div>
          </div>
        )}
        <div className="absolute right-6 top-6 z-10">
          <Wifi className="h-6 w-6 rotate-90 text-slate-400 opacity-70" />
        </div>
        <div className="relative z-10 h-9 w-12 overflow-hidden rounded-md bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8017] shadow-inner">
          <div className="absolute left-[30%] top-0 h-full w-[1px] bg-slate-900/40" />
          <div className="absolute left-[70%] top-0 h-full w-[1px] bg-slate-900/40" />
          <div className="absolute top-[40%] h-[1px] w-full bg-slate-900/40" />
          <div className="absolute top-[60%] h-[1px] w-full bg-slate-900/40" />
        </div>

        <div className="relative z-10 mt-6">
          <p className="font-mono text-[1.4rem] font-bold tracking-[0.2em] text-white drop-shadow-md">
            {physical.number}
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {physical.label}
            </p>
            <p className="text-sm font-black tracking-widest text-slate-100">
              {physical.holder}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Exp
              </p>
              <p className="font-mono text-sm font-bold">{physical.exp}</p>
            </div>
            <div className="flex -space-x-3.5">
              <div className="h-8 w-8 rounded-full bg-rose-500 opacity-90 mix-blend-screen" />
              <div className="h-8 w-8 rounded-full bg-amber-500 opacity-90 mix-blend-screen" />
            </div>
          </div>
        </div>
      </div>

      {/* Virtual card (compact) */}
      <div
        className={cn(
          "platinum-card flex h-24 cursor-pointer items-center justify-between rounded-[1.5rem] border border-white p-5 text-slate-800 shadow-md transition-all",
          virtual.frozen && "opacity-60 saturate-0"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-8 items-center justify-center rounded border border-slate-300 bg-slate-200/50">
            <CreditCard className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-black">{virtual.label}</p>
            <p className="mt-1 font-mono text-xs font-bold text-slate-500">
              **** {virtual.number.slice(-4)} • Exp {virtual.exp}
            </p>
          </div>
        </div>
        <button
          onClick={() => toast(`Virtual card ••${virtual.number.slice(-4)} details`, "info")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
        >
          Details
        </button>
      </div>

      {/* Controls */}
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        {/* Freeze physical */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Lock className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Freeze Physical Card</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                Block all POS and ATM usage
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={physical.frozen}
            onChange={() => {
              toggleCardFreeze(physical.id);
              toast(
                physical.frozen ? "Card unfrozen — active." : "Card frozen securely.",
                physical.frozen ? "success" : "info"
              );
            }}
          />
        </div>

        {/* Freeze virtual */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Snowflake className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Freeze Virtual Card</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                Pause online spending instantly
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={virtual.frozen}
            onChange={() => {
              toggleCardFreeze(virtual.id);
              toast(
                virtual.frozen ? "Virtual card unfrozen." : "Virtual card frozen.",
                virtual.frozen ? "success" : "info"
              );
            }}
          />
        </div>

        {/* Spending limits */}
        <button
          onClick={() =>
            toast(
              `Daily ${formatEUR(physical.dailyLimit)} / Monthly ${formatEUR(physical.monthlyLimit)}`,
              "info"
            )
          }
          className="active-scale flex w-full items-center justify-between border-b border-slate-100 p-5 text-left transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <SlidersHorizontal className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Spending Limits</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                {formatEUR(physical.dailyLimit)} daily /{" "}
                {formatEUR(physical.monthlyLimit)} monthly
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </button>

        {/* Reveal PIN */}
        <button
          onClick={() => toast("FaceID verification required", "info")}
          className="active-scale flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Eye className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Reveal PIN & Details</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                Secure biometric check
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "active-scale relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        checked ? "bg-indigo-600" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full border bg-white shadow transition-transform",
          checked ? "translate-x-6 border-white" : "translate-x-1 border-slate-300"
        )}
      />
    </button>
  );
}
