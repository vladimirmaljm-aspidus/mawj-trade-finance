"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X, CheckCheck } from "lucide-react";
import { useMbanking, BANK } from "@/lib/mbanking/store";
import { useNav } from "./nav";
import { cn } from "@/lib/utils";
import type { SubPageId } from "@/lib/mbanking/types";

/**
 * Notifications panel — live inbox computed from the actual data state
 * (compliance case, approval queue, cheques, trade instruments, deposits).
 * Read-state is persisted locally.
 */
export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const notifications = useMbanking((s) => s.notifications);
  const readIds = useMbanking((s) => s.readNotificationIds);
  const markAllRead = useMbanking((s) => s.markAllNotificationsRead);
  const markRead = useMbanking((s) => s.markNotificationRead);
  const nav = useNav();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = notifications.filter((n) => !dismissed.includes(n.id));
  const unread = visible.filter((n) => !readIds.includes(n.id)).length;

  const ACTION_TARGET: Record<string, SubPageId> = {
    compliance: "compliance",
    approvals: "approvals",
    scheduled: "scheduled",
    cheques: "cheques",
    "trade-finance": "trade-finance",
    deposits: "deposits",
    taxes: "taxes",
  };

  if (!open) return null;

  return (
    <div
      className="cbi-slide-in fixed inset-0 z-[110] flex flex-col bg-[#F7F7F7]"
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      {/* Header */}
      <header className="cbi-header-gradient relative flex h-[64px] shrink-0 items-stretch">
        <div className="relative flex w-[58%] items-center">
          <div className="cbi-pennant relative flex h-full items-center gap-3 bg-white pl-4">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center"
              aria-label="Back"
            >
              <X className="h-5 w-5 text-[#000F32]" />
            </button>
            <span className="text-[15px] font-bold text-[#000F32]">Notifications</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 pr-4">
          <span className="text-[13px] text-white">{unread} unread</span>
        </div>
      </header>

      {/* Mark-all-read bar */}
      <div className="flex h-[40px] shrink-0 items-center justify-between bg-[#000F32] px-3">
        <span className="text-[11.5px] text-white/80">
          {visible.length} alerts · live from your accounts
        </span>
        {unread > 0 && (
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-1 text-[12px] text-white active:opacity-70"
          >
            <CheckCheck className="h-4 w-4" strokeWidth={1.9} />
            Mark all read
          </button>
        )}
      </div>

      {/* Inbox */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-3 py-3 pb-32">
        {visible.length === 0 ? (
          <div className="cbi-card px-4 py-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-[#217A3B]" strokeWidth={1.6} />
            <p className="mt-2 text-[13px] font-bold text-[#595959]">You&apos;re all caught up</p>
            <p className="mt-1 text-[11.5px] text-[#7F7F7F]">
              Alerts from your accounts and corporate services appear here.
            </p>
          </div>
        ) : (
          visible.map((n) => {
            const isRead = readIds.includes(n.id);
            const Icon =
              n.tone === "warning" ? AlertTriangle : n.tone === "success" ? CheckCircle2 : Info;
            const actionPage = n.action ? ACTION_TARGET[n.action] : undefined;
            return (
              <div
                key={n.id}
                className={cn(
                  "cbi-card mb-2 px-3 py-3",
                  !isRead && "border-l-[3px] border-l-[#82134C]"
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={cn(
                      "mt-0.5 h-5 w-5 shrink-0",
                      n.tone === "warning"
                        ? "text-[#82134C]"
                        : n.tone === "success"
                          ? "text-[#217A3B]"
                          : "text-[#1565C0]"
                    )}
                    strokeWidth={1.8}
                  />
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      markRead(n.id);
                      if (actionPage) {
                        onClose();
                        nav.openSubPage(actionPage);
                      }
                    }}
                  >
                    <p className="flex items-center gap-2 text-[13px] font-bold text-[#333333]">
                      <span className="truncate">{n.title}</span>
                      {!isRead && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#82134C]" />
                      )}
                    </p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-[#7F7F7F]">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10.5px] text-[#8C8C8C]">
                      {new Date(n.ts).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {actionPage ? " · tap to view" : ""}
                    </p>
                  </button>
                  <button
                    onClick={() => {
                      markRead(n.id);
                      setDismissed((d) => [...d, n.id]);
                    }}
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-[#8C8C8C] active:opacity-60"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <p className="mt-2 text-center text-[10px] text-[#8C8C8C]">
          {BANK.shortName} · corporate alerts · server-synced
        </p>
      </div>
    </div>
  );
}
