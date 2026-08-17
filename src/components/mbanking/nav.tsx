"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { SubPageId, TabId } from "@/lib/mbanking/types";

interface NavState {
  tab: TabId;
  subPage: SubPageId | null;
  /** Transaction id selected for the details page, if any. */
  selectedTxId: string | null;
  setTab: (t: TabId) => void;
  openSubPage: (p: SubPageId) => void;
  closeSubPage: () => void;
  openTxDetails: (id: string) => void;
}

const NavContext = createContext<NavState | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabId>("home");
  const [subPage, setSubPage] = useState<SubPageId | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const openSubPage = useCallback((p: SubPageId) => setSubPage(p), []);
  const closeSubPage = useCallback(() => setSubPage(null), []);
  const openTxDetails = useCallback((id: string) => {
    setSelectedTxId(id);
    setSubPage("tx-details");
  }, []);
  const handleSetTab = useCallback((t: TabId) => {
    setSubPage(null);
    setTab(t);
  }, []);

  return (
    <NavContext.Provider
      value={{
        tab,
        subPage,
        selectedTxId,
        setTab: handleSetTab,
        openSubPage,
        closeSubPage,
        openTxDetails,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav<T>(selector: (s: NavState) => T): T;
export function useNav(): NavState;
export function useNav<T>(selector?: (s: NavState) => T): NavState | T {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside <NavProvider>");
  return selector ? selector(ctx) : ctx;
}
