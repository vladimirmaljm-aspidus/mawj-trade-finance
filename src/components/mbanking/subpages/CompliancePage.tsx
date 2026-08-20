"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Building2,
  TrendingDown,
} from "lucide-react";
import { SubPage } from "../SubPage";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import type { ComplianceCase, ComplianceDocument } from "@/lib/mbanking/compliance-types";
import { formatEUR } from "@/lib/mbanking/format";
import { cn } from "@/lib/utils";

export function CompliancePage() {
  const caseRow = useMbanking((s) => s.complianceCase);

  if (!caseRow) {
    return (
      <SubPage title="Compliance">
        <div className="p-10 text-center text-sm font-bold text-slate-400">
          No active compliance case.
        </div>
      </SubPage>
    );
  }

  return <CompliancePageInner caseRow={caseRow} />;
}

function CompliancePageInner({ caseRow }: { caseRow: ComplianceCase }) {
  const deadline = new Date(caseRow.deadline_2);
  const blockedSince = new Date(caseRow.blocked_since);
  const deadline1 = new Date(caseRow.deadline_1);
  const [now] = useState(() => Date.now());

  const msLeft = deadline.getTime() - now;
  const daysLeft = Math.max(0, Math.floor(msLeft / 86400000));
  const hoursLeft = Math.max(0, Math.floor((msLeft % 86400000) / 3600000));
  const minutesLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));

  const daysSinceBlocked = Math.floor((now - blockedSince.getTime()) / 86400000);
  const daysSinceDeadline1Missed = Math.floor(
    (now - deadline1.getTime()) / 86400000
  );

  const total = caseRow.documents?.length ?? 0;
  const done = (caseRow.documents ?? []).filter(
    (d) => d.status === "approved" || d.status === "submitted"
  ).length;
  const approved = (caseRow.documents ?? []).filter(
    (d) => d.status === "approved"
  ).length;

  return (
    <SubPage title="Compliance Review">
      <div className="flex flex-col gap-4 p-5 pt-6">
        {/* Hero — blocked amount + countdown */}
        <div className="relative overflow-hidden rounded-[1.5rem] border border-amber-300/50 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-5 shadow-sm">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-500" />
          <div className="flex items-start gap-3 pl-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-sm">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Case {caseRow.case_reference}
                </p>
                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-rose-700">
                  {caseRow.severity}
                </span>
              </div>
              <h2 className="mt-1 text-base font-black leading-tight text-slate-900">
                {caseRow.title}
              </h2>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
                {caseRow.reason}
              </p>
            </div>
          </div>

          {/* Blocked amount + countdown */}
          <div className="mt-4 grid grid-cols-2 gap-3 pl-2">
            <div className="rounded-xl border border-amber-200 bg-white/70 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                <Lock className="h-3 w-3" /> Amount Held
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {formatEUR(caseRow.amount_blocked)}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                {caseRow.currency} · all accounts restricted
              </p>
            </div>
            <div className="rounded-xl border border-slate-300 bg-slate-900 p-3 text-white">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                <Clock className="h-3 w-3" /> Time Remaining
              </p>
              <p className="mt-1 font-mono text-lg font-black">
                {daysLeft}<span className="text-xs">d</span>{" "}
                {hoursLeft}<span className="text-xs">h</span>{" "}
                {minutesLeft}<span className="text-xs">m</span>
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                Final deadline · {deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 pl-2">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-600">Resolution progress</span>
              <span className="text-slate-900">
                {done}/{total} documents · {caseRow.progress_pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200">
              <div
                className="h-full rounded-full bg-amber-600 transition-all"
                style={{ width: `${caseRow.progress_pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Regulator warning */}
        {caseRow.regulator_note && (
          <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <p className="text-xs font-black text-rose-900">
                  Regulatory escalation warning
                </p>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-rose-700">
                  {caseRow.regulator_note}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Countdown detail */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Clock className="h-3 w-3" /> Deadline status
          </p>
          <div className="flex flex-col gap-3">
            <DeadlineRow
              label="Funds blocked since"
              date={blockedSince}
              note={`${daysSinceBlocked} days ago`}
              tone="neutral"
            />
            <DeadlineRow
              label="Deadline 1 (missed)"
              date={deadline1}
              note={`Missed · ${daysSinceDeadline1Missed} days overdue`}
              tone="danger"
            />
            <DeadlineRow
              label="Final deadline"
              date={deadline}
              note={msLeft > 0 ? `${daysLeft} days ${hoursLeft} hours remaining` : "EXPIRED"}
              tone={msLeft > 0 ? "warning" : "danger"}
            />
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <FileText className="h-3 w-3" /> Required documents
            </p>
            <span className="text-[10px] font-bold text-slate-500">
              {approved} approved · {done} submitted · {total - done} pending
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {(caseRow.documents ?? []).map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Calendar className="h-3 w-3" /> Case timeline
          </p>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-200" />
            <div className="flex flex-col gap-5">
              {(caseRow.timeline ?? []).map((ev) => {
                const tone = TIMELINE_TONE[ev.tone] ?? TIMELINE_TONE.info;
                const Icon = tone.icon;
                const d = new Date(ev.occurred_at);
                return (
                  <div key={ev.id} className="relative">
                    <div
                      className={cn(
                        "absolute -left-[18px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white",
                        tone.dot
                      )}
                    >
                      <Icon className={cn("h-2.5 w-2.5", tone.iconColor)} />
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-black text-slate-900">{ev.title}</p>
                      <p className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-600">
                      {ev.description}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      by {ev.actor}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Officer contact */}
        {caseRow.assigned_officer && (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Building2 className="h-3 w-3" /> Assigned compliance officer
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-slate-200 text-sm font-black text-emerald-800">
                {caseRow.assigned_officer
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-900">
                  {caseRow.assigned_officer}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  {caseRow.officer_role}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() =>
                  toast(`Calling ${caseRow.assigned_officer}…`, "info")
                }
                className="active-scale flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100"
              >
                <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Phone className="h-3.5 w-3.5" />
                  Call officer
                </span>
                <span className="font-mono text-xs font-black text-slate-900">
                  {caseRow.officer_phone}
                </span>
              </button>
              <button
                onClick={() =>
                  toast(`Composing secure email…`, "info")
                }
                className="active-scale flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100"
              >
                <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Mail className="h-3.5 w-3.5" />
                  Secure email
                </span>
                <span className="truncate pl-2 font-mono text-xs font-black text-slate-900">
                  {caseRow.officer_email}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Days blocked
            </p>
            <p className="text-xl font-black text-slate-900">{daysSinceBlocked}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <FileText className="h-4 w-4 text-slate-700" />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Documents pending
            </p>
            <p className="text-xl font-black text-slate-900">{total - done}</p>
          </div>
        </div>

        <p className="px-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
          All outgoing transfers are suspended until case resolution
        </p>
      </div>
    </SubPage>
  );
}

const TIMELINE_TONE: Record<
  string,
  { icon: typeof CheckCircle2; dot: string; iconColor: string }
> = {
  info: { icon: Clock, dot: "bg-slate-200", iconColor: "text-slate-600" },
  success: { icon: CheckCircle2, dot: "bg-emerald-100", iconColor: "text-emerald-600" },
  warning: { icon: AlertTriangle, dot: "bg-amber-100", iconColor: "text-amber-600" },
  danger: { icon: ShieldAlert, dot: "bg-rose-100", iconColor: "text-rose-600" },
};

function DeadlineRow({
  label,
  date,
  note,
  tone,
}: {
  label: string;
  date: Date;
  note: string;
  tone: "neutral" | "warning" | "danger";
}) {
  const toneColor =
    tone === "danger"
      ? "text-rose-600"
      : tone === "warning"
        ? "text-amber-600"
        : "text-slate-500";
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-black text-slate-900">{label}</p>
        <p className="text-[11px] font-medium text-slate-500">
          {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          {" · "}
          {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <span className={cn("text-[11px] font-black", toneColor)}>{note}</span>
    </div>
  );
}

function DocumentRow({ doc }: { doc: ComplianceDocument }) {
  const statusMap = {
    approved: { label: "Approved", bg: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    submitted: { label: "Submitted", bg: "bg-blue-100 text-blue-700", icon: Clock },
    pending: { label: "Pending", bg: "bg-amber-100 text-amber-700", icon: AlertTriangle },
    rejected: { label: "Rejected", bg: "bg-rose-100 text-rose-700", icon: AlertTriangle },
  } as const;
  const s = statusMap[doc.status] ?? statusMap.pending;
  const StatusIcon = s.icon;
  const canUpload = doc.status === "pending" || doc.status === "rejected";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-black text-slate-900">{doc.title}</p>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest",
              s.bg
            )}
          >
            <StatusIcon className="h-2.5 w-2.5" />
            {s.label}
          </span>
        </div>
        {doc.description && (
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-600">
            {doc.description}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {doc.category.replace(/_/g, " ")}
            {doc.submitted_at && (
              <span className="ml-2 text-slate-500">
                · {new Date(doc.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </span>
          {canUpload && (
            <button
              onClick={() =>
                toast(`Upload: ${doc.title}`, "info")
              }
              className="active-scale flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-800"
            >
              <Upload className="h-3 w-3" />
              Upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
