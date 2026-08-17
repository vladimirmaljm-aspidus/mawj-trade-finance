"use client";

import { create } from "zustand";

export interface ToastItem {
  id: number;
  message: string;
  tone?: "info" | "success" | "error";
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, tone?: ToastItem["tone"]) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, tone = "info") => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => get().dismiss(id), 3000);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helper usable outside React components. */
export const toast = (message: string, tone?: ToastItem["tone"]) =>
  useToastStore.getState().show(message, tone);
