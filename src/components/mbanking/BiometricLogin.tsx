"use client";

import { useEffect, useState } from "react";
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/browser";
import { Fingerprint, ScanFace, ShieldCheck, Lock, AlertCircle, ChevronRight } from "lucide-react";
import { BANK } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";

const CRED_ID_KEY = "mawj.credId";

function deviceLabel(): string {
  if (typeof navigator === "undefined") return "WebAuthn device";
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone · Face ID";
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document)) return "iPad · Face ID";
  if (/Mac/.test(ua)) return "Mac · Touch ID";
  if (/Android/.test(ua)) return "Android · Fingerprint";
  if (/Windows/.test(ua)) return "Windows · Hello";
  return "This device";
}

interface Props {
  onAuthenticated: () => void;
}

export function BiometricLogin({ onAuthenticated }: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [hasCredential, setHasCredential] = useState(false);

  useEffect(() => {
    const ok = browserSupportsWebAuthn();
    setSupported(ok);
    setHasCredential(Boolean(localStorage.getItem(CRED_ID_KEY)));
  }, []);

  const handleAuthenticate = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!browserSupportsWebAuthn()) {
        setShowPasscode(true);
        return;
      }
      const hasCred = Boolean(localStorage.getItem(CRED_ID_KEY));
      if (hasCred) {
        // Authentication flow.
        const opts = await fetch("/api/biometric/auth/options").then((r) => r.json());
        const asst = (await startAuthentication({
          optionsJSON: opts.options,
        })) as AuthenticationResponseJSON;
        const res = await fetch("/api/biometric/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: asst, deviceLabel: deviceLabel() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Authentication failed.");
        toast("Biometric verification successful", "success");
        onAuthenticated();
      } else {
        // First-time enrollment flow.
        const opts = await fetch("/api/biometric/register/options").then((r) => r.json());
        const att = (await startRegistration({
          optionsJSON: opts.options,
        })) as RegistrationResponseJSON;
        const res = await fetch("/api/biometric/register/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: att, deviceLabel: deviceLabel() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Enrollment failed.");
        localStorage.setItem(CRED_ID_KEY, att.id);
        toast("Biometric enabled for this device", "success");
        onAuthenticated();
      }
    } catch (e) {
      const msg = (e as Error).message || "Biometric prompt was cancelled.";
      setError(msg);
      setBusy(false);
    }
  };

  const handlePasscode = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid access code.");
      toast("Access granted", "success");
      onAuthenticated();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div
      className="premium-navy-card fixed inset-0 z-[200] flex flex-col items-center justify-center px-8 text-center text-white"
      style={{ backgroundColor: "#0B3D2E" }}
    >
      {/* UAE flag accent strip — top */}
      <div className="uae-flag-accent absolute left-0 right-0 top-0 h-1 opacity-90" />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* Logo */}
        <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.25rem] shadow-2xl ring-1 ring-white/10">
          <img src="/icons/icon-192.png" alt={BANK.name} className="h-20 w-20 rounded-[1.25rem]" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/80">
          {BANK.tagline}
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">{BANK.name}</h1>
        <p className="mt-2 max-w-xs text-xs font-medium text-slate-300/80">
          Authorized signatory access. Verify your identity to open the
          corporate treasury.
        </p>

        {/* Biometric button */}
        <button
          onClick={handleAuthenticate}
          disabled={busy}
          className="group mt-10 flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md transition-all hover:bg-white/[0.08] disabled:opacity-80"
          aria-label="Authenticate with biometrics"
        >
          {busy ? (
            <ScanFace className="h-12 w-12 animate-pulse text-amber-400" />
          ) : (
            <Fingerprint className="h-12 w-12 text-white transition-transform group-hover:scale-105" />
          )}
        </button>

        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-400">
          {busy
            ? "Verifying…"
            : supported === false
              ? "Biometrics unavailable — use access code"
              : hasCredential
                ? "Tap to authenticate"
                : "Tap to enable biometrics"}
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="text-left">{error}</span>
          </div>
        )}

        {/* Passcode fallback */}
        {showPasscode || supported === false ? (
          <div className="mt-6 w-full">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Access code
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="• • • • • •"
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 text-center text-lg font-black tracking-[0.5em] text-white outline-none placeholder:text-slate-600 focus:border-amber-400/40"
            />
            <button
              onClick={handlePasscode}
              disabled={passcode.length !== 6 || busy}
              className="mt-3 w-full rounded-xl bg-amber-500 py-3 text-sm font-black text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              Unlock
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPasscode(true)}
            className="mt-8 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300"
          >
            <Lock className="h-3 w-3" />
            Use access code instead
          </button>
        )}

        <div className="mt-10 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
          <ShieldCheck className="h-3.5 w-3.5" />
          Bank-grade encryption · FIDO2 / WebAuthn
        </div>
      </div>

      <div className="absolute bottom-6 flex flex-col items-center gap-1">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
          {BANK.legalName} · {BANK.license}
        </p>
        <p className="text-[9px] font-medium tracking-wide text-slate-700">
          {BANK.regulatedBy}
        </p>
      </div>
    </div>
  );
}
