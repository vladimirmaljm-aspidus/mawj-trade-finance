"use client";

import { useEffect } from "react";
import { NavProvider, useNav } from "./nav";
import { useMbanking, BANK } from "@/lib/mbanking/store";
import { Header } from "./Header";
import { TopNav } from "./TopNav";
import { BiometricLogin } from "./BiometricLogin";
import { AspidusToaster } from "./AspidusToaster";
import { InstallPrompt } from "./InstallPrompt";
import { HomeTab } from "./tabs/HomeTab";
import { CardsTab } from "./tabs/CardsTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { FxTab } from "./tabs/FxTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { AllTransactionsPage } from "./subpages/AllTransactionsPage";
import { TxDetailsPage } from "./subpages/TxDetailsPage";
import { ReceivePage } from "./subpages/ReceivePage";
import { AccountsPage } from "./subpages/AccountsPage";
import { AnalyticsPage } from "./subpages/AnalyticsPage";
import { TaxesPage } from "./subpages/TaxesPage";
import { CompanyDetailsPage } from "./subpages/CompanyDetailsPage";
import { SupportPage } from "./subpages/SupportPage";
import { SecurityPage } from "./subpages/SecurityPage";
import { CompliancePage } from "./subpages/CompliancePage";
import type { TabId } from "@/lib/mbanking/types";

export function MbankingApp() {
  return (
    <NavProvider>
      <AppShell />
    </NavProvider>
  );
}

function AppShell() {
  const status = useMbanking((s) => s.status);
  const checkSession = useMbanking((s) => s.checkSession);
  const hydrate = useMbanking((s) => s.hydrate);

  // On first mount, check whether a valid session cookie already exists.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const authed = await checkSession();
      if (cancelled) return;
      if (authed) await hydrate();
    })();
    return () => {
      cancelled = true;
    };
  }, [checkSession, hydrate]);

  return (
    <>
      <div className="app-bg relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden border-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.3)] sm:border-x">
        <Header />
        <TopNav />
        <main className="hide-scrollbar relative flex-1 overflow-y-auto px-5 pb-12 pt-5">
          {status === "authenticated" ? (
            <ActiveTab />
          ) : (
            <DashboardSkeleton />
          )}
        </main>
      </div>
      {/* Overlays rendered outside the overflow container. */}
      <ActiveSubPage />
      {status !== "authenticated" && status !== "loading" && (
        <BiometricLogin onAuthenticated={() => hydrate()} />
      )}
      {status === "loading" && <SplashScreen />}
      <AspidusToaster />
      <InstallPrompt />
    </>
  );
}

function ActiveTab() {
  const tab = useNav((n) => n.tab);
  switch (tab) {
    case "home":
      return <HomeTab />;
    case "cards":
      return <CardsTab />;
    case "payments":
      return <PaymentsTab />;
    case "fx":
      return <FxTab />;
    case "profile":
      return <ProfileTab />;
    default:
      return <HomeTab />;
  }
}

function ActiveSubPage() {
  const subPage = useNav((n) => n.subPage);
  switch (subPage) {
    case "all-transactions":
      return <AllTransactionsPage />;
    case "tx-details":
      return <TxDetailsPage />;
    case "receive":
      return <ReceivePage />;
    case "accounts":
      return <AccountsPage />;
    case "analytics":
      return <AnalyticsPage />;
    case "taxes":
      return <TaxesPage />;
    case "company-details":
      return <CompanyDetailsPage />;
    case "support":
      return <SupportPage />;
    case "security":
      return <SecurityPage />;
    case "compliance":
      return <CompliancePage />;
    default:
      return null;
  }
}

function SplashScreen() {
  return (
    <div
      className="premium-navy-card fixed inset-0 z-[200] flex flex-col items-center justify-center text-white"
      style={{ backgroundColor: "#0B3D2E" }}
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-[1rem] border border-amber-500/20 bg-white/[0.03]">
          <img src="/icons/icon-192.png" alt={BANK.name} className="h-16 w-16 rounded-[1rem]" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/80">
          {BANK.tagline}
        </p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="fade-in flex flex-col gap-6">
      <div className="premium-navy-card h-56 rounded-[2rem]" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-[1.2rem] bg-slate-100" />
        ))}
      </div>
      <div className="h-24 rounded-[1.5rem] bg-slate-100" />
      <div className="h-64 rounded-[1.5rem] bg-slate-100" />
    </div>
  );
}

export type { TabId };
