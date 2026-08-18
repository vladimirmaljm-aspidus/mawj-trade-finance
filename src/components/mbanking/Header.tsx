"use client";

import { Bell, Star, ShieldCheck } from "lucide-react";
import { toast } from "@/lib/mbanking/toast";
import { getGreeting } from "@/lib/mbanking/format";
import { BANK, useMbanking } from "@/lib/mbanking/store";
import { NotificationsPanel } from "./NotificationsPanel";

export function Header() {
  const greeting = getGreeting();
  const profile = useMbanking((s) => s.profile);

  const company = profile?.company_name ?? "Aspidus DMCC";
  const holder = profile?.full_name ?? "Vladimir Maljm";

  return (
    <header className="relative z-30 flex flex-col bg-gradient-to-b from-[#f8fafc] to-transparent">
      {/* UAE flag accent strip — very top */}
      <div className="uae-flag-accent absolute left-0 right-0 top-0 h-1" />
      {/* Bank brand bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-1">
        <div className="flex items-center gap-2.5">
          <img
            src="/icons/icon-192.png"
            alt={BANK.name}
            className="h-8 w-8 rounded-md shadow-sm ring-1 ring-slate-200"
          />
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-black tracking-tight text-slate-900">
              {BANK.shortName}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-800">
              {BANK.tagline}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-700">
          <ShieldCheck className="h-3 w-3" />
          <span className="hidden xs:inline">Secured</span>
        </div>
      </div>

      {/* Account header */}
      <div className="flex items-center justify-between px-6 pb-3 pt-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-emerald-800 bg-gradient-to-br from-emerald-900 to-slate-900 text-xl font-black text-white shadow-lg">
              {holder
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#f8fafc] bg-emerald-500" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {greeting}
              </h2>
              <span className="flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700">
                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                VIP
              </span>
            </div>
            <h1 className="mt-0.5 text-[19px] font-black leading-tight tracking-tight text-slate-900">
              {company}
            </h1>
          </div>
        </div>
        <NotificationsPanel />
      </div>
    </header>
  );
}
