"use client";

import type { ReactNode } from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Flag,
  ChevronRight,
  Headphones,
  User,
} from "lucide-react";
import { SubPage } from "../SubPage";
import { HexagonIcon } from "../cbi";
import { BANK } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";

const ADVISOR = {
  name: "Layla Al-Mansouri",
  role: "Senior Relationship Manager",
  initials: "LA",
};

export function SupportPage() {
  return (
    <SubPage title="Relationship Manager">
      <div className="cbi-cream min-h-full px-3 py-3">
        {/* Advisor card — flat hexagon, no circular avatar */}
        <div className="cbi-card px-3 py-3.5">
          <div className="flex items-center gap-3">
            <HexagonIcon width={64}>
              <User className="h-7 w-7" strokeWidth={1.6} />
            </HexagonIcon>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[#222222]">{ADVISOR.name}</p>
              <p className="mt-0.5 text-[11px] text-[#7F7F7F]">{ADVISOR.role}</p>
            </div>
          </div>
        </div>

        {/* Contact actions — flat white rows, hairline separators */}
        <div className="mt-3 cbi-card">
          <ActionRow
            icon={<Phone className="h-4 w-4" strokeWidth={1.8} />}
            label="Call Direct"
            onClick={() => toast("Connecting to secure banking line…", "info")}
          />
          <ActionRow
            icon={<MessageSquare className="h-4 w-4" strokeWidth={1.8} />}
            label="Secure Message"
            onClick={() => toast("Opening secure chat…", "info")}
          />
          <ActionRow
            icon={<Mail className="h-4 w-4" strokeWidth={1.8} />}
            label="Email Manager"
            onClick={() => toast("Composing secure email…", "info")}
          />
          <ActionRow
            icon={<MapPin className="h-4 w-4" strokeWidth={1.8} />}
            label="Find Branch / ATM"
            onClick={() => toast("Locating nearby CBI branches…", "info")}
          />
          <ActionRow
            icon={<Flag className="h-4 w-4" strokeWidth={1.8} />}
            label="Report an Issue"
            onClick={() => toast("Opening issue report form…", "info")}
          />
        </div>

        {/* Priority support note */}
        <div className="mt-3 cbi-card flex items-center gap-2 px-3 py-2.5">
          <Headphones className="h-4 w-4 shrink-0 text-[#7A1F3D]" strokeWidth={1.8} />
          <p className="text-[11px] text-[#595959]">
            24/7 priority support · Avg response &lt; 2 min
          </p>
        </div>

        <p className="mt-3 text-center text-[10px] uppercase text-[#9E9E9E]">
          {BANK.legalName}
        </p>
      </div>
    </SubPage>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-[#E5E5E5] px-3 py-3 text-left last:border-b-0 active:opacity-70"
    >
      <span className="flex items-center gap-2.5 text-[13px] font-bold text-[#333333]">
        <span className="text-[#7A1F3D]">{icon}</span>
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
    </button>
  );
}
