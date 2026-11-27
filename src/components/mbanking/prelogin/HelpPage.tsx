"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { CBI_CONTACT, CBI_FAQS } from "@/lib/mbanking/cbi-data";

/** Pre-login full screen — Help & FAQs over CBI customer-support topics. */
export function HelpPage({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  /** Index of the open FAQ (default: first item). */
  const [openIdx, setOpenIdx] = useState<number>(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = CBI_FAQS.map((item, idx) => ({ item, idx }));
    if (!q) return all;
    return all.filter(({ item }) => item.q.toLowerCase().includes(q));
  }, [query]);

  const toggle = (idx: number) => setOpenIdx((cur) => (cur === idx ? -1 : idx));

  return (
    <div className="cbi-slide-in fixed inset-0 z-[210] flex flex-col bg-[#F7F7F7]">
      {/* Navy header bar */}
      <div className="flex h-[64px] shrink-0 items-center justify-between bg-[#000F32] px-4">
        <div className="flex flex-col gap-[4px]" aria-hidden="true">
          <span className="block h-[2.5px] w-[22px] bg-white/90" />
          <span className="block h-[2.5px] w-[22px] bg-white/90" />
          <span className="block h-[2.5px] w-[22px] bg-white/90" />
        </div>
        <h1 className="truncate text-[16px] font-normal text-white">Help &amp; FAQs</h1>
      </div>

      {/* FAQ search */}
      <div className="shrink-0 bg-white px-3 py-2.5">
        <div className="flex items-center gap-2 border-b-2 border-[#E8306E] pb-2">
          <Search className="h-4 w-4 shrink-0 text-[#7A1F3D]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs"
            className="w-full border-0 bg-transparent text-[15px] text-[#222] outline-none placeholder:text-[#C4C4C4]"
            aria-label="Search FAQs"
          />
        </div>
      </div>

      {/* Accordion FAQ list */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-40 pt-3">
        <p className="px-1 pb-2 text-[11.5px] text-[#7F7F7F]">
          {results.length} question{results.length === 1 ? "" : "s"}
        </p>
        {results.map(({ item, idx }) => (
          <div key={idx} className="cbi-card mb-2 px-3 py-3">
            <button
              onClick={() => toggle(idx)}
              className="flex w-full items-start justify-between gap-2 text-left"
              aria-expanded={openIdx === idx}
            >
              <span className="text-[13.5px] font-bold leading-snug text-[#595959]">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 text-[#333333] transition-transform",
                  openIdx === idx && "rotate-180"
                )}
              />
            </button>
            {openIdx === idx && (
              <p className="mt-2 border-t border-[#E0E0E0] pt-2 text-[12.5px] leading-relaxed text-[#7F7F7F]">
                {item.a}
              </p>
            )}
          </div>
        ))}
        {results.length === 0 && (
          <div className="cbi-card px-4 py-8 text-center text-[12.5px] text-[#9E9E9E]">
            No FAQs match your search.
          </div>
        )}

        {/* Still need help? */}
        <div className="cbi-card mt-1 px-3 py-3">
          <p className="text-[15px] font-bold text-[#595959]">Still need help?</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <a
              href={`tel:${CBI_CONTACT.withinUae}`}
              className="flex flex-col items-center gap-0.5 border border-[#1565C0] py-2.5 active:bg-[#F0F6FC]"
            >
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#1565C0]">
                <Phone className="h-3.5 w-3.5" />
                {CBI_CONTACT.withinUae}
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#7F7F7F]">
                Within UAE
              </span>
            </a>
            <a
              href={`tel:${CBI_CONTACT.outsideUae.replace(/\s/g, "")}`}
              className="cbi-btn-blue flex flex-col items-center gap-0.5 py-2.5 text-white"
            >
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-white">
                <Phone className="h-3.5 w-3.5" />
                {CBI_CONTACT.outsideUae}
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-white/80">
                Outside UAE
              </span>
            </a>
          </div>
          <p className="mt-2.5 px-1 text-[11.5px] leading-relaxed text-[#7F7F7F]">
            Call center available 24/7. Alternatively, write to {CBI_CONTACT.email}.
          </p>
        </div>
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
