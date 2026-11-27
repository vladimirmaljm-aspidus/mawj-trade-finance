"use client";

import { SubPage } from "../SubPage";
import { CbiRow, CbiLogo } from "../cbi";
import { useMbanking, BANK } from "@/lib/mbanking/store";

export function CompanyDetailsPage() {
  const profile = useMbanking((s) => s.profile);

  return (
    <SubPage title="Entity Details">
      <div className="px-3 py-3">
        {/* Bank identity card */}
        <div className="cbi-card flex flex-col items-center px-3 py-4">
          <CbiLogo height={26} />
          <p className="mt-2 text-[13px] font-bold text-[#595959]">{BANK.legalName}</p>
          <p className="mt-1 text-[11px] font-bold uppercase text-[#82134C]">
            UAE-Licensed Corporate Bank
          </p>
        </div>

        {/* Account holder */}
        <div className="mt-3 cbi-card px-3 py-2.5">
          <p className="text-[15px] font-bold text-[#595959]">Account Holder</p>
          <div className="mt-1 border-t border-[#E5E5E5] pt-1.5">
            <CbiRow label="Company Name" value={profile?.company_name ?? "Aspidus DMCC"} />
            <CbiRow label="Authorized Signatory" value={profile?.full_name ?? "Vladimir Maljm"} />
            <CbiRow label="Trade License / Reg No." value={profile?.license_no ?? "DMCC-194827"} />
            <CbiRow
              label="Registered Office"
              value={profile?.registered_office ?? "Almas Tower, JLT, Dubai, UAE"}
            />
          </div>
        </div>

        {/* Banking partner */}
        <div className="mt-3 cbi-card px-3 py-2.5">
          <p className="text-[15px] font-bold text-[#595959]">Banking Partner</p>
          <div className="mt-1 border-t border-[#E5E5E5] pt-1.5">
            <CbiRow label="Bank" value={BANK.legalName} />
            <CbiRow label="Bank License" value={BANK.license} />
            <CbiRow label="Regulator" value={BANK.regulatedBy} />
          </div>
        </div>

        {(profile?.email || profile?.phone) && (
          <div className="mt-3 cbi-card px-3 py-2.5">
            <p className="text-[15px] font-bold text-[#595959]">Contact</p>
            <div className="mt-1 border-t border-[#E5E5E5] pt-1.5">
              {profile?.email && <CbiRow label="Email" value={profile.email} />}
              {profile?.phone && <CbiRow label="Phone" value={profile.phone} />}
            </div>
          </div>
        )}
      </div>
    </SubPage>
  );
}
