"use client";

import { LayoutGrid, CreditCard, ArrowRightLeft, BarChart3, User } from "lucide-react";
import { useNav } from "./nav";
import type { TabId } from "@/lib/mbanking/types";
import { cn } from "@/lib/utils";

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "home", label: "Home", icon: LayoutGrid },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "payments", label: "Move", icon: ArrowRightLeft },
  { id: "fx", label: "FX", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: User },
];

export function TopNav() {
  const { tab, setTab } = useNav();

  return (
    <div className="glass-effect sticky top-0 z-20 border-b border-slate-200/50 px-5 py-2">
      <nav className="flex items-center justify-between gap-1 rounded-2xl bg-slate-200/50 p-1.5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "active-scale flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2.5 text-[10px] font-bold transition-all",
                active
                  ? "border border-slate-100 bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn("h-[18px] w-[18px]", active ? "stroke-[2.5]" : "stroke-[2]")}
              />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
