"use client";

import { useEffect, useState } from "react";
import { NavProvider, useNav } from "./nav";
import { useMbanking } from "@/lib/mbanking/store";
import { CbiHeader, CbiFooter, CbiLogo } from "./cbi";
import { CbiDrawer } from "./CbiDrawer";
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
import { TradeFinancePage } from "./subpages/TradeFinancePage";
import { TradeInstrumentPage } from "./subpages/TradeInstrumentPage";
import { FinancingPage } from "./subpages/FinancingPage";
import { DepositsPage } from "./subpages/DepositsPage";
import { ApprovalsPage } from "./subpages/ApprovalsPage";
import { ScheduledPage } from "./subpages/ScheduledPage";
import { ChequesPage } from "./subpages/ChequesPage";
import { BeneficiariesPage } from "./subpages/BeneficiariesPage";
import { StatementsPage } from "./subpages/StatementsPage";
import type { TabId } from "@/lib/mbanking/types";

const TAB_TITLES: Record<TabId, string> = {
  home: "Account Summary",
  cards: "Card Services",
  payments: "Transfers",
  fx: "FX Rates",
  profile: "Manage My Account",
};

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
  const tab = useNav((n) => n.tab);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      <div className="app-bg relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-[#F7F7F7] shadow-[0_0_30px_rgba(0,0,0,0.18)]">
        <CbiHeader
          title={status === "authenticated" ? TAB_TITLES[tab] ?? "Mobile Banking" : "Mobile Banking"}
          onMenu={() => setDrawerOpen(true)}
        />
        {/* pb-40 keeps content clear of the fixed Install App banner (~120px) */}
        <main className="hide-scrollbar relative flex-1 overflow-y-auto pb-40">
          {status === "authenticated" ? (
            <ActiveTab />
          ) : (
            <DashboardSkeleton />
          )}
        </main>
        <CbiFooter />
      </div>

      {/* Overlays rendered outside the overflow container. */}
      <CbiDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
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
    case "trade-finance":
      return <TradeFinancePage />;
    case "trade-instrument":
      return <TradeInstrumentPage />;
    case "financing":
      return <FinancingPage />;
    case "deposits":
      return <DepositsPage />;
    case "approvals":
      return <ApprovalsPage />;
    case "scheduled":
      return <ScheduledPage />;
    case "cheques":
      return <ChequesPage />;
    case "beneficiaries":
      return <BeneficiariesPage />;
    case "statements":
      return <StatementsPage />;
    default:
      return null;
  }
}

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <CbiLogo height={44} />
        <p className="mt-4 text-[13px] tracking-[0.1em] text-[#7F7F7F]">MOBILE BANKING</p>
        <div className="mt-6 h-[3px] w-[120px] overflow-hidden bg-[#E5E5E5]">
          <div className="cbi-footer-gradient h-full w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="cbi-card h-[180px]" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="cbi-card h-[110px]" />
        ))}
      </div>
      <div className="cbi-card h-[140px]" />
    </div>
  );
}

export type { TabId };
