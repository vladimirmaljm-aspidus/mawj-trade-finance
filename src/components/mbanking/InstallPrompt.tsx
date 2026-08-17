"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Shows an "Install app" banner when the browser fires the
 * `beforeinstallprompt` event (Chrome/Edge/Android). On iOS Safari there is
 * no programmatic prompt, so we show a small hint instead.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect previous dismissals for this session.
    if (sessionStorage.getItem("aspidus-install-dismissed") === "1") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      const t = setTimeout(() => setIosHint(true), 2500);
      window.addEventListener("beforeinstallprompt", onBeforeInstall);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      };
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setIosHint(false);
    setDismissed(true);
    sessionStorage.setItem("aspidus-install-dismissed", "1");
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    }
    setDeferred(null);
  };

  if (dismissed) return null;

  if (visible && deferred) {
    return (
      <div className="aspidus-slide-up fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <img src="/icons/icon-192.png" alt="CBI" className="h-11 w-11 shrink-0 rounded-xl shadow-sm ring-1 ring-slate-200" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-900">Install CBI</p>
            <p className="truncate text-xs font-medium text-slate-500">
              Add to your home screen for a native app experience.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={install}
          className="active-scale mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-black text-white shadow-md transition-colors hover:bg-emerald-800"
        >
          <Download className="h-4 w-4" />
          Install App
        </button>
        <style jsx>{`
          .aspidus-slide-up {
            animation: aspidus-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes aspidus-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  if (iosHint) {
    return (
      <div className="aspidus-slide-up fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <img src="/icons/icon-192.png" alt="CBI" className="h-11 w-11 shrink-0 rounded-xl shadow-sm ring-1 ring-slate-200" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-900">Install CBI</p>
            <p className="text-xs font-medium text-slate-500">
              Tap{" "}
              <span className="font-black text-slate-900">
                Share
              </span>{" "}
              then{" "}
              <span className="font-black text-slate-900">
                Add to Home Screen
              </span>{" "}
              to install.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <style jsx>{`
          .aspidus-slide-up {
            animation: aspidus-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes aspidus-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
