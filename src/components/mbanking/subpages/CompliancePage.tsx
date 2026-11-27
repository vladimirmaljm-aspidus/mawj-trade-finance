"use client";

import { useState } from "react";
import {
  AlertTriangle,
  FileText,
  Upload,
  Phone,
  Mail,
  TrendingDown,
  User,
} from "lucide-react";
import { SubPage } from "../SubPage";
import { CbiRow, HexagonIcon } from "../cbi";
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
        <div className="px-3 py-8 text-center">
          <p className="text-[13px] text-[#7F7F7F]">No active compliance case.</p>
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
      <div className="px-3 py-3">
        {/* Case overview — magenta ribbon card with label/value rows */}
        <div className="cbi-card overflow-hidden">
          <div className="h-[18px] w-full bg-[#82134C]" />
          <div className="px-3 pb-3 pt-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[14px] font-bold text-[#595959]">{caseRow.title}</p>
              <span className="shrink-0 text-[10px] font-bold uppercase text-[#82134C]">
                {caseRow.severity}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-[#7F7F7F]">
              {caseRow.reason}
            </p>

            <div className="mt-2 border-t border-[#E5E5E5] pt-1.5">
              <CbiRow label="Case Reference" value={caseRow.case_reference} bold />
              <CbiRow label="Case Status" value={caseRow.status} />
              <div className="flex items-baseline justify-between py-[3px]">
                <span className="text-[12.5px] text-[#7F7F7F]">Amount Blocked</span>
                <span className="text-[13px] font-bold text-[#82134C]">
                  {formatEUR(caseRow.amount_blocked)}
                </span>
              </div>
              <p className="text-[10px] text-[#9E9E9E]">
                {caseRow.currency} · all accounts restricted
              </p>
              <div className="mt-1 flex items-baseline justify-between py-[3px]">
                <span className="text-[12.5px] text-[#7F7F7F]">Time Remaining</span>
                <span className="text-[13px] font-bold text-[#82134C]">
                  {daysLeft}d {hoursLeft}h {minutesLeft}m
                </span>
              </div>
              <CbiRow
                label="Final Deadline"
                value={deadline.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
            </div>

            {/* Resolution progress — flat navy bar */}
            <div className="mt-2 border-t border-[#E5E5E5] pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#7F7F7F]">Resolution progress</span>
                <span className="text-[11px] font-bold text-[#222222]">
                  {done}/{total} documents · {caseRow.progress_pct}%
                </span>
              </div>
              <div className="mt-1 h-[6px] w-full bg-[#E5E5E5]">
                <div
                  className="h-full bg-[#000F32]"
                  style={{ width: `${caseRow.progress_pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Regulator warning — flat card, magenta text */}
        {caseRow.regulator_note && (
          <div className="mt-3 cbi-card px-3 py-3">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#82134C]">
              <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              Regulatory escalation warning
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#82134C]">
              {caseRow.regulator_note}
            </p>
          </div>
        )}

        {/* Deadline status */}
        <div className="mt-3 cbi-card px-3 py-2.5">
          <p className="text-[15px] font-bold text-[#595959]">Deadline Status</p>
          <div className="mt-1 flex flex-col border-t border-[#E5E5E5] pt-1.5">
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

        {/* Documents — white rows with flat status text */}
        <div className="mt-3 cbi-card px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[15px] font-bold text-[#595959]">Required Documents</p>
            <span className="shrink-0 text-[10px] text-[#7F7F7F]">
              {approved} approved · {done} submitted · {total - done} pending
            </span>
          </div>
          <div className="mt-1 border-t border-[#E5E5E5] pt-1">
            {(caseRow.documents ?? []).map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>
        </div>

        {/* Timeline — flat vertical list: thin navy line + square dots */}
        <div className="mt-3 cbi-card px-3 py-2.5">
          <p className="text-[15px] font-bold text-[#595959]">Case Timeline</p>
          <div className="relative mt-2 pl-5">
            <div className="absolute bottom-2 left-[3px] top-2 w-px bg-[#000F32]" />
            <div className="flex flex-col gap-4">
              {(caseRow.timeline ?? []).map((ev) => {
                const d = new Date(ev.occurred_at);
                return (
                  <div key={ev.id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[20px] top-[3px] h-[7px] w-[7px]",
                        TIMELINE_DOT[ev.tone] ?? TIMELINE_DOT.info
                      )}
                    />
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] font-bold text-[#595959]">{ev.title}</p>
                      <p className="shrink-0 text-[10px] text-[#7F7F7F]">
                        {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#7F7F7F]">
                      {ev.description}
                    </p>
                    <p className="mt-1 text-[9px] uppercase text-[#9E9E9E]">
                      by {ev.actor}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Officer contact — hexagon, flat rows */}
        {caseRow.assigned_officer && (
          <div className="mt-3 cbi-card px-3 py-2.5">
            <p className="text-[15px] font-bold text-[#595959]">Assigned Compliance Officer</p>
            <div className="mt-2 flex items-center gap-3 border-t border-[#E5E5E5] pt-2">
              <HexagonIcon width={56}>
                <User className="h-6 w-6" strokeWidth={1.6} />
              </HexagonIcon>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#222222]">
                  {caseRow.assigned_officer}
                </p>
                <p className="mt-0.5 text-[11px] text-[#7F7F7F]">
                  {caseRow.officer_role}
                </p>
              </div>
            </div>
            <div className="mt-2 border-t border-[#E5E5E5] pt-1">
              <button
                onClick={() =>
                  toast(`Calling ${caseRow.assigned_officer}…`, "info")
                }
                className="flex w-full items-center justify-between border-b border-[#E5E5E5] py-2.5 text-left active:opacity-70"
              >
                <span className="flex items-center gap-2 text-[12px] text-[#7F7F7F]">
                  <Phone className="h-3.5 w-3.5 text-[#7A1F3D]" strokeWidth={1.8} />
                  Call officer
                </span>
                <span className="font-mono text-[12px] font-bold text-[#222222]">
                  {caseRow.officer_phone}
                </span>
              </button>
              <button
                onClick={() => toast(`Composing secure email…`, "info")}
                className="flex w-full items-center justify-between py-2.5 text-left active:opacity-70"
              >
                <span className="flex items-center gap-2 text-[12px] text-[#7F7F7F]">
                  <Mail className="h-3.5 w-3.5 text-[#7A1F3D]" strokeWidth={1.8} />
                  Secure email
                </span>
                <span className="truncate pl-2 font-mono text-[12px] font-bold text-[#222222]">
                  {caseRow.officer_email}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="cbi-card px-3 py-2.5">
            <TrendingDown className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
            <p className="mt-1.5 text-[10px] uppercase text-[#7F7F7F]">Days Blocked</p>
            <p className="mt-0.5 text-[20px] font-bold text-[#222222]">{daysSinceBlocked}</p>
          </div>
          <div className="cbi-card px-3 py-2.5">
            <FileText className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
            <p className="mt-1.5 text-[10px] uppercase text-[#7F7F7F]">Documents Pending</p>
            <p className="mt-0.5 text-[20px] font-bold text-[#222222]">{total - done}</p>
          </div>
        </div>

        <p className="mt-3 px-2 text-center text-[10px] uppercase text-[#9E9E9E]">
          All outgoing transfers are suspended until case resolution
        </p>
      </div>
    </SubPage>
  );
}

const TIMELINE_DOT: Record<string, string> = {
  info: "bg-[#000F32]",
  success: "bg-[#217A3B]",
  warning: "bg-[#82134C]",
  danger: "bg-[#82134C]",
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
  const noteColor = tone === "neutral" ? "text-[#7F7F7F]" : "text-[#82134C]";
  return (
    <div className="flex items-baseline justify-between border-b border-[#E5E5E5] py-2 last:border-b-0">
      <div>
        <p className="text-[12.5px] text-[#7F7F7F]">{label}</p>
        <p className="mt-0.5 text-[11px] text-[#9E9E9E]">
          {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          {" · "}
          {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <span className={cn("text-[11px] font-bold", noteColor)}>{note}</span>
    </div>
  );
}

function DocumentRow({ doc }: { doc: ComplianceDocument }) {
  const statusMap = {
    approved: { label: "Approved", color: "text-[#217A3B]" },
    submitted: { label: "Submitted", color: "text-[#1565C0]" },
    pending: { label: "Pending", color: "text-[#82134C]" },
    rejected: { label: "Rejected", color: "text-[#82134C]" },
  } as const;
  const s = statusMap[doc.status] ?? statusMap.pending;
  const canUpload = doc.status === "pending" || doc.status === "rejected";

  return (
    <div className="border-b border-[#E5E5E5] py-2.5 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#7A1F3D]" strokeWidth={1.8} />
          <span className="min-w-0">
            <span className="block text-[13px] font-bold text-[#595959]">{doc.title}</span>
            {doc.description && (
              <span className="mt-0.5 block text-[11px] leading-relaxed text-[#7F7F7F]">
                {doc.description}
              </span>
            )}
            <span className="mt-1 block text-[9px] uppercase text-[#9E9E9E]">
              {doc.category.replace(/_/g, " ")}
              {doc.submitted_at && (
                <span className="ml-1">
                  · {new Date(doc.submitted_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </span>
          </span>
        </span>
        <span className={cn("shrink-0 text-[11px] font-bold uppercase", s.color)}>
          {s.label}
        </span>
      </div>
      {canUpload && (
        <button
          onClick={() => toast(`Upload: ${doc.title}`, "info")}
          className="mt-1.5 ml-6 flex items-center gap-1 text-[10px] font-bold uppercase text-[#7A1F3D] active:opacity-70"
        >
          <Upload className="h-3 w-3" strokeWidth={1.8} />
          Upload
        </button>
      )}
    </div>
  );
}
