"use client";

import { useToastStore } from "@/lib/mbanking/toast";
import { Info, CheckCircle2, AlertCircle } from "lucide-react";

const TONE_STYLES = {
  info: { icon: Info, iconColor: "text-white" },
  success: { icon: CheckCircle2, iconColor: "text-white" },
  error: { icon: AlertCircle, iconColor: "text-white" },
} as const;

/** Flat CBI-style toast: navy bar, sharp corners, white text. */
export function AspidusToaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-12 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const tone = TONE_STYLES[t.tone ?? "info"];
        const Icon = tone.icon;
        return (
          <div
            key={t.id}
            className="aspidus-toast-enter pointer-events-auto flex max-w-[92%] items-center gap-2.5 border-l-[3px] border-l-white bg-[#000F32] px-4 py-3 text-[12.5px] font-medium text-white shadow-md"
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
