"use client";

import { useState } from "react";
import { ChevronLeft, CircleCheckBig, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { CbiButton } from "../cbi";
import { toast } from "@/lib/mbanking/toast";
import { CBI_CONTACT } from "@/lib/mbanking/cbi-data";

type Channel = "mobile" | "email";

/** Pre-login full screen — Forgot Username recovery request. */
export function ForgotUsernamePage({ onBack }: { onBack: () => void }) {
  const [channel, setChannel] = useState<Channel>("mobile");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const switchChannel = (next: Channel) => {
    setChannel(next);
    setValue("");
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError(
        channel === "mobile"
          ? "Enter your registered mobile number."
          : "Enter your registered email address."
      );
      return;
    }
    setError(null);
    setSent(true);
    toast("Username recovery requested", "success");
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
        <h1 className="truncate text-[16px] font-normal text-white">Forgot Username?</h1>
      </div>

      {/* Recovery request */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-40 pt-3">
        {sent ? (
          <div className="cbi-card px-4 py-8">
            <CircleCheckBig className="mx-auto h-12 w-12 text-[#7A1F3D]" aria-hidden="true" />
            <p className="mt-3 text-center text-[13.5px] font-bold leading-relaxed text-[#595959]">
              Your username will be sent to your registered contact details shortly.
            </p>
            <p className="mt-2 text-center text-[11.5px] leading-relaxed text-[#7F7F7F]">
              If you do not receive it within 5 minutes, call {CBI_CONTACT.withinUae}.
            </p>
            <div className="mt-5">
              <CbiButton onClick={onBack}>Back to Login</CbiButton>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="cbi-card px-4 pb-5 pt-4">
              <p className="text-[15px] font-bold text-[#595959]">Recover your username</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#7F7F7F]">
                Choose where the username should be sent.
              </p>

              {/* Channel radio choice */}
              <div className="mt-3 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => switchChannel("mobile")}
                  className="flex items-center gap-2.5 py-1.5 text-left"
                  aria-pressed={channel === "mobile"}
                >
                  <span
                    className={cn(
                      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2",
                      channel === "mobile" ? "border-[#E8306E]" : "border-[#B5B5B5]"
                    )}
                  >
                    {channel === "mobile" && (
                      <span className="h-2 w-2 rounded-full bg-[#E8306E]" />
                    )}
                  </span>
                  <span className="text-[13.5px] text-[#595959]">
                    Send to registered mobile
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => switchChannel("email")}
                  className="flex items-center gap-2.5 py-1.5 text-left"
                  aria-pressed={channel === "email"}
                >
                  <span
                    className={cn(
                      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2",
                      channel === "email" ? "border-[#E8306E]" : "border-[#B5B5B5]"
                    )}
                  >
                    {channel === "email" && (
                      <span className="h-2 w-2 rounded-full bg-[#E8306E]" />
                    )}
                  </span>
                  <span className="text-[13.5px] text-[#595959]">
                    Send to registered email
                  </span>
                </button>
              </div>

              {/* Single value input for the chosen channel */}
              {channel === "mobile" ? (
                <div className="mt-4">
                  <label className="text-[13px] font-medium text-[#E8306E]">
                    Registered Mobile Number
                  </label>
                  <div className="mt-2 flex items-baseline gap-2 border-b-2 border-[#E8306E] pb-2">
                    <span className="text-[15px] font-bold text-[#595959]">+971</span>
                    <input
                      inputMode="numeric"
                      value={value}
                      onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
                      className="w-full border-0 bg-transparent text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                      placeholder="5X XXX XXXX"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="text-[13px] font-medium text-[#E8306E]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                    placeholder="Enter your registered email"
                  />
                </div>
              )}
              {error && <p className="mt-2 text-[11px] text-[#C00000]">{error}</p>}

              {/* Captcha-style security note */}
              <div className="mt-4 flex items-center gap-2 border border-[#E0E0E0] bg-[#FAFAFA] px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#7A1F3D]" />
                <span className="text-[11.5px] leading-relaxed text-[#595959]">
                  For security, verification is required
                </span>
              </div>
            </div>

            <div className="mt-4">
              <CbiButton type="submit">Submit Request</CbiButton>
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
