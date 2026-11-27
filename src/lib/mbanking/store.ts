"use client";

import { create } from "zustand";
import type {
  Account,
  AuthStatus,
  Beneficiary,
  CardInfo,
  FxRate,
  LoginEvent,
  NotificationItem,
  Profile,
  Transaction,
  TransferMethod,
} from "./types";
import type { ComplianceCase } from "./compliance-types";
import type {
  Deposit,
  LoanFacility,
  TradeInstrument,
} from "./corporate-types";

interface MbankingState {
  status: AuthStatus;
  profile: Profile | null;
  balance: number;
  accounts: Account[];
  cards: CardInfo[];
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  fxRates: FxRate[];
  loginEvents: LoginEvent[];
  /** Active compliance case (funds-blocked), if any. */
  complianceCase: ComplianceCase | null;
  /** Trade finance instruments (LCs, LGs, collections, trust receipts). */
  tradeInstruments: TradeInstrument[];
  /** Credit facilities / loans. */
  facilities: LoanFacility[];
  /** Term and call deposits. */
  deposits: Deposit[];
  /** Corporate workbench records (approvals, scheduled, cheques, books). */
  workItems: Transaction[];
  /** Notification inbox (computed server-side from live data). */
  notifications: NotificationItem[];
  /** Ids of notifications already seen (persisted locally). */
  readNotificationIds: string[];
  /** Privacy toggle — hide balance on screen. */
  hideBalance: boolean;
  /** Whether biometric re-auth is required on every launch (in-memory setting). */
  requireBiometrics: boolean;
  lastError: string | null;

