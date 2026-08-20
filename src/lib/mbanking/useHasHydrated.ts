"use client";

import { useSyncExternalStore } from "react";
import { useMbanking } from "./store";

/**
 * Returns `true` once the persisted Zustand store has rehydrated from
 * localStorage. Uses `useSyncExternalStore` so it is SSR-safe and does not
 * trigger the "setState in effect" lint rule.
 */
export function useHasHydrated(): boolean {
  const store = useMbanking;
  return useSyncExternalStore(
    (onChange) => {
      // localStorage rehydration is synchronous, so on the client the store is
      // already hydrated by the time React hydrates. We still subscribe so any
      // future async rehydration is handled.
      const unsub = store.persist.onFinishHydration(onChange);
      return unsub;
    },
    () => store.persist.hasHydrated(),
    () => false // server snapshot — never hydrated on the server
  );
}
