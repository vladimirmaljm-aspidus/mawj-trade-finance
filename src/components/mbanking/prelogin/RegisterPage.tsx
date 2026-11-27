"use client";

import { useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  CircleCheckBig,
  User,
  Smartphone,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CbiButton } from "../cbi";
import { toast } from "@/lib/mbanking/toast";

type Step = 1 | 2 | 3 | 4;
type AccountType = "individual" | "corporate";

const STEP_NAMES: Record<1 | 2 | 3, string> = {
  1: "Eligibility",
  2: "Account Details",
  3: "Verify",
};

/** Pre-login full screen — CBI Mobile Banking registration wizard. */
export function RegisterPage({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [agreed, setAgreed] = useState(false);

  // Step 2 — account details
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [accountNo, setAccountNo] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [tradeLicence, setTradeLicence] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 3 — OTP (demo: any 6 digits are accepted)
  const [otp, setOtp] = useState<string[]>(Array<string>(6).fill(""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const otpComplete = otp.every((d) => d !== "");

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

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!accountNo.trim()) errs.accountNo = "Account Number is required.";
    if (!fullName.trim()) errs.fullName = "Full Name is required.";
    if (!mobile.trim()) errs.mobile = "Registered Mobile is required.";
    if (!email.trim()) errs.email = "Email is required.";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(3);
  };

  const submitVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpComplete) return;
    setStep(4);
    toast("Registration received", "success");
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
        <h1 className="truncate text-[16px] font-normal text-white">Register</h1>
      </div>

      {/* Wizard steps */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-40 pt-3">
        {step < 4 && (
          <p className="px-1 pb-2 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#7F7F7F]">
            Step {step} of 3 · {STEP_NAMES[step]}
          </p>
        )}

        {/* ---------- Step 1 — Eligibility ---------- */}
        {step === 1 && (
          <div>
            <div className="cbi-card px-3 py-3">
              <p className="text-[15px] font-bold text-[#595959]">Before you register</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#7F7F7F]">
                To register for CBI Mobile Banking you will need:
              </p>
              <ul className="mt-2.5 flex flex-col gap-2">
                <li className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#595959]">
                  <User className="mt-[1px] h-3.5 w-3.5 shrink-0 text-[#7A1F3D]" />
                  An active CBI account
                </li>
                <li className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#595959]">
                  <Smartphone className="mt-[1px] h-3.5 w-3.5 shrink-0 text-[#7A1F3D]" />
                  A mobile number registered with the bank
                </li>
                <li className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#595959]">
                  <ShieldCheck className="mt-[1px] h-3.5 w-3.5 shrink-0 text-[#7A1F3D]" />
                  Emirates ID for individuals
                </li>
                <li className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#595959]">
                  <Building2 className="mt-[1px] h-3.5 w-3.5 shrink-0 text-[#7A1F3D]" />
                  Trade licence for corporates
                </li>
              </ul>
              <p className="mt-2.5 border-t border-[#E0E0E0] pt-2.5 text-[11.5px] leading-relaxed text-[#7F7F7F]">
                Corporate registrations also require an authorised signatory nomination.
              </p>
            </div>

            <div className="cbi-card mt-2 px-3 py-3">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className="flex items-start gap-2.5 text-left active:opacity-70"
                aria-pressed={agreed}
              >
                <span
                  className={cn(
                    "mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center border-2",
                    agreed ? "border-[#000F32] bg-[#000F32]" : "border-[#B5B5B5] bg-white"
                  )}
                >
                  {agreed && <Check className="h-3 w-3 text-white" />}
                </span>
                <span className="text-[12.5px] leading-relaxed text-[#595959]">
                  I confirm I hold an active CBI account and accept the Terms &amp;
                  Conditions
                </span>
              </button>
              <div className="mt-4">
                <CbiButton onClick={() => setStep(2)} disabled={!agreed}>
                  Next
                </CbiButton>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Step 2 — Account Details ---------- */}
        {step === 2 && (
          <form onSubmit={submitDetails}>
            <div className="cbi-card px-4 pb-5 pt-4">
              <p className="text-[15px] font-bold text-[#595959]">Account Details</p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "individual", label: "Individual" },
                    { id: "corporate", label: "Corporate" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAccountType(t.id)}
                    className={
                      accountType === t.id
                        ? "cbi-btn-blue py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-white"
                        : "border border-[#1565C0] bg-white py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#1565C0] active:bg-[#F0F6FC]"
                    }
                    aria-pressed={accountType === t.id}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-[13px] font-medium text-[#E8306E]">
                Account Number
              </label>
              <input
                inputMode="numeric"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ""))}
                className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                placeholder="Enter your CBI account number"
              />
              {errors.accountNo && (
                <p className="mt-1 text-[11px] text-[#C00000]">{errors.accountNo}</p>
              )}

              <label className="mt-4 block text-[13px] font-medium text-[#E8306E]">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                placeholder="As registered with the bank"
              />
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-[#C00000]">{errors.fullName}</p>
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

              <label className="mt-4 block text-[13px] font-medium text-[#E8306E]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-[#C00000]">{errors.email}</p>
              )}

              {accountType === "corporate" && (
                <>
                  <label className="mt-4 block text-[13px] font-medium text-[#E8306E]">
                    Trade Licence No{" "}
                    <span className="font-normal text-[#9E9E9E]">(optional)</span>
                  </label>
                  <input
                    value={tradeLicence}
                    onChange={(e) => setTradeLicence(e.target.value)}
                    className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                    placeholder="Corporate trade licence number"
                  />
                </>
              )}
            </div>

            <div className="mt-4">
              <CbiButton type="submit">Next</CbiButton>
            </div>
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setStep(1);
              }}
              className="mt-4 flex items-center gap-1 px-1 text-[13px] text-[#000F32] active:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          </form>
        )}

        {/* ---------- Step 3 — Verify (OTP) ---------- */}
        {step === 3 && (
          <form onSubmit={submitVerify}>
            <div className="cbi-card px-4 pb-5 pt-4">
              <p className="text-[15px] font-bold text-[#595959]">Verify</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#7F7F7F]">
                An OTP has been sent to your registered mobile number ending with
                ••••. Enter the 6-digit code to complete your registration.
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
                Verify &amp; Register
              </CbiButton>
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

        {/* ---------- Step 4 — Success ---------- */}
        {step === 4 && (
          <div>
            <div className="cbi-card px-4 py-8">
              <CircleCheckBig className="mx-auto h-14 w-14 text-[#7A1F3D]" aria-hidden="true" />
              <p className="mt-3 text-center text-[14px] font-bold text-[#595959]">
                Registration received.
              </p>
              <p className="mt-1.5 text-center text-[12.5px] leading-relaxed text-[#7F7F7F]">
                Your CBI Mobile Banking profile will be activated within 1 business day.
                Confirmation will be sent to your registered email.
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
