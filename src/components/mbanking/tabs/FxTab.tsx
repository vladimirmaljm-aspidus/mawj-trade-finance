"use client";

import { useMemo, useState } from "react";
import { TrendingUp, ArrowDownUp, ChevronDown, Check, X } from "lucide-react";
import { FX_META, type FxCode } from "@/lib/mbanking/data";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import { CbiButton, CbiSectionTitle } from "../cbi";

export function FxTab() {
  const fxRates = useMbanking((s) => s.fxRates);
  const [sell, setSell] = useState<FxCode>("EUR");
  const [buy, setBuy] = useState<FxCode>("AED");
  const [amount, setAmount] = useState("100,000");
  const [picker, setPicker] = useState<"sell" | "buy" | null>(null);

  // Build a lookup of EUR-base rates from the API. Fall back to 1 if missing.
  const rateMap = useMemo(() => {
    const m: Record<string, number> = { EUR: 1 };
    for (const r of fxRates) {
      if (r.base === "EUR") m[r.quote] = Number(r.rate);
    }
    return m;
  }, [fxRates]);

  const rate = useMemo(
    () => (rateMap[buy] ?? 1) / (rateMap[sell] ?? 1),
    [buy, sell, rateMap]
  );

  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const converted = numericAmount * rate;

  const swap = () => {
    setSell(buy);
    setBuy(sell);
  };

  const pick = (code: FxCode, side: "sell" | "buy") => {
    if (side === "sell") {
      if (code === buy) {
        // swap if same
        setBuy(sell);
      }
      setSell(code);
    } else {
      if (code === sell) {
        setSell(buy);
      }
      setBuy(code);
    }
    setPicker(null);
  };

  return (
    <div className="fade-in flex flex-col gap-3 p-3 pb-5">
      {/* Current pair */}
      <div className="flex items-center justify-between px-1">
        <CbiSectionTitle>
          {sell} / {buy}
        </CbiSectionTitle>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#217A3B]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#217A3B]" />
          Live Market
        </span>
      </div>
      <div className="cbi-card flex items-center justify-between px-3 py-3">
        <div>
          <p className="text-[12px] text-[#7F7F7F]">1 {sell} equals</p>
          <p className="mt-0.5 text-[18px] font-bold text-[#222222]">
            {rate.toFixed(rate < 1 ? 5 : 4)} {buy}
          </p>
        </div>
        <p className="flex items-center text-[12px] font-bold text-[#217A3B]">
          <TrendingUp className="mr-1 h-4 w-4" strokeWidth={1.8} />
          +0.12%
        </p>
      </div>

      {/* Converter */}
      <div className="mt-1 px-1">
        <CbiSectionTitle>Currency Converter</CbiSectionTitle>
      </div>
      <div className="cbi-card flex flex-col px-3 py-4">
        {/* Sell */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] text-[#7F7F7F]">You Sell</span>
            <button
              onClick={() => setAmount(String(numericAmount))}
              className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#1565C0] active:opacity-70"
            >
              Max
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setPicker("sell")}
              className="flex shrink-0 items-center gap-1.5 border border-[#D9D9D9] bg-white px-2.5 py-2 active:opacity-70"
              aria-label="Select sell currency"
            >
              <span className="text-[13px] font-bold text-[#333333]">
                {sell}
              </span>
              <ChevronDown
                className="h-4 w-4 text-[#7A1F3D]"
                strokeWidth={1.8}
              />
            </button>
            <div className="flex min-w-0 flex-1 items-baseline justify-end border-b border-[#E8306E] pb-1.5">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                placeholder="100,000"
                className="w-full bg-transparent text-right text-[20px] font-bold text-[#222222] outline-none placeholder:font-normal placeholder:text-[#BFBFBF]"
              />
            </div>
          </div>
        </div>

        {/* Swap */}
        <div className="my-2.5 flex items-center justify-center">
          <button
            onClick={swap}
            className="flex h-9 w-9 items-center justify-center border border-[#D9D9D9] bg-white text-[#7A1F3D] active:opacity-70"
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Buy */}
        <div>
          <p className="mb-1.5 text-[12px] text-[#7F7F7F]">You Buy</p>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setPicker("buy")}
              className="flex shrink-0 items-center gap-1.5 border border-[#D9D9D9] bg-white px-2.5 py-2 active:opacity-70"
              aria-label="Select buy currency"
            >
              <span className="text-[13px] font-bold text-[#333333]">
                {buy}
              </span>
              <ChevronDown
                className="h-4 w-4 text-[#7A1F3D]"
                strokeWidth={1.8}
              />
            </button>
            <div className="flex min-w-0 flex-1 items-baseline justify-end border-b border-[#D9D9D9] pb-1.5">
              <input
                type="text"
                readOnly
                value={converted.toLocaleString("en-IE", {
                  maximumFractionDigits: 2,
                })}
                placeholder="0.00"
                className="w-full cursor-not-allowed bg-transparent text-right text-[20px] font-bold text-[#7F7F7F] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <CbiButton
            onClick={() =>
              toast(
                `Trade executed: ${amount} ${sell} → ${converted.toLocaleString("en-IE", { maximumFractionDigits: 2 })} ${buy}`,
                "success"
              )
            }
          >
            Convert
          </CbiButton>
        </div>
      </div>

      {/* Rate table */}
      <div className="mt-1 px-1">
        <CbiSectionTitle>Live Cross Rates ({sell})</CbiSectionTitle>
      </div>
      <div className="cbi-card">
        {(Object.keys(rateMap) as FxCode[])
          .filter((c) => c !== sell && FX_META[c])
          .slice(0, 5)
          .map((code) => {
            const r = (rateMap[code] ?? 1) / (rateMap[sell] ?? 1);
            return (
              <div
                key={code}
                className="flex items-center justify-between border-b border-[#E5E5E5] px-3 py-2.5 last:border-b-0"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-bold text-[#333333]">
                    {code}
                  </span>
                  <span className="text-[11px] text-[#7F7F7F]">
                    {FX_META[code]?.name}
                  </span>
                </div>
                <span className="font-mono text-[13px] font-bold text-[#222222]">
                  {r.toFixed(r < 1 ? 5 : 4)}
                </span>
              </div>
            );
          })}
      </div>

      {picker && (
        <CurrencyPicker
          side={picker}
          current={picker === "sell" ? sell : buy}
          onPick={(c) => pick(c, picker)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

function CurrencyPicker({
  side,
  current,
  onPick,
  onClose,
}: {
  side: "sell" | "buy";
  current: FxCode;
  onPick: (c: FxCode) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#000F32]/60 px-4"
      onClick={onClose}
    >
      <div
        className="fade-in w-full max-w-md bg-white shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-[48px] items-center justify-between bg-[#82134C] px-3">
          <h3 className="text-[15px] font-bold text-white">
            {side === "sell" ? "Select Sell Currency" : "Select Buy Currency"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center text-white active:opacity-70"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto hide-scrollbar">
          {(Object.keys(FX_META) as FxCode[]).map((code) => (
            <button
              key={code}
              onClick={() => onPick(code)}
              className={cn(
                "flex w-full items-center justify-between border-b border-[#E5E5E5] px-3 py-3 text-left last:border-b-0 active:opacity-70",
                code === current && "bg-[#FBE9F0]"
              )}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-bold text-[#333333]">
                  {code}
                </span>
                <span className="text-[11px] text-[#7F7F7F]">
                  {FX_META[code].name}
                </span>
              </div>
              {code === current && (
                <Check className="h-4 w-4 text-[#82134C]" strokeWidth={2} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
