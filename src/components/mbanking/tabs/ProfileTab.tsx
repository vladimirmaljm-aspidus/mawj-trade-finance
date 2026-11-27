"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Building,
  FileText,
  ScanFace,
  Headphones,
  LogOut,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useMbanking, BANK } from "@/lib/mbanking/store";
import { useNav } from "../nav";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import { CbiAccordionCard, CbiRow, HexagonIcon } from "../cbi";

export function ProfileTab() {
  const requireBiometrics = useMbanking((s) => s.requireBiometrics);
  const setRequireBiometrics = useMbanking((s) => s.setRequireBiometrics);
  const logout = useMbanking((s) => s.logout);
  const profile = useMbanking((s) => s.profile);
  const { openSubPage } = useNav();

  const [companyOpen, setCompanyOpen] = useState(true);
  const [signatoryOpen, setSignatoryOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(true);

  const signOut = () => {
    toast("Terminating secure session…", "info");
    setTimeout(() => logout(), 800);
  };

  const initials = (profile?.full_name || "VM")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="fade-in flex flex-col gap-3 p-3 pb-6">
      {/* Security summary — flat navy card */}
      <div className="flex items-center justify-between bg-[#000F32] px-4 py-3.5">
        <div>
          <p className="text-[14px] font-bold text-white">Security Score: 100%</p>
          <p className="mt-0.5 text-[11.5px] text-white/70">
            {requireBiometrics ? "Biometric lock active · FIDO2" : "Biometric lock off"}
          </p>
        </div>
        <ShieldCheck className="h-6 w-6 text-white/90" strokeWidth={1.6} />
      </div>

      {/* Signatory summary — hexagon initials */}
      <div className="cbi-card flex items-center gap-3 px-3 py-3.5">
        <HexagonIcon width={52}>
          <span className="text-[12px] font-bold">{initials}</span>
        </HexagonIcon>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-[#333333]">
            {profile?.full_name || "Vladimir Maljm"}
          </p>
          <p className="mt-0.5 truncate text-[11.5px] text-[#7F7F7F]">
            {profile?.role || "Authorized Signatory"} · {profile?.company_name}
          </p>
        </div>
      </div>

      {/* Company section */}
      <CbiAccordionCard
        title="Company Profile"
        open={companyOpen}
        onToggle={() => setCompanyOpen((v) => !v)}
        summaryLabel="Registered Name"
        summaryValue={profile?.company_name ?? "—"}
      >
        <CbiRow label="License No." value={profile?.license_no ?? "—"} />
        <CbiRow
          label="Registered Office"
          value={profile?.registered_office ?? "—"}
        />
        <ListRow
          icon={<Building className="h-5 w-5 text-[#7A1F3D]" strokeWidth={1.8} />}
          label="View Company Details"
          onClick={() => openSubPage("company-details")}
        />
        <ListRow
          icon={<FileText className="h-5 w-5 text-[#7A1F3D]" strokeWidth={1.8} />}
          label="Statements & Taxes"
          onClick={() => openSubPage("taxes")}
        />
      </CbiAccordionCard>

      {/* Signatory section */}
      <CbiAccordionCard
        title="Authorized Signatory"
        open={signatoryOpen}
        onToggle={() => setSignatoryOpen((v) => !v)}
        summaryLabel="Name"
        summaryValue={profile?.full_name ?? "—"}
      >
        <CbiRow label="Role" value={profile?.role || "Authorized Signatory"} />
        <CbiRow label="Email" value={profile?.email ?? "—"} />
        <CbiRow label="Phone" value={profile?.phone ?? "—"} />
        <ListRow
          icon={<Activity className="h-5 w-5 text-[#7A1F3D]" strokeWidth={1.8} />}
          label="Login Activity"
          onClick={() => openSubPage("security")}
        />
      </CbiAccordionCard>

      {/* Preferences & security */}
      <CbiAccordionCard
        title="Preferences & Security"
        open={prefsOpen}
        onToggle={() => setPrefsOpen((v) => !v)}
        summaryLabel="Biometric Lock"
        summaryValue={requireBiometrics ? "Enabled" : "Disabled"}
      >
        <div className="flex items-center justify-between border-b border-[#E5E5E5] py-3">
          <div className="flex items-center gap-3">
            <ScanFace
              className="h-5 w-5 shrink-0 text-[#7A1F3D]"
              strokeWidth={1.8}
            />
            <div>
              <p className="text-[13px] font-bold text-[#333333]">
                Biometric Lock
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#7F7F7F]">
                Require Face ID / fingerprint on launch
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={requireBiometrics}
            onChange={() => {
              setRequireBiometrics(!requireBiometrics);
              toast(
                !requireBiometrics
                  ? "Biometric lock enabled."
                  : "Biometric lock disabled.",
                !requireBiometrics ? "success" : "info"
              );
            }}
          />
        </div>
        <ListRow
          icon={<Headphones className="h-5 w-5 text-[#7A1F3D]" strokeWidth={1.8} />}
          label="VIP Concierge"
          onClick={() => openSubPage("support")}
        />
      </CbiAccordionCard>

      {/* Sign out — flat maroon outline button */}
      <button
        onClick={signOut}
        className="mt-1 flex w-full items-center justify-center gap-2 border border-[#82134C] bg-white py-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[#82134C] active:opacity-70"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.8} />
        Secure Sign Out
      </button>

      <p className="px-4 text-center text-[10.5px] leading-relaxed text-[#8C8C8C]">
        {BANK.legalName} · {BANK.license} · {BANK.regulatedBy}
      </p>
    </div>
  );
}

/** Flat list row with maroon icon + › chevron (inside accordion sections). */
function ListRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-[#E5E5E5] py-3 pr-1 text-left last:border-b-0 active:opacity-70"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[13px] font-bold text-[#333333]">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
    </button>
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
