/**
 * Corporate banking reference data — Trade Finance instruments,
 * credit facilities and deposits for the CBI corporate platform.
 *
 * Shared between the server (/api/corporate) and the client store.
 */

/* ---------- Trade Finance ---------- */

export type InstrumentKind =
  | "import-lc"
  | "export-lc"
  | "lg-performance"
  | "lg-advance"
  | "collection-import"
  | "collection-export"
  | "trust-receipt";

export type InstrumentStatus =
  | "Active"
  | "Utilized"
  | "Settled"
  | "Expiring Soon"
  | "Payment Due"
  | "Documents Held"
  | "Accepted";

export interface InstrumentEvent {
  /** ISO date — displayed as "12 Jan 2026". */
  date: string;
  title: string;
  description: string;
}

export interface InstrumentCharge {
  /** e.g. "0.85% p.a." */
  rate: string;
  /** e.g. "on issued amount, quarterly" */
  basis: string;
  /** ISO date of the next automatic debit. */
  nextDebit: string;
  amount: number;
}

export interface TradeInstrument {
  ref: string;
  kind: InstrumentKind;
  /** Display label, e.g. "Import Letter of Credit". */
  kindLabel: string;
  status: InstrumentStatus;
  /** Visual tone for the status chip. */
  statusTone: "active" | "done" | "warning" | "danger" | "info";
  currency: "EUR" | "USD" | "AED";
  /** Instrument face / issued amount. */
  amount: number;
  /** Amount utilized (drawings / guarantee value outstanding). */
  utilized: number;
  /** Counterparty protected by the instrument. */
  beneficiary: string;
  beneficiaryCountry: string;
  /** For advised export LCs / collections — the issuing (buyer's) bank. */
  issuingBank?: string;
  /** Underlying commercial description. */
  goods: string;
  /** ISO date the instrument was issued / advised / granted. */
  openedAt: string;
  /** ISO expiry / final due date. */
  expiry: string;
  /** Presentation / payment terms, e.g. "At sight", "D/P 60 days". */
  tenor: string;
  incoterms?: string;
  loadingPort?: string;
  dischargePort?: string;
  latestShipment?: string;
  partialShipments?: string;
  transferable?: boolean;
  /** Cash margin retained by the bank (fraction of face, e.g. 0.2). */
  marginPct?: number;
  /** Ongoing commissions charged by the bank. */
  charge?: InstrumentCharge;
  /** Required presentation documents. */
  documentsRequired?: string[];
  /** Chronological instrument events (newest last). */
  events: InstrumentEvent[];
  /** Compliance-linked restriction on this instrument, if any. */
  complianceNote?: string;
}

/* ---------- Credit Facilities / Loans ---------- */

export type FacilityType = "revolving" | "term" | "receivables";

export interface FacilityMovement {
  date: string;
  description: string;
  amount: number;
  currency: string;
}

export interface LoanFacility {
  ref: string;
  kindLabel: string;
  type: FacilityType;
  currency: "EUR" | "USD" | "AED";
  limit: number;
  outstanding: number;
  /** Interest rate basis, e.g. "3M EIBOR + 2.10%". */
  rateBasis: string;
  /** Current all-in rate, e.g. "6.25% p.a.". */
  currentRate: string;
  openedAt: string;
  expiry: string;
  security: string;
  /** Facility-specific servicing note. */
  servicingNote?: string;
  /** Next contractual debit. */
  nextPayment: {
    date: string;
    amount: number;
    description: string;
  };
  /** Recent movements (interest debits, installments, repayments). */
  movements: FacilityMovement[];
  /** Extra data rows shown on the facility card (label/value). */
  extras?: { label: string; value: string }[];
}

/* ---------- Deposits ---------- */

export type DepositKind = "term" | "call";

export interface Deposit {
  ref: string;
  kind: DepositKind;
  kindLabel: string;
  currency: "EUR" | "USD" | "AED";
  principal: number;
  /** e.g. "4.45% p.a. fixed". */
  rate: string;
  /** ISO value date. */
  placedAt: string;
  /** ISO maturity (term deposits). */
  maturity?: string;
  /** Interest payable at maturity (term deposits). */
  interestAtMaturity?: number;
  /** Accrued / last credited interest (call deposits). */
  lastInterestCredit?: { amount: number; date: string };
  /** Instruction applied automatically at maturity. */
  rollover: string;
  status: "Active" | "Matured";
  /** Restriction note tied to the compliance case, if any. */
  note?: string;
}
