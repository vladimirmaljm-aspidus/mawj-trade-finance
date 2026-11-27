/**
 * Corporate workbench — shared server-side helpers.
 *
 * "Work records" (approvals, scheduled transfers, cheque register, …) live
 * in the same `transactions` table but are excluded from the account
 * statement feed. Monetary events get separate statement rows with normal
 * categories once executed/approved.
 */

export const WORK_CATEGORIES = [
  "Approval",
  "Beneficiary Activation",
  "Cheque Book",
  "Stop Cheque",
  "Scheduled Transfer",
  "Standing Order",
  "Cheque",
] as const;

/** Draft/approval state machine for work rows. */
export const WORK_PENDING = "Pending Approval";

export function parseWorkMemo(memo: string | null): Record<string, unknown> | null {
  if (!memo) return null;
  try {
    const v = JSON.parse(memo);
    return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Dual-authorization threshold (AED-equivalent) for outgoing payments. */
export const APPROVAL_THRESHOLD_AED = 250_000;

export const CHECKER = "V. Maljm";
export const MAKER_DEFAULT = "E. Petrova";

/** Generous but stable reference generator for new work rows. */
export function workRef(prefix: string): string {
  return `${prefix}-${Math.floor(100000 + Math.random() * 899999)}`;
}
