"use client";

import { create } from "zustand";
import type {
  Account,
  AuthStatus,
  Beneficiary,
  CardInfo,
  FxRate,
  LoginEvent,
  Profile,
  Transaction,
  TransferMethod,
} from "./types";

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
  /** Privacy toggle — hide balance on screen. */
  hideBalance: boolean;
  /** Whether biometric re-auth is required on every launch (in-memory setting). */
  requireBiometrics: boolean;
  lastError: string | null;

  // actions
  checkSession: () => Promise<boolean>;
  hydrate: () => Promise<void>;
  sendTransfer: (input: {
    recipient: string;
    iban: string;
    amount: number;
    method: TransferMethod;
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
      const data = await api<{
        profile: Profile;
        accounts: Account[];
        cards: CardInfo[];
        beneficiaries: Beneficiary[];
        fxRates: FxRate[];
        transactions: Transaction[];
        loginEvents: LoginEvent[];
        balance: number;
      }>(`/api/me?_=${Date.now()}`);
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
        lastError: null,
      });
    } catch (e) {
      set({ status: "unauthenticated", lastError: (e as Error).message });
    }
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
        accounts: s.accounts.map((a) =>
          a.is_primary ? { ...a, balance: data.balance } : a
        ),
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
};
