"use client";

import { Phone, MessageSquare, Mail, Headphones } from "lucide-react";
import { SubPage } from "../SubPage";
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
      <div className="flex flex-col items-center p-5 pt-10">
        <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-100 to-slate-200 text-3xl font-black text-indigo-700 shadow-xl">
          {ADVISOR.initials}
        </div>
        <h2 className="text-2xl font-black text-slate-900">{ADVISOR.name}</h2>
        <p className="mb-8 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
          {ADVISOR.role}
        </p>

        <button
          onClick={() => toast("Connecting to secure banking line…", "info")}
          className="active-scale mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-md hover:bg-slate-800"
        >
          <Phone className="h-4 w-4 stroke-[2.5]" />
          Call Direct
        </button>
        <button
          onClick={() => toast("Opening secure chat…", "info")}
          className="active-scale mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-black text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <MessageSquare className="h-4 w-4 stroke-[2.5]" />
          Secure Message
        </button>
        <button
          onClick={() => toast("Composing secure email…", "info")}
          className="active-scale flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-black text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <Mail className="h-4 w-4 stroke-[2.5]" />
          Email Manager
        </button>

        <div className="mt-8 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
          <Headphones className="h-4 w-4 text-emerald-600" />
          <p className="text-xs font-bold text-emerald-700">
            24/7 priority support · Avg response &lt; 2 min
          </p>
        </div>
        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
          {BANK.legalName}
        </p>
      </div>
    </SubPage>
  );
}
