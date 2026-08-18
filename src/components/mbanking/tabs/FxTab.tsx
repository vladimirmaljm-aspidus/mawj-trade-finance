"use client";

import { useMemo, useState } from "react";
import { TrendingUp, ArrowDownUp, ChevronDown } from "lucide-react";
import { FX_META, type FxCode } from "@/lib/mbanking/data";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";

const CHART_PATH =
  "M0,80 C20,60 30,90 50,40 C70,-10 80,60 100,20";

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
    <div className="fade-in flex flex-col gap-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[1.3rem] font-black tracking-tight text-slate-900">
          Treasury FX
        </h2>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live Market
        </span>
      </div>

      {/* Rate card */}
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-bold text-slate-500">
              {sell} / {buy}
            </p>
            <p className="text-2xl font-black text-slate-900">
              {rate.toFixed(rate < 1 ? 5 : 4)}
            </p>
          </div>
          <p className="flex items-center text-sm font-bold text-emerald-500">
            <TrendingUp className="mr-1 h-4 w-4" />+0.12%
          </p>
        </div>
        <div className="relative h-16 w-full">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              d={CHART_PATH}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
            <path
              d={`${CHART_PATH} L100,100 L0,100 Z`}
              fill="url(#aspidus-grad)"
              opacity="0.2"
            />
            <defs>
              <linearGradient id="aspidus-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Converter */}
      <div className="relative rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        {/* Sell */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors focus-within:border-emerald-300">
          <div className="mb-3 flex justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              You Sell
            </span>
            <button
              onClick={() => setAmount(String(numericAmount))}
              className="text-[10px] font-black uppercase text-emerald-700"
            >
              Max
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPicker("sell")}
              className="active-scale flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <span className="text-lg">{FX_META[sell].flag}</span>
              <span className="text-sm font-black text-slate-900">{sell}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
              placeholder="100,000"
              className="w-1/2 bg-transparent text-right text-2xl font-black text-slate-900 outline-none"
            />
          </div>
        </div>

        {/* Swap */}
        <button
          onClick={swap}
          className="active-scale absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-white shadow-lg transition-transform duration-500 hover:rotate-180"
          aria-label="Swap currencies"
        >
          <ArrowDownUp className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Buy */}
        <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="mb-3 flex justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              You Buy
            </span>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPicker("buy")}
              className="active-scale flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <span className="text-lg">{FX_META[buy].flag}</span>
              <span className="text-sm font-black text-slate-900">{buy}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            <input
              type="text"
              readOnly
              value={converted.toLocaleString("en-IE", {
                maximumFractionDigits: 2,
              })}
              placeholder="0.00"
              className="w-1/2 cursor-not-allowed bg-transparent text-right text-2xl font-black text-slate-400 outline-none"
            />
          </div>
        </div>

        <button
          onClick={() =>
            toast(
              `Trade executed: ${amount} ${sell} → ${converted.toLocaleString("en-IE", { maximumFractionDigits: 2 })} ${buy}`,
              "success"
            )
          }
          className="active-scale mt-6 w-full rounded-[1rem] bg-slate-900 py-4 text-sm font-black text-white shadow-md transition-all hover:bg-slate-800"
        >
          Execute Trade
        </button>
      </div>

      {/* Rate table */}
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm">
        {(Object.keys(rateMap) as FxCode[])
          .filter((c) => c !== sell && FX_META[c])
          .slice(0, 5)
          .map((code) => {
            const r = (rateMap[code] ?? 1) / (rateMap[sell] ?? 1);
            return (
              <div
                key={code}
                className="flex items-center justify-between border-b border-slate-50 p-4 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{FX_META[code]?.flag}</span>
                  <span className="text-sm font-black text-slate-900">{code}</span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-600">
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
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="aspidus-sheet w-full max-w-md rounded-t-[2rem] bg-white p-5 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <h3 className="mb-4 px-1 text-base font-black text-slate-900">
          {side === "sell" ? "You Sell" : "You Buy"}
        </h3>
        <div className="flex flex-col gap-1">
          {(Object.keys(FX_META) as FxCode[]).map((code) => (
            <button
              key={code}
              onClick={() => onPick(code)}
              className={cn(
                "flex items-center justify-between rounded-xl p-4 text-left transition-colors",
                code === current
                  ? "bg-emerald-50"
                  : "hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{FX_META[code].flag}</span>
                <div>
                  <p className="text-sm font-black text-slate-900">{code}</p>
                  <p className="text-xs font-semibold text-slate-500">
                    {FX_META[code].name}
                  </p>
                </div>
              </div>
              {code === current && (
                <span className="text-xs font-black text-emerald-700">SELECTED</span>
              )}
            </button>
          ))}
        </div>
        <style jsx>{`
          .aspidus-sheet {
            animation: aspidus-sheet-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes aspidus-sheet-up {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
