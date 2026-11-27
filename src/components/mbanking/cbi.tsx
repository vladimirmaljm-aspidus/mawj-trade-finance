"use client";

import { type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   CBI (Commercial Bank International) — authentic design primitives.
   Replicates the real CBI mobile banking app look:
   navy→magenta gradient header, white pennant ribbon, hexagon
   outline icons, magenta accordion ribbons, flat white cards,
   hairline #D9D9D9 borders, sharp corners, blue gradient buttons.
   ============================================================ */

/* ---------- Brand constants ---------- */
export const CBI = {
  navy: "#000F32",
  navyLogo: "#001C5C",
  magenta: "#70024D",
  magentaRibbon: "#82134C",
  maroonIcon: "#7A1F3D",
  pinkAccent: "#E8306E",
  btnBlueTop: "#1565C0",
  btnBlueBottom: "#0D2B6B",
  hairline: "#D9D9D9",
  titleGray: "#595959",
  labelGray: "#7F7F7F",
  bodyGray: "#F7F7F7",
};

/* ---------- Logo: 8-spoke starburst + "CBI" wordmark ---------- */
const SPOKE_COLORS = [
  "#1F3A7A", // up
  "#2E5FA3", // upper-right
  "#B01E2E", // right
  "#8FA3C0", // lower-right
  "#16295E", // down
  "#2E5FA3", // lower-left
  "#C41F30", // left
  "#9AA8BE", // upper-left
];

export function CbiStarburst({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-30 -30 60 60"
      aria-hidden="true"
      role="presentation"
    >
      {SPOKE_COLORS.map((color, i) => (
        <path
          key={i}
          d="M -3.4 -7.5 L 3.4 -7.5 L 0 -27 Z"
          fill={color}
          transform={`rotate(${i * 45})`}
        />
      ))}
    </svg>
  );
}

export function CbiLogo({
  height = 24,
  withWordmark = true,
  wordmarkColor = CBI.navyLogo,
}: {
  height?: number;
  withWordmark?: boolean;
  wordmarkColor?: string;
}) {
  return (
    <span className="flex items-center gap-[5px] select-none">
      <CbiStarburst size={height} />
      {withWordmark && (
        <span
          className="font-bold leading-none tracking-tight"
          style={{ color: wordmarkColor, fontSize: height * 1.35 }}
        >
          CBI
        </span>
      )}
    </span>
  );
}

/* ---------- Gradient header with white pennant ribbon ---------- */
export function CbiHeader({
  title,
  onMenu,
  onBack,
  right,
}: {
  title: string;
  onMenu?: () => void;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="cbi-header-gradient relative flex h-[64px] shrink-0 items-stretch">
      {/* Pennant ribbon (white, pointed right tip) */}
      <div className="relative flex w-[58%] items-center">
        <div className="cbi-pennant relative flex h-full items-center gap-3 bg-white pl-4">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6 text-[#000F32]" />
            </button>
          ) : (
            <button
              onClick={onMenu}
              className="flex h-9 w-9 flex-col items-start justify-center gap-[4px]"
              aria-label="Menu"
            >
              <span className="block h-[2.5px] w-[22px] bg-[#000F32]" />
              <span className="block h-[2.5px] w-[22px] bg-[#000F32]" />
              <span className="block h-[2.5px] w-[22px] bg-[#000F32]" />
            </button>
          )}
          <CbiLogo height={22} />
        </div>
      </div>
      {/* Right-aligned screen title */}
      <div className="ml-auto flex items-center gap-2 pr-4">
        {right}
        <h1 className="truncate text-[16px] font-normal leading-tight text-white">{title}</h1>
      </div>
    </header>
  );
}

