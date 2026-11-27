"use client";

import { ShieldCheck, ShieldAlert, Fingerprint, KeyRound, Smartphone, Globe } from "lucide-react";
import { SubPage } from "../SubPage";
import { HexagonIcon } from "../cbi";
import { useMbanking } from "@/lib/mbanking/store";
import { cn } from "@/lib/utils";

export function SecurityPage() {
  const loginEvents = useMbanking((s) => s.loginEvents);

  return (
    <SubPage title="Login Activity">
      <div className="px-3 py-3">
        {/* Summary — flat white card */}
        <div className="cbi-card flex items-center gap-3 px-3 py-3">
          <HexagonIcon width={52}>
            <ShieldCheck className="h-5 w-5" strokeWidth={1.6} />
          </HexagonIcon>
          <div>
            <p className="text-[15px] font-bold text-[#595959]">No suspicious activity</p>
            <p className="mt-0.5 text-[11px] text-[#7F7F7F]">
              {loginEvents.length} recent sign-in attempts
            </p>
          </div>
        </div>

        {/* Events — flat list rows, hairline separators */}
        <div className="mt-3 cbi-card">
          {loginEvents.length === 0 ? (
            <p className="px-3 py-8 text-center text-[12px] text-[#9E9E9E]">
              No login events recorded yet.
            </p>
          ) : (
            loginEvents.map((ev) => {
              const d = new Date(ev.created_at);
              return (
                <div
                  key={ev.id}
                  className="flex items-center gap-2.5 border-b border-[#E5E5E5] px-3 py-2.5 last:border-b-0"
                >
                  <span className="shrink-0 text-[#7A1F3D]">
                    {ev.success ? (
                      ev.method === "biometric" ? (
                        <Fingerprint className="h-4 w-4" strokeWidth={1.8} />
                      ) : (
                        <KeyRound className="h-4 w-4" strokeWidth={1.8} />
                      )
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-[#82134C]" strokeWidth={1.8} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[13px] font-bold",
                        ev.success ? "text-[#595959]" : "text-[#82134C]"
                      )}
                    >
                      {ev.success ? "Successful sign-in" : "Failed attempt"}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#7F7F7F]">
                      <Smartphone className="h-3 w-3 shrink-0" strokeWidth={1.8} />
                      <span className="truncate">{ev.device || "Unknown device"}</span>
                    </p>
                    {ev.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#7F7F7F]">
                        <Globe className="h-3 w-3 shrink-0" strokeWidth={1.8} />
                        {ev.location}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-[#222222]">
                      {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#9E9E9E]">
                      {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="mt-3 px-2 text-center text-[10px] uppercase text-[#9E9E9E]">
          Activity is recorded for 90 days for audit compliance.
        </p>
      </div>
    </SubPage>
  );
}
