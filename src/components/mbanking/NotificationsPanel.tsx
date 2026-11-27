"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
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
    id: "n0",
    title: "Compliance Escalation",
    body: "Final deadline for CBI-CMP-2026-0047 passed on 02 Oct — €18,500,000 remains blocked pending Source of Funds documents.",
    time: "Today",
    tone: "warning",
    read: false,
  },
  {
    id: "n1",
    title: "LC Confirmation Received",
    body: "HSBC Middle East confirmed LC HSBC-2026-6620 presentation (matures 15 Dec 2026).",
    time: "2h ago",
    tone: "success",
    read: false,
  },
  {
    id: "n2",
    title: "Trade Settlement Rejected",
    body: "Glencore International · €980,000 returned to sender under compliance hold (REF-MWJ-884031).",
    time: "4h ago",
    tone: "warning",
    read: false,
  },
  {
    id: "n3",
    title: "FX Rate Alert",
    body: "EUR/AED moved +0.12% — favourable window for AED conversions.",
    time: "Yesterday",
    tone: "info",
    read: false,
  },
  {
    id: "n4",
    title: "Statement Ready",
    body: "October 2026 corporate statement is available for download.",
    time: "2d ago",
    tone: "info",
    read: true,
  },
  {
    id: "n5",
    title: "Corporate Tax Reminder",
    body: "UAE Corporate Tax FY2026 declaration is due in 14 days.",
    time: "1w ago",
    tone: "warning",
    read: true,
  },
];

const TONE_STYLES = {
  info: { icon: Info, iconColor: "text-[#1565C0]" },
  success: { icon: CheckCircle2, iconColor: "text-[#217A3B]" },
  warning: { icon: AlertTriangle, iconColor: "text-[#82134C]" },
} as const;

/** Right-slide notifications panel — CBI flat style. Controlled via props. */
export function NotificationsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState(NOTIFICATIONS);

  if (!open) return null;

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((items) => items.map((n) => ({ ...n, read: true })));

  return (
    <div
      className="fixed inset-0 z-[95] flex justify-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      <div
        className="cbi-slide-in flex h-full w-full max-w-md flex-col bg-[#F7F7F7] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar — navy with title + close */}
        <div className="flex h-[56px] shrink-0 items-center justify-between bg-[#000F32] px-3">
          <h1 className="text-[16px] font-bold text-white">Notifications</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="border border-white/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white active:opacity-70"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center text-white active:opacity-70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="bg-[#F7F7F7] px-3 pb-1 pt-2 text-[11px] text-[#7F7F7F]">
          {unread} unread · {items.length} total
        </p>

        {/* List — flat white cards, hairline borders */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-3">
          {items.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-[#8C8C8C]">
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
                      items.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                    )
                  }
                  className={cn(
                    "cbi-card mb-2 flex w-full items-start gap-3 px-3 py-3 text-left",
                    !n.read && "border-l-[3px] border-l-[#82134C]"
                  )}
                >
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone.iconColor)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold text-[#595959]">{n.title}</p>
                      {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#82134C]" />}
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#7F7F7F]">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-[#9E9E9E]">{n.time}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="cbi-footer-gradient flex h-[36px] shrink-0 items-center px-4">
          <p className="text-[10px] text-white">{BANK.legalName}</p>
        </div>
      </div>
    </div>
  );
}
