"use client";

import { useMemo, useState } from "react";
import { MapPin, Phone, Clock, Navigation, Building2, Banknote } from "lucide-react";
import { CBI_LOCATIONS, type BranchLocation } from "@/lib/mbanking/cbi-data";

type Filter = "all" | "branch" | "atm";

const EMIRATES = ["All", "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ras Al Khaimah"] as const;

/** Pre-login full screen — Branch & ATM locator with the official CBI network. */
export function BranchAtmPage({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [emirate, setEmirate] = useState<(typeof EMIRATES)[number]>("All");

  const list = useMemo(() => {
    let l = CBI_LOCATIONS;
    if (filter === "branch") l = l.filter((x) => x.isBranch);
    if (filter === "atm") l = l.filter((x) => x.hasAtm || x.hasCcdm);
    if (emirate !== "All") l = l.filter((x) => x.emirate === emirate);
    return l;
  }, [filter, emirate]);

  return (
    <div className="cbi-slide-in fixed inset-0 z-[210] flex flex-col bg-[#F7F7F7]">
      {/* Navy header bar */}
      <div className="flex h-[64px] shrink-0 items-center justify-between bg-[#000F32] px-4">
        <div className="flex flex-col gap-[4px]" aria-hidden="true">
          <span className="block h-[2.5px] w-[22px] bg-white/90" />
          <span className="block h-[2.5px] w-[22px] bg-white/90" />
          <span className="block h-[2.5px] w-[22px] bg-white/90" />
        </div>
        <h1 className="truncate text-[16px] font-normal text-white">Branch &amp; ATM</h1>
      </div>

      {/* Type filter — CBI blue segmented buttons */}
      <div className="shrink-0 bg-white px-3 py-2.5">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "all", label: "All" },
              { id: "branch", label: "Branches" },
              { id: "atm", label: "ATMs" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={
                filter === f.id
                  ? "cbi-btn-blue py-2.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-white"
                  : "border border-[#1565C0] bg-white py-2.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-[#1565C0] active:bg-[#F0F6FC]"
              }
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* Emirate chips */}
        <div className="hide-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
          {EMIRATES.map((e) => (
            <button
              key={e}
              onClick={() => setEmirate(e)}
              className={
                emirate === e
                  ? "whitespace-nowrap rounded-full bg-[#000F32] px-3 py-1.5 text-[11.5px] font-medium text-white"
                  : "whitespace-nowrap rounded-full border border-[#D9D9D9] bg-white px-3 py-1.5 text-[11.5px] text-[#595959] active:bg-[#F5F5F5]"
              }
            >
              {e === "All" ? "All Emirates" : e}
            </button>
          ))}
        </div>
      </div>

      {/* Location list */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-40 pt-3">
        <p className="px-1 pb-2 text-[11.5px] text-[#7F7F7F]">
          {list.length} location{list.length === 1 ? "" : "s"} · CBI network
        </p>
        {list.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
        {list.length === 0 && (
          <div className="cbi-card px-4 py-8 text-center text-[12.5px] text-[#9E9E9E]">
            No locations match this filter.
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

function LocationCard({ loc }: { loc: BranchLocation }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
  const telUrl = `tel:${loc.phone.replace(/\s/g, "")}`;

  return (
    <div className="cbi-card mb-2 px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[14px] font-bold leading-snug text-[#595959]">{loc.name}</p>
        <span className="shrink-0 rounded-[3px] bg-[#000F32] px-1.5 py-[3px] text-[9.5px] font-bold uppercase tracking-[0.06em] text-white">
          {loc.emirate}
        </span>
      </div>

      {/* Facility badges */}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {loc.isBranch && (
          <Badge icon={<Building2 className="h-3 w-3" />} label="Branch" />
        )}
        {loc.hasAtm && <Badge icon={<Banknote className="h-3 w-3" />} label="ATM" />}
        {loc.hasCcdm && <Badge icon={<Banknote className="h-3 w-3" />} label="Cash Deposit" />}
        {loc.alwaysOpen && (
          <Badge icon={<Clock className="h-3 w-3" />} label="24/7" />
        )}
      </div>

      <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-[#7F7F7F]">
        <MapPin className="mt-[1px] h-3.5 w-3.5 shrink-0 text-[#7A1F3D]" />
        {loc.address}
      </p>

      <div className="mt-1.5 flex items-start gap-1.5 text-[12px] text-[#7F7F7F]">
        <Clock className="mt-[1px] h-3.5 w-3.5 shrink-0 text-[#7A1F3D]" />
        <span>
          {loc.hours} (Mon–Thu &amp; Sat)
          {!loc.alwaysOpen && (
            <span className="text-[#595959]"> · Fri {loc.friday}</span>
          )}
        </span>
      </div>

      {loc.note && (
        <p className="mt-1.5 px-1 text-[11px] italic text-[#9E9E9E]">{loc.note}</p>
      )}

      {/* Actions: call + directions */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={telUrl}
          className="flex items-center justify-center gap-1.5 border border-[#1565C0] py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[#1565C0] active:bg-[#F0F6FC]"
        >
          <Phone className="h-3.5 w-3.5" />
          Call
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cbi-btn-blue flex items-center justify-center gap-1.5 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-white"
        >
          <Navigation className="h-3.5 w-3.5" />
          Directions
        </a>
      </div>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-[3px] border border-[#E0E0E0] bg-[#FAFAFA] px-1.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.05em] text-[#595959]">
      {icon}
      {label}
    </span>
  );
}
