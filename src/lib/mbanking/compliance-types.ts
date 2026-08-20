import type { Account, CardInfo, FxRate, LoginEvent, Profile, Transaction } from "./types";

export type ComplDocStatus = "pending" | "submitted" | "approved" | "rejected";
export type ComplDocCategory = "KYC" | "AML" | "SOURCE_OF_FUNDS" | "CORPORATE" | "TRANSACTION";
export type ComplSeverity = "low" | "medium" | "high" | "critical";
export type ComplTimelineTone = "info" | "warning" | "success" | "danger";

export interface ComplianceDocument {
  id: string;
  title: string;
  description: string | null;
  status: ComplDocStatus;
  category: ComplDocCategory;
  submitted_at: string | null;
  filename: string | null;
  due_date: string | null;
}

export interface ComplianceTimelineEvent {
  id: string;
  occurred_at: string;
  title: string;
  description: string;
  actor: "bank" | "client" | "system";
  tone: ComplTimelineTone;
}

export interface ComplianceCase {
  id: string;
  case_reference: string;
  title: string;
  reason: string;
  amount_blocked: number;
  currency: string;
  blocked_since: string;
  deadline_1: string;        // first (missed) deadline
  deadline_2: string;        // current / final deadline
  status: string;
  severity: ComplSeverity;
  progress_pct: number;
  regulator_note: string | null;
  assigned_officer: string | null;
  officer_role: string | null;
  officer_email: string | null;
  officer_phone: string | null;
  documents?: ComplianceDocument[];
  timeline?: ComplianceTimelineEvent[];
}

/** Re-export all the original types so callers can import from one place. */
export type {
  Account,
  CardInfo,
  FxRate,
  LoginEvent,
  Profile,
  Transaction,
};
