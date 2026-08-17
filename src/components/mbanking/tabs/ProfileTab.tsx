"use client";

import {
  ShieldCheck,
  Building,
  FileText,
  ScanFace,
  Headphones,
  LogOut,
  ChevronRight,
  Lock,
  Activity,
} from "lucide-react";
import { useMbanking, BANK } from "@/lib/mbanking/store";
import { useNav } from "../nav";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";

export function ProfileTab() {
  const requireBiometrics = useMbanking((s) => s.requireBiometrics);
  const setRequireBiometrics = useMbanking((s) => s.setRequireBiometrics);
  const logout = useMbanking((s) => s.logout);
  const profile = useMbanking((s) => s.profile);
  const { openSubPage } = useNav();

  const signOut = () => {
    toast("Terminating secure session…", "info");
    setTimeout(() => logout(), 800);
  };

  return (
    <div className="fade-in flex flex-col gap-6">
      <h2 className="px-1 text-[1.3rem] font-black tracking-tight text-slate-900">
        Settings &amp; Security
      </h2>

      {/* Security score */}
      <div className="flex items-center justify-between rounded-[1.5rem] bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-lg shadow-emerald-500/20">
        <div>
          <p className="text-lg font-black">Security Score: 100%</p>
          <p className="text-sm font-medium opacity-90">
            {requireBiometrics ? "Biometric lock active · FIDO2" : "Biometric lock off"}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <ShieldCheck className="h-6 w-6 stroke-[2.5] text-white" />
        </div>
      </div>

      {/* Account summary */}
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-900 to-slate-900 text-sm font-black text-amber-400">
            {(profile?.full_name || "VM")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-900">
              {profile?.full_name || "Vladimir Maljm"}
            </p>
            <p className="truncate text-xs font-semibold text-slate-500">
              {profile?.role || "Authorized Signatory"} · {profile?.company_name}
            </p>
          </div>
        </div>
      </div>

      {/* Settings list */}
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <Row
          icon={<Building className="h-4 w-4 stroke-[2.5]" />}
          tone="indigo"
          label="Company Profile"
          onClick={() => openSubPage("company-details")}
        />
        <Row
          icon={<FileText className="h-4 w-4 stroke-[2.5]" />}
          tone="blue"
          label="Statements & Taxes"
          onClick={() => openSubPage("taxes")}
        />
        <Row
          icon={<Activity className="h-4 w-4 stroke-[2.5]" />}
          tone="emerald"
          label="Login Activity"
          onClick={() => openSubPage("security")}
        />

        {/* Biometric toggle */}
        <div className="flex items-center justify-between border-b border-slate-50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ScanFace className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Biometric Lock</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">
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

        <Row
          icon={<Headphones className="h-4 w-4 stroke-[2.5]" />}
          tone="amber"
          label="VIP Concierge"
          onClick={() => openSubPage("support")}
        />

        <button
          onClick={signOut}
          className="active-scale flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-rose-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <LogOut className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="text-sm font-black text-rose-600">Secure Sign Out</span>
          </div>
        </button>
      </div>

      <p className="px-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
        {BANK.legalName} · {BANK.license} · {BANK.regulatedBy}
      </p>
    </div>
  );
}

const TONE = {
  indigo: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
} as const;

function Row({
  icon,
  tone,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONE;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="active-scale flex w-full items-center justify-between border-b border-slate-50 p-5 text-left transition-colors hover:bg-slate-50"
    >
      <div className="flex items-center gap-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", TONE[tone])}>
          {icon}
        </div>
        <span className="text-sm font-black text-slate-900">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300" />
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
        checked ? "bg-emerald-500" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full border bg-white shadow transition-transform",
          checked ? "translate-x-6 border-white" : "translate-x-1 border-slate-300"
        )}
      />
    </button>
  );
}

export { Lock };
