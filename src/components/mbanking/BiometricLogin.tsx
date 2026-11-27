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
import { Fingerprint, ScanFace, ShieldCheck, AlertCircle, ChevronRight } from "lucide-react";
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
  const [passcode, setPasscode] = useState("");

  useEffect(() => {
    const ok = browserSupportsWebAuthn();
    setSupported(ok);
  }, []);

  /** Ako stari kredencijal ne postoji u bazi — obriši lokalni i kreni iznova. */
  const clearStaleCredential = () => {
    try {
      localStorage.removeItem(CRED_ID_KEY);
    } catch {
      /* ignore */
    }
  };

  const handlePasscode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passcode.length !== 6) return;
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
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const handleBiometric = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!browserSupportsWebAuthn()) {
        setError("This device does not support biometrics. Use the access code below.");
        setBusy(false);
        return;
      }
      const hasCred = Boolean(localStorage.getItem(CRED_ID_KEY));
      if (hasCred) {
        // Autentikacija postojećeg kredencijala
        const opts = await fetch("/api/biometric/auth/options").then((r) => r.json());
        if (!opts.options) throw new Error(opts.error || "Could not start authentication.");
        const asst = (await startAuthentication({
          optionsJSON: opts.options,
        })) as AuthenticationResponseJSON;
        const res = await fetch("/api/biometric/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: asst, deviceLabel: deviceLabel() }),
        });
        const data = await res.json();
        if (!res.ok) {
          // Stari kredencijal više ne postoji u bazi — obriši i probaj enrollment
          clearStaleCredential();
          throw new Error(
            data.error?.includes("Unknown credential")
              ? "Saved biometrics no longer recognized. Tap the fingerprint again to re-enable."
              : data.error || "Authentication failed."
          );
        }
        toast("Identity verified", "success");
        onAuthenticated();
      } else {
        // Prvi put — enrollment
        const opts = await fetch("/api/biometric/register/options").then((r) => r.json());
        if (!opts.options) throw new Error(opts.error || "Could not start enrollment.");
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
        try {
          localStorage.setItem(CRED_ID_KEY, att.id);
        } catch {
          /* ignore */
        }
        toast("Biometric enabled for this device", "success");
        onAuthenticated();
      }
    } catch (err) {
      const msg = (err as Error).message || "Biometric prompt was cancelled.";
      setError(msg);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0a1a2e]">
      {/* UAE flag accent strip — top */}
      <div className="uae-flag-accent absolute left-0 right-0 top-0 h-1" />

      {/* Subtle teal glow */}
      <div
        className="pointer-events-none absolute right-[-120px] top-[-100px] h-80 w-80 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(46,110,158,0.5) 0%, transparent 70%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-7">
        {/* CBI logo */}
        <div className="mb-8 flex flex-col items-center">
          <img
            src="/icons/cbi-logo-full.png"
            alt="Commercial Bank International"
            className="h-16 w-auto mb-4 drop-shadow-lg"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <div className="h-px w-16 bg-white/25 mb-3" />
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">
            Corporate Treasury
          </p>
          <p className="mt-1 text-[11px] font-medium text-white/50">
            Authorized signatory access
          </p>
        </div>

        {/* Access code — UVEK vidljiv (primarna metoda kao u pravim bankama) */}
        <form onSubmit={handlePasscode} className="w-full max-w-xs">
          <label className="mb-2 block text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
            Access code
          </label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="• • • • • •"
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3.5 text-center text-xl font-black tracking-[0.6em] text-white outline-none placeholder:text-white/30 focus:border-white/30"
          />
          <button
            type="submit"
            disabled={passcode.length !== 6 || busy}
            className="mt-3 w-full rounded-xl py-3.5 text-sm font-black transition-colors disabled:opacity-40"
            style={{ background: "#C21E56", color: "white" }}
          >
            {busy ? "Verifying…" : "Log In"}
          </button>
        </form>

        {/* Biometrija — sekundarna opcija ispod */}
        <button
          onClick={handleBiometric}
          disabled={busy}
          className="group mt-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] shadow-xl transition-all hover:bg-white/[0.12] disabled:opacity-60"
          aria-label="Use biometrics"
        >
          {busy ? (
            <ScanFace className="h-8 w-8 animate-pulse text-white" />
          ) : (
            <Fingerprint className="h-8 w-8 text-white transition-transform group-hover:scale-105" />
          )}
        </button>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          {supported === false ? "Not available on this device" : "Use Face ID / fingerprint"}
        </p>

        {/* Error */}
        {error && (
          <div className="mt-5 flex max-w-xs items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="text-left leading-relaxed">{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-7 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
            <ShieldCheck className="h-3 w-3" />
            Bank-grade encryption · FIDO2 / WebAuthn
          </div>
          <p className="text-[9px] font-medium text-white/30">
            {BANK.legalName} · Regulated by the Central Bank of the UAE
          </p>
        </div>
      </div>
    </div>
  );
}
