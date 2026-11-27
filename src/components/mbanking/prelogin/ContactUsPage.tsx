"use client";

import { useState } from "react";
import { Phone, Mail, ChevronRight, ChevronDown, Check } from "lucide-react";
import { CbiButton } from "../cbi";
import { toast } from "@/lib/mbanking/toast";
import { CBI_CONTACT } from "@/lib/mbanking/cbi-data";

const PREFERRED_TIMES = ["Morning", "Afternoon", "Evening"] as const;

/** Pre-login full screen — Contact Us with the official CBI channels. */
export function ContactUsPage({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [time, setTime] = useState<(typeof PREFERRED_TIMES)[number]>("Morning");
  const [sent, setSent] = useState(false);

  const submitCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;
    setSent(true);
    toast("Callback request submitted", "success");
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
        <h1 className="truncate text-[16px] font-normal text-white">Contact Us</h1>
      </div>

      {/* Contact channels + callback request */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-40 pt-3">
        {/* Call CBI */}
        <div className="cbi-card mb-2 px-3 py-3">
          <p className="text-[15px] font-bold text-[#595959]">Call CBI</p>
          <a
            href={`tel:${CBI_CONTACT.withinUae}`}
            className="mt-1 flex items-center justify-between gap-2 border-b border-[#E0E0E0] py-2.5 active:opacity-70"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E0E0E0] bg-[#FAFAFA]">
                <Phone className="h-4 w-4 text-[#7A1F3D]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] text-[#7F7F7F]">Within UAE</span>
                <span className="block text-[15px] font-bold text-[#222]">
                  {CBI_CONTACT.withinUae}
                </span>
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#8C8C8C]" />
          </a>
          <a
            href={`tel:${CBI_CONTACT.outsideUae.replace(/\s/g, "")}`}
            className="flex items-center justify-between gap-2 py-2.5 active:opacity-70"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E0E0E0] bg-[#FAFAFA]">
                <Phone className="h-4 w-4 text-[#7A1F3D]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] text-[#7F7F7F]">Outside UAE</span>
                <span className="block text-[15px] font-bold text-[#222]">
                  {CBI_CONTACT.outsideUae}
                </span>
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#8C8C8C]" />
          </a>
        </div>

        {/* Email */}
        <div className="cbi-card mb-2 px-3 py-3">
          <p className="text-[15px] font-bold text-[#595959]">Email</p>
          <a
            href={`mailto:${CBI_CONTACT.email}`}
            className="mt-1 flex items-center justify-between gap-2 py-2.5 active:opacity-70"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E0E0E0] bg-[#FAFAFA]">
                <Mail className="h-4 w-4 text-[#7A1F3D]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] text-[#7F7F7F]">Customer Care</span>
                <span className="block truncate text-[14.5px] font-bold text-[#222]">
                  {CBI_CONTACT.email}
                </span>
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#8C8C8C]" />
          </a>
        </div>

        {/* Request a callback */}
        <div className="cbi-card mb-2 px-4 pb-5 pt-4">
          <p className="text-[15px] font-bold text-[#595959]">Request a callback</p>
          {sent ? (
            <div className="mt-3 border border-[#E0E0E0] bg-[#FAFAFA] px-3 py-3">
              <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#595959]">
                <Check className="mt-[2px] h-4 w-4 shrink-0 text-[#7A1F3D]" />
                Your callback request has been received. Our team will contact you during
                your preferred time.
              </p>
            </div>
          ) : (
            <form onSubmit={submitCallback}>
              <label className="text-[13px] font-medium text-[#E8306E]">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-[#E8306E] bg-transparent pb-2 text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
                placeholder="Enter your full name"
              />

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

              <label className="mt-4 block text-[13px] font-medium text-[#E8306E]">
                Preferred Time
              </label>
              <div className="relative mt-2 border-b-2 border-[#E8306E] pb-2">
                <select
                  value={time}
                  onChange={(e) =>
                    setTime(e.target.value as (typeof PREFERRED_TIMES)[number])
                  }
                  className="w-full appearance-none border-0 bg-transparent pb-0.5 pr-6 text-[15px] text-[#222] outline-none"
                  aria-label="Preferred time"
                >
                  {PREFERRED_TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-[3px] h-4 w-4 text-[#595959]" />
              </div>

              <div className="mt-5">
                <CbiButton type="submit" disabled={!name.trim() || !mobile.trim()}>
                  Arrange Callback
                </CbiButton>
              </div>
            </form>
          )}
        </div>

        {/* Response commitment */}
        <p className="px-1 pt-1 text-[11.5px] leading-relaxed text-[#7F7F7F]">
          {CBI_CONTACT.responseNote}
        </p>
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
