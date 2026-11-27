"use client";

import { useState } from "react";
import {
  Plus,
  Wifi,
  CreditCard,
  Lock,
  Snowflake,
  SlidersHorizontal,
  Eye,
  ChevronRight,
  ScanFace,
  Check,
  X,
} from "lucide-react";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import { formatEUR } from "@/lib/mbanking/format";
import { SpendingLimitsModal } from "../SpendingLimitsModal";
import { CbiLogo, CbiSectionTitle, HexagonIcon } from "../cbi";
import type { CardInfo } from "@/lib/mbanking/types";

export function CardsTab() {
  const cards = useMbanking((s) => s.cards);
  const toggleCardFreeze = useMbanking((s) => s.toggleCardFreeze);
  const physical = cards.find((c) => c.kind === "physical")!;
  const virtual = cards.find((c) => c.kind === "virtual")!;

  const [limitsCard, setLimitsCard] = useState<CardInfo | null>(null);
  const [revealCard, setRevealCard] = useState<CardInfo | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const startReveal = (card: CardInfo) => {
    setRevealCard(card);
    setRevealed(false);
    setVerifying(true);
    // Simulate biometric scan (in production this would call WebAuthn).
    setTimeout(() => {
      setVerifying(false);
      setRevealed(true);
      toast("Identity verified. Card details revealed.", "success");
    }, 1200);
  };

  return (
    <div className="fade-in flex flex-col gap-3 p-3 pb-5">
      <div className="flex items-center justify-between">
        <CbiSectionTitle>Corporate Cards</CbiSectionTitle>
        <button
          onClick={() => toast("Card issuance request sent", "info")}
          className="cbi-card flex h-9 w-9 shrink-0 items-center justify-center active:opacity-70"
          aria-label="Add card"
        >
          <Plus className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
        </button>
      </div>

      {/* Physical card — navy gradient, 10px radius max */}
      <div
        className={cn(
          "premium-navy-card relative flex h-52 flex-col justify-between overflow-hidden rounded-[10px] border border-[#0A1A2E] p-5 text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
          physical.frozen && "opacity-60 saturate-0"
        )}
      >
        {physical.frozen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#000F32]/60">
            <div className="flex items-center gap-2 border border-white/70 px-4 py-2">
              <Snowflake className="h-4 w-4 text-white" strokeWidth={1.8} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                Frozen
              </span>
            </div>
          </div>
        )}

        <div className="relative z-10 flex items-start justify-between">
          <CbiLogo height={15} wordmarkColor="#FFFFFF" />
          <Wifi
            className="h-5 w-5 rotate-90 text-white/70"
            strokeWidth={1.6}
          />
        </div>

        <div className="relative z-10 h-8 w-12 overflow-hidden bg-[#C8A96A]">
          <div className="absolute left-[30%] top-0 h-full w-[1px] bg-[#8A6D3B]" />
          <div className="absolute left-[70%] top-0 h-full w-[1px] bg-[#8A6D3B]" />
          <div className="absolute top-[40%] h-[1px] w-full bg-[#8A6D3B]" />
          <div className="absolute top-[60%] h-[1px] w-full bg-[#8A6D3B]" />
        </div>

        <div className="relative z-10">
          <p className="font-mono text-[16px] font-bold tracking-[0.12em] text-white">
            {physical.number}
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
              {physical.label}
            </p>
            <p className="mt-0.5 text-[13px] font-bold tracking-[0.08em] text-white">
              {physical.holder}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
                Exp
              </p>
              <p className="font-mono text-[13px] font-bold text-white">
                {physical.exp}
              </p>
            </div>
            <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-full bg-[#C41F30]/80" />
              <div className="h-7 w-7 rounded-full bg-[#C8A96A]/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Virtual card — flat white row */}
      <div
        className={cn(
          "cbi-card flex items-center justify-between px-3 py-3",
          virtual.frozen && "opacity-60 saturate-0"
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <HexagonIcon width={40}>
            <CreditCard className="h-[15px] w-[15px]" strokeWidth={1.8} />
          </HexagonIcon>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#333333]">
              {virtual.label}
            </p>
            <p className="mt-0.5 font-mono text-[11.5px] text-[#7F7F7F]">
              **** {virtual.number.slice(-4)} · Exp {virtual.exp}
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            toast(`Virtual card ••${virtual.number.slice(-4)} details`, "info")
          }
          className="ml-3 shrink-0 py-2.5 pl-3 pr-1 text-[12px] font-bold uppercase tracking-[0.08em] text-[#1565C0] active:opacity-70"
        >
          Details
        </button>
      </div>

      {/* Card controls — flat white list with hairline separators */}
      <div className="cbi-card">
        {/* Freeze physical */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-3 py-2.5">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 shrink-0 text-[#7A1F3D]" strokeWidth={1.8} />
            <div>
              <p className="text-[13px] font-bold text-[#333333]">
                Freeze Physical Card
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#7F7F7F]">
                Block all POS and ATM usage
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={physical.frozen}
            onChange={() => {
              toggleCardFreeze(physical.id);
              toast(
                physical.frozen ? "Card unfrozen — active." : "Card frozen securely.",
                physical.frozen ? "success" : "info"
              );
            }}
          />
        </div>

        {/* Freeze virtual */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-3 py-2.5">
          <div className="flex items-center gap-3">
            <Snowflake
              className="h-5 w-5 shrink-0 text-[#7A1F3D]"
              strokeWidth={1.8}
            />
            <div>
              <p className="text-[13px] font-bold text-[#333333]">
                Freeze Virtual Card
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#7F7F7F]">
                Pause online spending instantly
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={virtual.frozen}
            onChange={() => {
              toggleCardFreeze(virtual.id);
              toast(
                virtual.frozen ? "Virtual card unfrozen." : "Virtual card frozen.",
                virtual.frozen ? "success" : "info"
              );
            }}
          />
        </div>

        {/* Spending limits */}
        <button
          onClick={() => setLimitsCard(physical)}
          className="flex min-h-[56px] w-full items-center justify-between border-b border-[#E5E5E5] px-3 py-2.5 text-left active:opacity-70"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal
              className="h-5 w-5 shrink-0 text-[#7A1F3D]"
              strokeWidth={1.8}
            />
            <div>
              <p className="text-[13px] font-bold text-[#333333]">
                Spending Limits
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#7F7F7F]">
                {formatEUR(physical.daily_limit)} daily /{" "}
                {formatEUR(physical.monthly_limit)} monthly
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#8C8C8C]" />
        </button>

        {/* Reveal PIN */}
        <button
          onClick={() => startReveal(physical)}
          className="flex min-h-[56px] w-full items-center justify-between px-3 py-2.5 text-left active:opacity-70"
        >
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 shrink-0 text-[#7A1F3D]" strokeWidth={1.8} />
            <div>
              <p className="text-[13px] font-bold text-[#333333]">
                Reveal PIN &amp; Details
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#7F7F7F]">
                Secure biometric check
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#8C8C8C]" />
        </button>
      </div>

      {/* Spending limits modal */}
      {limitsCard && (
        <SpendingLimitsModal
          card={limitsCard}
          onClose={() => setLimitsCard(null)}
        />
      )}

      {/* Card reveal modal (biometric-gated) */}
      {revealCard && (
        <RevealCardModal
          card={revealCard}
          verifying={verifying}
          revealed={revealed}
          onClose={() => {
            setRevealCard(null);
            setRevealed(false);
          }}
        />
      )}
    </div>
  );
}

/** Biometric-gated card details reveal modal — flat white, magenta header strip. */
function RevealCardModal({
  card,
  verifying,
  revealed,
  onClose,
}: {
  card: CardInfo;
  verifying: boolean;
  revealed: boolean;
  onClose: () => void;
}) {
  // Demo: a simulated PIN derived from the card number (last 4 + middle 2).
  const pin = `${card.number.replace(/\s/g, "").slice(-4)}`
    .split("")
    .map((d, i) => (i % 2 === 0 ? d : "•"))
    .join("");
  const cvv = card.number.replace(/\s/g, "").slice(-3);

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-[#000F32]/60 px-4"
      onClick={onClose}
    >
      <div
        className="fade-in max-h-[88vh] w-full max-w-md overflow-y-auto hide-scrollbar bg-white shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-[48px] items-center justify-between bg-[#82134C] px-3">
          <div>
            <h2 className="text-[15px] font-bold text-white">Card Details</h2>
            <p className="text-[11px] text-white/80">{card.label}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center text-white active:opacity-70"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-4 py-3">
          {verifying ? (
            <div className="flex flex-col items-center py-8">
              <HexagonIcon width={72}>
                <ScanFace className="h-8 w-8 animate-pulse" strokeWidth={1.4} />
              </HexagonIcon>
              <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.15em] text-[#7F7F7F]">
                Scanning biometrics…
              </p>
              <p className="mt-1 text-[11px] text-[#8C8C8C]">
                Look at the camera / touch the sensor
              </p>
            </div>
          ) : revealed ? (
            <div className="flex flex-col">
              <DetailRow label="Card Number" value={card.number} mono />
              <DetailRow label="PIN" value={pin} mono />
              <DetailRow label="CVV" value={cvv} mono />
              <DetailRow label="Expiry · Holder" value={`${card.exp} · ${card.holder}`} />
              <div className="mb-1 mt-3 flex items-center gap-2 border border-[#217A3B]/40 px-3 py-2 text-[11.5px] text-[#217A3B]">
                <Check className="h-4 w-4 shrink-0" strokeWidth={2} />
                Identity verified — details will hide when you close this.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Flat label-left / value-right row with hairline separator. */
function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#E5E5E5] py-2.5 last:border-b-0">
      <span className="shrink-0 text-[12px] text-[#7F7F7F]">{label}</span>
      <span
        className={cn(
          "text-[13px] font-bold text-[#222222]",
          mono && "font-mono tracking-[0.15em]"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "active-scale relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        checked ? "bg-[#1565C0]" : "bg-[#D9D9D9]"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full border bg-white shadow transition-transform",
          checked ? "translate-x-6 border-[#0D2B6B]" : "translate-x-1 border-[#BFBFBF]"
        )}
      />
    </button>
  );
}
