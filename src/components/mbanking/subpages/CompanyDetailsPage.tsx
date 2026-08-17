"use client";

import { Building, Hash, MapPin, Globe, ShieldCheck, User, Mail, Phone } from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking, BANK } from "@/lib/mbanking/store";

export function CompanyDetailsPage() {
  const profile = useMbanking((s) => s.profile);

  return (
    <SubPage title="Entity Details">
      <div className="p-5 pt-6">
        <div className="mb-5 flex flex-col items-center rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <img
            src="/icons/icon-192.png"
            alt={BANK.name}
            className="mb-3 h-16 w-16 rounded-2xl shadow-sm ring-1 ring-slate-200"
          />
          <h2 className="text-lg font-black text-slate-900">{BANK.legalName}</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-emerald-800">
            UAE-Licensed Corporate Bank
          </p>
        </div>

        <div className="mb-5 flex flex-col gap-5 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Account Holder
          </p>
          <Field
            icon={<Building className="h-4 w-4" />}
            label="Company Name"
            value={profile?.company_name ?? "Aspidus DMCC"}
          />
          <Field
            icon={<User className="h-4 w-4" />}
            label="Authorized Signatory"
            value={profile?.full_name ?? "Vladimir Maljm"}
          />
          <Field
            icon={<Hash className="h-4 w-4" />}
            label="Trade License / Reg No."
            value={profile?.license_no ?? "DMCC-194827"}
            mono
          />
          <Field
            icon={<MapPin className="h-4 w-4" />}
            label="Registered Office"
            value={profile?.registered_office ?? "Almas Tower, JLT, Dubai, UAE"}
          />
        </div>

        <div className="flex flex-col gap-5 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Banking Partner
          </p>
          <Field
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Bank"
            value={BANK.legalName}
          />
          <Field
            icon={<Hash className="h-4 w-4" />}
            label="Bank License"
            value={BANK.license}
            mono
          />
          <Field
            icon={<Globe className="h-4 w-4" />}
            label="Regulator"
            value={BANK.regulatedBy}
          />
        </div>

        {(profile?.email || profile?.phone) && (
          <div className="mt-5 flex flex-col gap-5 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Contact
            </p>
            {profile?.email && (
              <Field icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
            )}
            {profile?.phone && (
              <Field icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
            )}
          </div>
        )}
      </div>
    </SubPage>
  );
}

function Field({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span className="text-slate-400">{icon}</span>
        {label}
      </p>
      <p
        className={
          mono
            ? "font-mono text-base font-black text-slate-900"
            : "whitespace-pre-line text-sm font-bold leading-relaxed text-slate-900"
        }
      >
        {value}
      </p>
    </div>
  );
}
