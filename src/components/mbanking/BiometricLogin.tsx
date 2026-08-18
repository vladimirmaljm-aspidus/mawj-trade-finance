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

const CRED_ID_KEY = "cbi.credId";

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
        toast("Identity verified", "success");
        onAuthenticated();
      } else {
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
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0a1a14] text-white">
      {/* Subtle top UAE flag strip */}
      <div className="uae-flag-accent absolute left-0 right-0 top-0 h-1" />

      {/* Decorative gold radial in the top-right */}
      <div
        className="pointer-events-none absolute right-[-100px] top-[-80px] h-72 w-72 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(201,161,74,0.45) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-7">
        {/* Bank logo + wordmark */}
        <div className="mb-7 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
            <img
              src="/icons/icon-192.png"
              alt={BANK.name}
              className="h-20 w-20"
            />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400/80">
            Commercial Bank International
          </p>
          <h1 className="mt-1 text-xl font-black tracking-tight">Corporate Treasury</h1>
          <p className="mt-1 text-[11px] font-medium text-slate-400">
            Authorized signatory access · DMCC-3184
          </p>
        </div>

        {/* Biometric orb */}
        <button
          onClick={handleAuthenticate}
          disabled={busy}
          className="group relative flex h-28 w-28 items-center justify-center rounded-full border border-white/5 bg-gradient-to-br from-white/[0.07] to-white/[0.02] shadow-2xl transition-all hover:from-white/[0.12] disabled:opacity-70"
          aria-label="Authenticate with biometrics"
        >
          {/* Gold ring */}
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-60"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(201,161,74,0.25), 0 0 40px rgba(201,161,74,0.15)",
            }}
          />
          {busy ? (
            <ScanFace className="h-12 w-12 animate-pulse text-amber-400" />
          ) : (
            <Fingerprint className="h-12 w-12 text-white transition-transform group-hover:scale-105" />
          )}
        </button>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          {busy
            ? "Verifying…"
            : supported === false
              ? "Use access code"
              : hasCredential
                ? "Tap to authenticate"
                : "Set up biometrics"}
        </p>

        {/* Error */}
        {error && (
          <div className="mt-5 flex max-w-xs items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="text-left leading-relaxed">{error}</span>
          </div>
        )}

        {/* Passcode */}
        {showPasscode || supported === false ? (
          <div className="mt-7 w-full max-w-xs">
            <label className="mb-2 block text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              Access code
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="• • • • • •"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 text-center text-xl font-black tracking-[0.6em] text-white outline-none placeholder:text-slate-700 focus:border-amber-400/40"
            />
            <button
              onClick={handlePasscode}
              disabled={passcode.length !== 6 || busy}
              className="mt-3 w-full rounded-xl bg-amber-500 py-3.5 text-sm font-black text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-40"
            >
              Unlock
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPasscode(true)}
            className="mt-8 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-slate-300"
          >
            <Lock className="h-3 w-3" />
            Use access code instead
            <ChevronRight className="h-3 w-3" />
          </button>
        )}

        {/* Footer */}
        <div className="absolute bottom-7 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-400/60">
            <ShieldCheck className="h-3 w-3" />
            Bank-grade encryption · FIDO2 / WebAuthn
          </div>
          <p className="text-[9px] font-medium text-slate-600">
            {BANK.legalName} · Regulated by the Central Bank of the UAE
          </p>
        </div>
      </div>
    </div>
  );
}
