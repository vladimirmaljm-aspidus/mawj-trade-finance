"use client";

import { useState } from "react";
import { Bell, X, CheckCircle2, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { BANK } from "@/lib/mbanking/store";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: "info" | "success" | "warning";
  read: boolean;
}

// In a real app these would come from /api/notifications. For the demo we use
// a realistic in-app set tied to the seeded trade-finance data.
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "LC Confirmation Received",
    body: "HSBC Middle East confirmed LC HSBC-2024-6620 (€14,700 fee settled).",
    time: "2h ago",
    tone: "success",
    read: false,
  },
  {
    id: "n2",
    title: "Incoming Settlement Pending",
    body: "Glencore International · €980,000 awaiting value date (REF-MWJ-884031).",
    time: "4h ago",
    tone: "info",
    read: false,
  },
  {
    id: "n3",
    title: "FX Rate Alert",
    body: "EUR/AED moved +0.12% — favourable window for AED conversions.",
    time: "Today",
    tone: "info",
    read: false,
  },
  {
    id: "n4",
    title: "Statement Ready",
    body: "March 2026 corporate statement is available for download.",
    time: "Yesterday",
    tone: "info",
    read: true,
  },
  {
    id: "n5",
    title: "Compliance Review",
    body: "UAE Corporate Tax FY2026 declaration is due in 14 days.",
    time: "2d ago",
    tone: "warning",
    read: true,
  },
];

const TONE_STYLES = {
  info: { icon: Info, iconBg: "bg-slate-100 text-slate-600" },
  success: { icon: CheckCircle2, iconBg: "bg-emerald-50 text-emerald-600" },
  warning: { icon: AlertTriangle, iconBg: "bg-amber-50 text-amber-600" },
} as const;

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(NOTIFICATIONS);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((items) => items.map((n) => ({ ...n, read: true })));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="active-scale relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-[1.2rem] w-[1.2rem]" />
        {unread > 0 && (
          <span className="absolute right-[0.6rem] top-[0.6rem] flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-black text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex justify-end bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="aspidus-slide-left flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 pt-12 pb-3">
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Notifications
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                  {unread} unread · {items.length} total
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="hide-scrollbar flex-1 overflow-y-auto p-3">
              {items.length === 0 ? (
                <p className="py-12 text-center text-sm font-bold text-slate-400">
                  No notifications
                </p>
              ) : (
                items.map((n) => {
                  const tone = TONE_STYLES[n.tone];
                  const Icon = tone.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() =>
                        setItems((items) =>
                          items.map((x) =>
                            x.id === n.id ? { ...x, read: true } : x
                          )
                        )
                      }
                      className={cn(
                        "mb-2 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                        n.read
                          ? "border-slate-100 bg-white"
                          : "border-slate-200 bg-slate-50/70"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          tone.iconBg
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-black text-slate-900">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                          )}
                        </div>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
                          {n.body}
                        </p>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {n.time}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                {BANK.legalName} · {BANK.license}
              </p>
            </div>
          </div>
          <style jsx>{`
            .aspidus-slide-left {
              animation: aspidus-slide-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes aspidus-slide-left {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