/* ---------- Navy back bar ("‹ Back" | step indicator) ---------- */
export function CbiBackBar({
  onBack,
  backLabel = "Back",
  right,
}: {
  onBack: () => void;
  backLabel?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex h-[40px] shrink-0 items-center justify-between bg-[#000F32] px-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 py-2 text-[13px] text-white active:opacity-70"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </button>
      {right && <div className="text-[12px] text-white">{right}</div>}
    </div>
  );
}

/* ---------- Gradient copyright footer ---------- */
export function CbiFooter({ note = "Copyright © 2021 CBI" }: { note?: string }) {
  return (
    <footer className="cbi-footer-gradient flex h-[36px] shrink-0 items-center px-4">
      <p className="text-[11px] text-white">{note}</p>
    </footer>
  );
}

/* ---------- Elongated hexagon outline (maroon) with inner icon ---------- */
export function HexagonIcon({
  children,
  width = 96,
}: {
  children: ReactNode;
  width?: number;
}) {
  const h = Math.round(width * 0.56);
  return (
    <div className="relative flex items-center justify-center" style={{ width, height: h }}>
      <svg viewBox="0 0 100 56" width={width} height={h} className="absolute inset-0" aria-hidden="true">
        <polygon
          points="12,1 88,1 99,28 88,55 12,55 1,28"
          fill="none"
          stroke={CBI.maroonIcon}
          strokeWidth="2.4"
        />
      </svg>
      <span className="relative flex items-center justify-center text-[#7A1F3D]">
        {children}
      </span>
    </div>
  );
}

/* ---------- White menu tile (2x3 grid) ---------- */
export function CbiTile({
  label,
  icon,
  onClick,
  className,
}: {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "cbi-card flex flex-col items-center justify-center gap-1.5 px-2 py-3 active:opacity-70",
        className
      )}
    >
      <HexagonIcon width={92}>{icon}</HexagonIcon>
      <span className="text-center text-[12.5px] font-normal leading-tight text-[#333333]">
        {label}
      </span>
    </button>
  );
}

/* ---------- Gradient blue button (sharp corners, uppercase) ---------- */
export function CbiButton({
  children,
  onClick,
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "cbi-btn-blue w-full py-[15px] text-[14px] font-bold uppercase tracking-[0.14em] text-white",
        "shadow-[0_1px_3px_rgba(0,0,0,0.25)] active:opacity-80 disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ---------- White accordion card with magenta ribbon ---------- */
export function CbiAccordionCard({
  title,
  open,
  onToggle,
  summaryLabel,
  summaryValue,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  summaryLabel?: string;
  summaryValue?: string;
  children: ReactNode;
}) {
  return (
    <div className="cbi-card overflow-hidden">
      <div className="h-[18px] w-full bg-[#82134C]" />
      <div className="px-3 pb-2 pt-2.5">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between py-0.5"
          aria-expanded={open}
        >
          <span className="text-[15px] font-bold text-[#595959]">{title}</span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-[#333333]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#333333]" />
          )}
        </button>
        {summaryLabel && summaryValue && (
          <div className="mt-0.5 flex items-center justify-between border-b border-[#E0E0E0] pb-1.5">
            <span className="text-[12px] text-[#7F7F7F]">{summaryLabel}</span>
            <span className="text-[12px] text-[#222222]">{summaryValue}</span>
          </div>
        )}
        {open && <div className="pt-1">{children}</div>}
      </div>
    </div>
  );
}

/* ---------- Account row inside accordion (bold number + › chevron) ---------- */
export function CbiAccountRow({
  accountNumber,
  onClick,
  children,
}: {
  accountNumber: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-[#E0E0E0] py-2 last:border-b-0">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between text-left active:opacity-70"
      >
        <span className="text-[13px] font-bold text-[#595959]">{accountNumber}</span>
        <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
      </button>
      <div className="pt-0.5">{children}</div>
    </div>
  );
}

/* ---------- Label-left / value-right pair row ---------- */
export function CbiRow({
  label,
  value,
  currency,
  bold = false,
  danger = false,
}: {
  label: string;
  value: string;
  currency?: string;
  bold?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-[3px]">
      <span className="text-[12.5px] text-[#7F7F7F]">{label}</span>
      <span
        className={cn(
          "text-[13px] text-[#222222]",
          bold && "font-bold",
          danger && "font-bold text-[#82134C]"
        )}
      >
        {currency && <span className="text-[#7F7F7F]">{currency} </span>}
        {value}
      </span>
    </div>
  );
}

/* ---------- Section title (bold dark gray) ---------- */
export function CbiSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-1 pb-2 pt-1 text-[15px] font-bold text-[#595959]">{children}</h2>
  );
}
