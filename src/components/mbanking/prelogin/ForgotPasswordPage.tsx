"use client";

import { useRef, useState } from "react";
import { ChevronLeft, CircleCheckBig } from "lucide-react";
import { cn } from "@/lib/utils";
import { CbiButton } from "../cbi";
import { toast } from "@/lib/mbanking/toast";

type Step = 1 | 2 | 3 | 4;

/** Pre-login full screen — Forgot Password reset via SMS OTP. */
export function ForgotPasswordPage({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>(1);

  // Step 1 — identity
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 2 — OTP (demo: any 6 digits are accepted)
  const [otp, setOtp] = useState<string[]>(Array<string>(6).fill(""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const otpComplete = otp.every((d) => d !== "");

  // Step 3 — new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  const handleOtpChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setOtp((cur) => {
      const next = [...cur];
      next[i] = digit;
      return next;
    });
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const submitIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = "Username is required.";
    if (!mobile.trim()) errs.mobile = "Registered mobile number is required.";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(2);
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpComplete) return;
    setStep(3);
  };

  const submitReset = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (newPassword.length < 6) errs.newPassword = "Password must be at least 6 characters.";
    if (confirmPassword !== newPassword) errs.confirmPassword = "Passwords do not match.";
    setPwErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(4);
      toast("Password reset successful", "success");
    }
  };

  return (
    <div className="cbi-slide-in fixed inset-0 z-[210] flex flex-col bg-[#F7F7F7]">
      {/* Navy header bar */}
      <div className="flex h-[64px] shrink-0 items-center justify-between bg-[#000F32] px-4">
        <div className="flex flex-col gap-[4px]" aria-hidden="true">
          <span className="block h-[2.5px] w-[22px] bg-white/90" />
          <span className="block h-[2.5px] w-[22px] bg-white/90" />
          <span className="block h-[2.5px] w-[22px] bg-white/90" />
        </div>
        <h1 className="truncate text-[16px] font-normal text-white">Forgot Password?</h1>
      </div>

      {/* Reset wizard */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-40 pt-3">
        {step < 4 && (
          <p className="px-1 pb-2 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#7F7F7F]">
            Step {step} of 3
          </p>
        )}

        {/* ---------- Step 1 — Identity ---------- */}
        {step === 1 && (
          <form onSubmit={submitIdentity}>
            <div className="cbi-card px-4 pb-5 pt-4">
              <p className="text-[15px] font-bold text-[#595959]">Verify your identity</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#7F7F7F]">
                Enter your username and registered mobile number to receive a one-time
                password by SMS.
              </p>

              <label className="mt-4 block text-[13px] font-medium text-[#E8306E]">
                Username
              </label>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="mt-1 text-[11px] text-[#C00000]">{errors.username}</p>
              )}

              <label className="mt-4 block text-[13px] font-medium text-[#E8306E]">
                Registered Mobile
              </label>
              <div className="mt-2 flex items-baseline gap-2 border-b-2 border-[#E8306E] pb-2">
                <span className="text-[15px] font-bold text-[#595959]">+971</span>
                <input
                  inputMode="numeric"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="w-full border-0 bg-transparent text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                  placeholder="5X XXX XXXX"
                />
              </div>
              {errors.mobile && (
                <p className="mt-1 text-[11px] text-[#C00000]">{errors.mobile}</p>
              )}
            </div>

            <div className="mt-4">
              <CbiButton type="submit">Send OTP</CbiButton>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 flex items-center gap-1 px-1 text-[13px] text-[#000F32] active:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          </form>
        )}

        {/* ---------- Step 2 — OTP ---------- */}
        {step === 2 && (
          <form onSubmit={submitOtp}>
            <div className="cbi-card px-4 pb-5 pt-4">
              <p className="text-[15px] font-bold text-[#595959]">Enter OTP</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#7F7F7F]">
                OTP sent to your registered mobile ending ••••. Enter the 6-digit code
                to continue.
              </p>
              <div className="mt-4 grid grid-cols-6 gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    autoFocus={i === 0}
                    aria-label={`OTP digit ${i + 1}`}
                    className={cn(
                      "h-11 w-full border-2 bg-transparent text-center text-[17px] font-bold text-[#222] outline-none",
                      digit ? "border-[#E8306E]" : "border-[#D9D9D9]"
                    )}
                  />
                ))}
              </div>
              <p className="mt-3 px-1 text-[11px] text-[#9E9E9E]">
                Demo tip: any 6 digits are accepted.
              </p>
            </div>

            <div className="mt-4">
              <CbiButton type="submit" disabled={!otpComplete}>
                Verify
              </CbiButton>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 flex items-center gap-1 px-1 text-[13px] text-[#000F32] active:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          </form>
        )}

        {/* ---------- Step 3 — New password ---------- */}
        {step === 3 && (
          <form onSubmit={submitReset}>
            <div className="cbi-card px-4 pb-5 pt-4">
              <p className="text-[15px] font-bold text-[#595959]">Set a new password</p>

              <label className="mt-3 block text-[13px] font-medium text-[#E8306E]">
                New Password
              </label>
              <input
                autoFocus
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                placeholder="Minimum 6 characters"
              />
              {pwErrors.newPassword && (
                <p className="mt-1 text-[11px] text-[#C00000]">{pwErrors.newPassword}</p>
              )}

              <label className="mt-4 block text-[13px] font-medium text-[#E8306E]">
                Confirm Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                placeholder="Re-enter your new password"
              />
              {pwErrors.confirmPassword && (
                <p className="mt-1 text-[11px] text-[#C00000]">
                  {pwErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="mt-4">
              <CbiButton type="submit">Reset Password</CbiButton>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-4 flex items-center gap-1 px-1 text-[13px] text-[#000F32] active:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          </form>
        )}

        {/* ---------- Success ---------- */}
        {step === 4 && (
          <div>
            <div className="cbi-card px-4 py-8">
              <CircleCheckBig className="mx-auto h-12 w-12 text-[#7A1F3D]" aria-hidden="true" />
              <p className="mt-3 text-center text-[13.5px] font-bold leading-relaxed text-[#595959]">
                Password reset successful.
              </p>
              <p className="mt-1.5 text-center text-[12.5px] leading-relaxed text-[#7F7F7F]">
                You can now log in with your new password.
              </p>
            </div>
            <div className="mt-4">
              <CbiButton onClick={onBack}>Back to Login</CbiButton>
            </div>
          </div>
        )}
      </div>

      {/* Back bar pinned at bottom like CBI sub-pages */}
      <div className="shrink-0 bg-[#000F32]">
        <button
          onClick={onBack}
          className="flex h-[44px] w-full items-center justify-center gap-2 text-[13.5px] font-medium text-white active:bg-white/10"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
