"use client";

import { useState } from "react";
import {
  Home,
  Landmark,
  ArrowRightLeft,
  CreditCard,
  BarChart3,
  ShieldAlert,
  FileText,
  Bell,
  Lock,
  Building2,
  LogOut,
  Ship,
  Banknote,
  Vault,
} from "lucide-react";
import { CbiLogo, CbiFooter } from "./cbi";
import { useNav } from "./nav";
import { useMbanking } from "@/lib/mbanking/store";
import { NotificationsPanel } from "./NotificationsPanel";
import { toast } from "@/lib/mbanking/toast";
import type { SubPageId, TabId } from "@/lib/mbanking/types";

interface DrawerItem {
  label: string;
  icon: typeof Home;
  go?: () => void;
}

export function CbiDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const nav = useNav();
  const profile = useMbanking((s) => s.profile);
  const logout = useMbanking((s) => s.logout);
  const [notifOpen, setNotifOpen] = useState(false);

  const goTab = (tab: TabId) => () => {
    nav.setTab(tab);
    onClose();
  };
  const goSubPage = (page: SubPageId) => () => {
    nav.openSubPage(page);
    onClose();
  };

  const items: DrawerItem[] = [
    { label: "Account Summary", icon: Home, go: goTab("home") },
    { label: "My Accounts", icon: Landmark, go: goSubPage("accounts") },
    { label: "Transfers", icon: ArrowRightLeft, go: goTab("payments") },
    { label: "Card Services", icon: CreditCard, go: goTab("cards") },
    { label: "Trade Finance", icon: Ship, go: goSubPage("trade-finance") },
    { label: "Financing", icon: Banknote, go: goSubPage("financing") },
    { label: "Deposits & Investments", icon: Vault, go: goSubPage("deposits") },
    { label: "FX Rates", icon: BarChart3, go: goTab("fx") },
    { label: "Compliance", icon: ShieldAlert, go: goSubPage("compliance") },
    { label: "Statements & Tax", icon: FileText, go: goSubPage("taxes") },
    { label: "Notifications", icon: Bell, go: () => { setNotifOpen(true); onClose(); } },
    { label: "Security", icon: Lock, go: goSubPage("security") },
    { label: "Company Details", icon: Building2, go: goSubPage("company-details") },
    {
      label: "Log Out",
      icon: LogOut,
      go: async () => {
        onClose();
        try {
          await logout();
          toast("Logged out", "info");
        } catch {
          toast("Could not log out", "error");
        }
      },
    },
  ];

  if (!open && !notifOpen) return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[90] flex bg-black/40"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
        >
          <div
            className="cbi-drawer-in flex h-full w-[80%] max-w-[320px] flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Drawer brand header */}
        <div className="cbi-header-gradient flex h-[64px] shrink-0 items-center">
          <div className="pl-4">
            <CbiLogo height={24} />
          </div>
        </div>
        {/* Profile strip */}
        <div className="border-b border-[#D9D9D9] bg-[#F7F7F7] px-4 py-3">
          <p className="text-[14px] font-bold text-[#595959]">
            {profile?.company_name ?? "Aspidus DMCC"}
          </p>
          <p className="mt-0.5 text-[11.5px] text-[#7F7F7F]">
            {profile?.full_name ?? "Vladimir Maljm"} · Authorized Signatory
          </p>
        </div>

        {/* Menu list */}
        <div className="hide-scrollbar flex-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.go}
                className="flex w-full items-center gap-3 border-b border-[#E5E5E5] px-4 py-[13px] text-left active:bg-[#F3E5DC]"
              >
                <Icon className="h-[18px] w-[18px] text-[#7A1F3D]" strokeWidth={1.8} />
                <span className="text-[13.5px] text-[#333333]">{item.label}</span>
              </button>
            );
          })}
        </div>

        <CbiFooter />
        </div>
      </div>
      )}

      {/* Notifications panel opened from the drawer */}
      {notifOpen && (
        <NotificationsPanel open onClose={() => setNotifOpen(false)} />
      )}
    </>
  );
}