  // actions
  checkSession: () => Promise<boolean>;
  hydrate: () => Promise<void>;
  refreshWorkbench: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  decideApproval: (
    id: string,
    decision: "approve" | "reject"
  ) => Promise<{ ok: boolean; note?: string; error?: string }>;
  requestApproval: (
    kind: "payment" | "beneficiary" | "chequebook" | "stopcheque",
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: string }>;
  cancelWorkItem: (id: string) => Promise<{ ok: boolean; error?: string }>;
  addBeneficiaryRequest: (input: {
    name: string;
    iban: string;
    country?: string;
    method?: string;
    note?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  deleteBeneficiary: (id: string) => Promise<{ ok: boolean; error?: string }>;
  downloadStatement: (
    accountId: string,
    from: string,
    to: string
  ) => Promise<void>;
  sendTransfer: (input: {
    recipient: string;
    iban: string;
    amount: number;
    method: TransferMethod;
    fromAccountId?: string;
    memo?: string;
  }) => Promise<{ ok: true; tx: Transaction } | { ok: false; reason: string }>;
  toggleCardFreeze: (cardId: string) => Promise<void>;
  setHideBalance: (v: boolean) => void;
  setRequireBiometrics: (v: boolean) => void;
  logout: () => Promise<void>;
}

async function api<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string }).error || `request_failed_${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

/** Read-state for notifications, persisted locally. */
function loadReadIds(): string[] {
  try {
    const v = localStorage.getItem("cbi-read-notifications");
    return v ? (JSON.parse(v) as string[]) : [];
  } catch {
    return [];
  }
}

export const useMbanking = create<MbankingState>((set, get) => ({
  status: "loading",
  profile: null,
  balance: 0,
  accounts: [],
  cards: [],
  transactions: [],
  beneficiaries: [],
  fxRates: [],
  loginEvents: [],
  complianceCase: null,
  tradeInstruments: [],
  facilities: [],
  deposits: [],
  workItems: [],
  notifications: [],
  readNotificationIds: [],
  hideBalance: false,
  requireBiometrics: true,
  lastError: null,

  checkSession: async () => {
    try {
      const data = await api<{ authenticated: boolean }>(`/api/session?_=${Date.now()}`);
      if (data.authenticated) {
        set({ status: "authenticated" });
        return true;
      }
      set({ status: "unauthenticated" });
      return false;
    } catch {
      set({ status: "unauthenticated" });
      return false;
    }
  },

  hydrate: async () => {
    try {
      const [data, compl, corp, work, notif] = await Promise.all([
        api<{
          profile: Profile;
          accounts: Account[];
          cards: CardInfo[];
          beneficiaries: Beneficiary[];
          fxRates: FxRate[];
          transactions: Transaction[];
          loginEvents: LoginEvent[];
          balance: number;
        }>(`/api/me?_=${Date.now()}`),
        api<{ case: ComplianceCase | null }>(`/api/compliance?_=${Date.now()}`),
        api<{
          tradeInstruments: TradeInstrument[];
          facilities: LoanFacility[];
          deposits: Deposit[];
        }>(`/api/corporate?_=${Date.now()}`),
        api<{ workItems: Transaction[] }>(`/api/workbench?_=${Date.now()}`),
        api<{ notifications: NotificationItem[] }>(`/api/notifications?_=${Date.now()}`),
      ]);
      set({
        status: "authenticated",
        profile: data.profile,
        accounts: data.accounts,
        cards: data.cards,
        beneficiaries: data.beneficiaries,
        fxRates: data.fxRates,
        transactions: data.transactions,
        loginEvents: data.loginEvents,
        balance: data.balance,
        complianceCase: compl.case,
        tradeInstruments: corp.tradeInstruments,
        facilities: corp.facilities,
        deposits: corp.deposits,
        workItems: work.workItems,
        notifications: notif.notifications,
        readNotificationIds: loadReadIds(),
        lastError: null,
      });
    } catch (e) {
      set({ status: "unauthenticated", lastError: (e as Error).message });
    }
  },

  refreshWorkbench: async () => {
    try {
      const [work, data] = await Promise.all([
        api<{ workItems: Transaction[] }>(`/api/workbench?_=${Date.now()}`),
        api<{ transactions: Transaction[]; balance: number; accounts: Account[] }>(`/api/me?_=${Date.now()}`),
      ]);
      set({
        workItems: work.workItems,
        transactions: data.transactions,
        balance: data.balance,
        accounts: data.accounts,
      });
    } catch {
      /* keep previous state */
    }
  },

  refreshNotifications: async () => {
    try {
      const notif = await api<{ notifications: NotificationItem[] }>(`/api/notifications?_=${Date.now()}`);
      set({ notifications: notif.notifications });
    } catch {
      /* keep previous state */
    }
  },

  markNotificationRead: (id) => {
    set((s) => {
      const ids = Array.from(new Set([...s.readNotificationIds, id]));
      try {
        localStorage.setItem("cbi-read-notifications", JSON.stringify(ids));
      } catch {
        /* ignore */
      }
      return { readNotificationIds: ids };
    });
  },

  markAllNotificationsRead: () => {
    const ids = get().notifications.map((n) => n.id);
    try {
      localStorage.setItem("cbi-read-notifications", JSON.stringify(ids));
    } catch {
      /* ignore */
    }
    set({ readNotificationIds: ids });
  },

  decideApproval: async (id, decision) => {
    try {
      const data = await api<{ ok: boolean; note?: string }>('/api/approvals', {
        method: 'PATCH',
        body: JSON.stringify({ id, decision }),
      });
      await get().refreshWorkbench();
      await get().refreshNotifications();
      return { ok: true, note: data.note };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },

  requestApproval: async (kind, payload) => {
    try {
      await api('/api/approvals', {
        method: 'POST',
        body: JSON.stringify({ kind, payload }),
      });
      await get().refreshWorkbench();
      await get().refreshNotifications();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },

  cancelWorkItem: async (id) => {
    try {
      await api('/api/workbench', {
        method: 'PATCH',
        body: JSON.stringify({ id, action: 'cancel' }),
      });
      await get().refreshWorkbench();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },

  addBeneficiaryRequest: async (input) => {
    try {
      await api('/api/beneficiaries', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      await get().refreshWorkbench();
      await get().refreshNotifications();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },

  deleteBeneficiary: async (id) => {
    try {
      await api(`/api/beneficiaries?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      set((s) => ({ beneficiaries: s.beneficiaries.filter((b) => b.id !== id) }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },

  downloadStatement: async (accountId, from, to) => {
    const res = await fetch('/api/statements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ accountId, from, to }),
    });
    if (!res.ok) {
      throw new Error('statement_failed');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CBI-Statement-${from}-to-${to}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  },

  sendTransfer: async (input) => {
    try {
      const data = await api<{ ok: true; transaction: Transaction; balance: number }>(
        "/api/transactions",
        {
          method: "POST",
          body: JSON.stringify(input),
        }
      );
      set((s) => ({
        balance: data.balance,
        transactions: [data.transaction, ...s.transactions],
      }));
      return { ok: true, tx: data.transaction };
    } catch (e) {
      return { ok: false, reason: (e as Error).message };
    }
  },

  toggleCardFreeze: async (cardId) => {
    const card = get().cards.find((c) => c.id === cardId);
    if (!card) return;
    const next = !card.frozen;
    // Optimistic update.
    set((s) => ({
      cards: s.cards.map((c) => (c.id === cardId ? { ...c, frozen: next } : c)),
    }));
    try {
      await api(`/api/cards/${cardId}/freeze`, {
        method: "PATCH",
        body: JSON.stringify({ frozen: next }),
      });
    } catch {
      // Revert on failure.
      set((s) => ({
        cards: s.cards.map((c) =>
          c.id === cardId ? { ...c, frozen: !next } : c
        ),
      }));
    }
  },

  setHideBalance: (v) => set({ hideBalance: v }),
  setRequireBiometrics: (v) => set({ requireBiometrics: v }),

  logout: async () => {
    try {
      await api("/api/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    set({
      status: "unauthenticated",
      profile: null,
      balance: 0,
      accounts: [],
      cards: [],
      transactions: [],
      beneficiaries: [],
      fxRates: [],
      loginEvents: [],
      complianceCase: null,
      tradeInstruments: [],
      facilities: [],
      deposits: [],
      workItems: [],
      notifications: [],
      readNotificationIds: [],
    });
  },
}));

/** Bank branding constants (client-side). */
export const BANK = {
  name: "Commercial Bank International",
  shortName: "CBI",
  legalName: "Commercial Bank International PJSC",
  tagline: "Corporate Banking · Trade Finance",
  license: "CBI-UAE-1976",
  regulatedBy: "Regulated by the Central Bank of the UAE",
  // Prave CBI brand boje (preuzete sa njihovog logoa)
  colors: {
    primary: "#1B3A5C",    // navy/teal plava (iz logoa)
    accent: "#C21E56",     // crimson/magenta (iz logoa)
    teal: "#2E6E9E",       // teal plava
    navy: "#0a1a2e",       // duboka navy za login
  },
};
