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
import { Fingerprint, ChevronLeft } from "lucide-react";
import { CbiHeader, CbiFooter, CbiButton } from "./cbi";
import { BranchAtmPage } from "./prelogin/BranchAtmPage";
import { RegisterPage } from "./prelogin/RegisterPage";
import { ContactUsPage } from "./prelogin/ContactUsPage";
import { HelpPage } from "./prelogin/HelpPage";
import { ForgotUsernamePage } from "./prelogin/ForgotUsernamePage";
import { ForgotPasswordPage } from "./prelogin/ForgotPasswordPage";
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

type LoginMode =
  | "menu"
  | "username"
  | "password"
  | "branch-atm"
  | "register"
  | "contact"
  | "help"
  | "forgot-username"
  | "forgot-password";

interface Props {
  onAuthenticated: () => void;
}

export function BiometricLogin({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<LoginMode>("menu");
  const [supported, setSupported] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setSupported(browserSupportsWebAuthn());
  }, []);

  const clearStaleCredential = () => {
    try {
      localStorage.removeItem(CRED_ID_KEY);
    } catch {
      /* ignore */
    }
  };

  /* ---------- Passcode (password step) ---------- */
  const handlePasscode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid password.");
      toast("Welcome to CBI Mobile Banking", "success");
      onAuthenticated();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  /* ---------- Biometric ---------- */
  const handleBiometric = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!browserSupportsWebAuthn()) {
        setError("Biometric login is not supported on this device. Use LOGIN instead.");
        setBusy(false);
        return;
      }
      const hasCred = Boolean(localStorage.getItem(CRED_ID_KEY));
      if (hasCred) {
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
          clearStaleCredential();
          throw new Error(
            data.error?.includes("Unknown credential")
              ? "Saved biometrics no longer recognized. Tap BIOMETRIC LOGIN again to re-enable."
              : data.error || "Authentication failed."
          );
        }
        toast("Welcome to CBI Mobile Banking", "success");
        onAuthenticated();
      } else {
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

  /* ---------- Pre-login full screens ---------- */
  if (mode === "branch-atm") {
    return <BranchAtmPage onBack={() => setMode("menu")} />;
  }
  if (mode === "register") {
    return <RegisterPage onBack={() => setMode("menu")} />;
  }
  if (mode === "contact") {
    return <ContactUsPage onBack={() => setMode("menu")} />;
  }
  if (mode === "help") {
    return <HelpPage onBack={() => setMode("menu")} />;
  }
  if (mode === "forgot-username") {
    return <ForgotUsernamePage onBack={() => setMode("menu")} />;
  }
  if (mode === "forgot-password") {
    return <ForgotPasswordPage onBack={() => setMode("menu")} />;
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#F7F7F7]">
      <CbiHeader title="Mobile Banking" />

      <div className="hide-scrollbar flex-1 overflow-y-auto">
        {mode === "menu" && (
          <div className="px-3 pb-6 pt-4">
            {/* 4 stacked full-width buttons — like the real CBI pre-login */}
            <div className="flex flex-col gap-3">
              <CbiButton onClick={() => setMode("username")}>Login</CbiButton>
              <CbiButton onClick={() => setMode("register")}>Register</CbiButton>
              <CbiButton onClick={() => setMode("branch-atm")}>Branch &amp; ATM</CbiButton>
              <CbiButton onClick={handleBiometric} disabled={busy}>
                {busy ? "Please wait…" : "Biometric Login"}
              </CbiButton>
            </div>

            {error && (
              <p className="mt-3 px-1 text-[12px] leading-relaxed text-[#C00000]">{error}</p>
            )}

            {/* Promo banner — like the real app's eSaver card */}
            <div className="cbi-card mt-5 px-4 py-4">
              <p className="text-[13px] font-bold text-[#595959]">
                CBI Corporate Treasury on Mobile
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#7F7F7F]">
                Manage corporate accounts, transfers and FX from anywhere —
                approved for authorized signatories.
              </p>
              <div className="mt-2.5 flex items-center gap-1.5">
                <Fingerprint className="h-3.5 w-3.5 text-[#7A1F3D]" />
                <span className="text-[11px] text-[#7F7F7F]">
                  Secured with FIDO2 biometric authentication
                </span>
              </div>
            </div>

            {/* Footer links row — like the real pre-login screen */}
            <div className="mt-5 flex items-start justify-between px-1 pb-2 text-[12px] text-[#000F32]">
              <div className="flex flex-col gap-2">
                <button className="active:opacity-60" onClick={() => setMode("contact")}>
                  Contact Us
                </button>
                <button className="active:opacity-60" onClick={() => setMode("help")}>
                  Help
                </button>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  className="active:opacity-60"
                  onClick={() => setMode("forgot-username")}
                >
                  Forgot Username?
                </button>
                <button
                  className="active:opacity-60"
                  onClick={() => setMode("forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === "username" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (username.trim()) setMode("password");
            }}
            className="px-3 pb-6 pt-4"
          >
            <div className="cbi-card px-4 pb-5 pt-5">
              <label className="text-[13px] font-medium text-[#E8306E]">Username</label>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                placeholder="Enter your username"
              />
            </div>
            <div className="mt-4">
              <CbiButton type="submit" disabled={!username.trim()}>
                Next
              </CbiButton>
            </div>
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="mt-4 flex items-center gap-1 px-1 text-[13px] text-[#000F32] active:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <p className="mt-3 px-1 text-[11px] text-[#9E9E9E]">
              Demo tip: any username works in this environment.
            </p>
          </form>
        )}

        {mode === "password" && (
          <form onSubmit={handlePasscode} className="px-3 pb-6 pt-4">
            <div className="cbi-card px-4 pb-5 pt-5">
              <label className="text-[13px] font-medium text-[#E8306E]">Password</label>
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                placeholder="Enter your password"
              />
            </div>
            <div className="mt-4">
              <CbiButton type="submit" disabled={!password || busy}>
                {busy ? "Please wait…" : "Login"}
              </CbiButton>
            </div>
            <button
              type="button"
              onClick={() => setMode("username")}
              className="mt-4 flex items-center gap-1 px-1 text-[13px] text-[#000F32] active:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            {error && (
              <p className="mt-3 px-1 text-[12px] leading-relaxed text-[#C00000]">{error}</p>
            )}
          </form>
        )}
      </div>

      <CbiFooter />
    </div>
  );
}
