"use client";

import { ShieldCheck, ShieldAlert, Fingerprint, KeyRound, Smartphone, Globe } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { cn } from "@/lib/utils";

export function SecurityPage() {
  const loginEvents = useMbanking((s) => s.loginEvents);

  return (
    <SubPage title="Login Activity">
      <div className="flex flex-col gap-4 p-5 pt-6">
        {/* Summary */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">No suspicious activity</p>
              <p className="text-xs font-semibold text-slate-500">
                {loginEvents.length} recent sign-in attempts
              </p>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          {loginEvents.length === 0 ? (
            <p className="p-8 text-center text-xs font-bold text-slate-400">
              No login events recorded yet.
            </p>
          ) : (
            loginEvents.map((ev, i) => {
              const methodIcon =
                ev.method === "biometric" ? (
                  <Fingerprint className="h-4 w-4" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                );
              const d = new Date(ev.created_at);
              return (
                <div
                  key={ev.id}
                  className={cn(
                    "flex items-center gap-3 p-4",
                    i !== loginEvents.length - 1 && "border-b border-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      ev.success
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    )}
                  >
                    {ev.success ? methodIcon : <ShieldAlert className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900">
                      {ev.success ? "Successful sign-in" : "Failed attempt"}
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <Smartphone className="h-3 w-3" />
                      <span className="truncate">{ev.device || "Unknown device"}</span>
                    </p>
                    {ev.location && (
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <Globe className="h-3 w-3" />
                        {ev.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-700">
                      {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="px-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Activity is recorded for 90 days for audit compliance.
        </p>
      </div>
    </SubPage>
  );
}
