"use client";

import { useToastStore } from "@/lib/mbanking/toast";
import { Info, CheckCircle2, AlertCircle } from "lucide-react";

const TONE_STYLES = {
  info: { icon: Info, iconColor: "text-emerald-400" },
  success: { icon: CheckCircle2, iconColor: "text-emerald-400" },
  error: { icon: AlertCircle, iconColor: "text-rose-400" },
} as const;

export function AspidusToaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const tone = TONE_STYLES[t.tone ?? "info"];
        const Icon = tone.icon;
        return (
          <div
            key={t.id}
            className="aspidus-toast-enter pointer-events-auto flex max-w-[92%] items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-xs font-bold text-white shadow-2xl"
          >
            <Icon className={`h-4 w-4 ${tone.iconColor}`} />
            <span>{t.message}</span>
          </div>
        );
      })}
      <style jsx>{`
        .aspidus-toast-enter {
          animation: aspidus-toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes aspidus-toast-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
