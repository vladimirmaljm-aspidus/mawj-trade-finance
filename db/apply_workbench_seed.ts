/**
 * db/apply_workbench_seed.ts — run with `bun db/apply_workbench_seed.ts`
 *
 * Inserts the corporate workbench demo rows (maker-checker approvals,
 * scheduled/standing transfers, cheque book + register, matching statement
 * rows) through the Supabase REST views. Idempotent: existing references
 * are deleted first.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PROFILE_ID = "11111111-1111-1111-1111-111111111111";
const EUR = "22222222-0001-0001-0001-000000000001";
const USD = "22222222-0002-0002-0002-000000000002";
const AED = "22222222-0003-0003-0003-000000000003";

const sb = createClient(url, key, { auth: { persistSession: false } });

type Row = Record<string, unknown>;

const rows: Row[] = [
  // ---------------- Pending approvals ----------------
  {
    profile_id: PROFILE_ID,
    account_id: EUR,
    type: "expense",
    counterparty: "Glencore International AG",
    category: "Approval",
    amount: 180000,
    currency: "EUR",
    occurred_at: "2026-11-26T09:14:00Z",
    method: "SWIFT",
    reference: "APR-778201",
    status: "Pending Approval",
    logo: "GL",
    color_tone: "slate",
    memo: JSON.stringify({
      kind: "payment",
      maker: "E. Petrova",
      submitted: "2026-11-26T09:14:00Z",
      beneficiary: "Glencore International AG",
      iban: "CH93 0076 2011 6238 5295 7",
      method: "SWIFT",
      purpose: "Copper concentrate shipment CX-118 — invoice INV-1184",
      note: "Second tranche under the pre-blocked supply contract.",
    }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "LC Margin Deposit — LC-IMP-88421",
    category: "Approval",
    amount: 350000,
    currency: "AED",
    occurred_at: "2026-11-25T16:40:00Z",
    method: "LOCAL",
    reference: "APR-778202",
    status: "Pending Approval",
    logo: "CB",
    color_tone: "indigo",
    memo: JSON.stringify({
      kind: "payment",
      maker: "E. Petrova",
      submitted: "2026-11-25T16:40:00Z",
      beneficiary: "CBI — LC Margin Deposit (Internal)",
      iban: "Internal Transfer",
      method: "LOCAL",
      purpose: "Margin top-up for LC-IMP-88421 (Trafigura final tranche)",
      note: "Internal transfer between own ledger accounts.",
    }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Nakheel Properties PJSC",
    category: "Beneficiary Activation",
    amount: 0,
    currency: "AED",
    occurred_at: "2026-11-24T11:05:00Z",
    method: "LOCAL",
    reference: "APR-778203",
    status: "Pending Approval",
    logo: "NP",
    color_tone: "amber",
    memo: JSON.stringify({
      kind: "beneficiary",
      maker: "E. Petrova",
      submitted: "2026-11-24T11:05:00Z",
      beneficiary: "Nakheel Properties PJSC",
      iban: "AE47 0260 0000 2314 8850 102",
      country: "United Arab Emirates",
      method: "LOCAL",
      note: "Recurring tenant service-charge settlements — Zone 4 premises.",
    }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Commercial Bank International",
    category: "Cheque Book",
    amount: 0,
    currency: "AED",
    occurred_at: "2026-11-24T09:30:00Z",
    method: "LOCAL",
    reference: "APR-778204",
    status: "Pending Approval",
    logo: "CB",
    color_tone: "slate",
    memo: JSON.stringify({
      kind: "chequebook",
      maker: "E. Petrova",
      submitted: "2026-11-24T09:30:00Z",
      account: "AED Operating Account",
      leaves: 50,
      delivery: "Branch pickup — Deira Main",
    }),
  },

  // ---------------- Decision history ----------------
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Emirates Global Aluminium",
    category: "Approval",
    amount: 340000,
    currency: "AED",
    occurred_at: "2026-02-18T10:22:00Z",
    method: "LOCAL",
    reference: "APR-777101",
    status: "Approved",
    logo: "EG",
    color_tone: "emerald",
    memo: JSON.stringify({
      kind: "payment",
      maker: "E. Petrova",
      submitted: "2026-02-18T10:22:00Z",
      beneficiary: "Emirates Global Aluminium",
      iban: "AE02 0334 0400 0001 0080 1",
      method: "LOCAL",
      purpose: "Smelter alloy supply Q1 — PO 4482",
      checker: "V. Maljm",
      decided: "2026-02-18T14:05:00Z",
      executed_ref: "REF-MWJ-885711",
    }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: USD,
    type: "expense",
    counterparty: "Noor Bank — Trade Finance Settlement",
    category: "Approval",
    amount: 95000,
    currency: "USD",
    occurred_at: "2026-02-10T15:44:00Z",
    method: "SWIFT",
    reference: "APR-776998",
    status: "Rejected",
    logo: "NB",
    color_tone: "purple",
    memo: JSON.stringify({
      kind: "payment",
      maker: "E. Petrova",
      submitted: "2026-02-10T15:44:00Z",
      beneficiary: "Noor Bank — Trade Finance Settlement",
      iban: "AE77 0130 0000 5566 8890 011",
      method: "SWIFT",
      purpose: "LC settlement early-remittance discount",
      checker: "V. Maljm",
      decided: "2026-02-10T17:22:00Z",
      reason: "FX settlement date does not match the underlying contract — returned to maker.",
    }),
  },

  // ---------------- Scheduled / standing transfers ----------------
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "DP World UAE Region",
    category: "Standing Order",
    amount: 45000,
    currency: "AED",
    occurred_at: "2026-12-05T06:00:00Z",
    method: "LOCAL",
    reference: "SCH-662301",
    status: "Scheduled",
    logo: "DP",
    color_tone: "amber",
    memo: JSON.stringify({
      kind: "standing",
      beneficiary: "DP World UAE Region",
      iban: "AE02 0334 0400 0001 0080 1",
      frequency: "Monthly on the 5th",
      next: "2026-12-05",
      purpose: "Jebel Ali terminal handling — standing agreement THA-19",
    }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: USD,
    type: "expense",
    counterparty: "Etihad Cargo LLC",
    category: "Scheduled Transfer",
    amount: 78500,
    currency: "USD",
    occurred_at: "2026-12-01T06:00:00Z",
    method: "SWIFT",
    reference: "SCH-662288",
    status: "Scheduled",
    logo: "EC",
    color_tone: "blue",
    memo: JSON.stringify({
      kind: "scheduled",
      beneficiary: "Etihad Cargo LLC",
      iban: "AE66 0260 0000 1234 5678 901",
      on: "2026-12-01",
      purpose: "Freight AWB 176-8842 — scheduled settlement",
    }),
  },

  // ---------------- Cheque book + register ----------------
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Commercial Bank International",
    category: "Cheque Book",
    amount: 0,
    currency: "AED",
    occurred_at: "2026-08-20T10:00:00Z",
    method: "LOCAL",
    reference: "CHQ-BOOK-441",
    status: "Issued",
    logo: "CB",
    color_tone: "slate",
    memo: JSON.stringify({
      kind: "book",
      account: "AED Operating Account",
      series: "000301–000350",
      leaves: 50,
      requested: "2026-08-14",
      issued: "2026-08-20",
      delivery: "Branch pickup — Deira Main",
    }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Emirates Steel",
    category: "Cheque",
    amount: 85000,
    currency: "AED",
    occurred_at: "2026-02-12T00:00:00Z",
    method: "LOCAL",
    reference: "CHQ-000316",
    status: "Cleared",
    logo: "ES",
    color_tone: "indigo",
    memo: JSON.stringify({ kind: "cheque", book: "CHQ-BOOK-441", cheque_no: "000316", payee: "Emirates Steel" }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "DNATA Travel",
    category: "Cheque",
    amount: 42500,
    currency: "AED",
    occurred_at: "2026-02-28T00:00:00Z",
    method: "LOCAL",
    reference: "CHQ-000317",
    status: "Cleared",
    logo: "DT",
    color_tone: "amber",
    memo: JSON.stringify({ kind: "cheque", book: "CHQ-BOOK-441", cheque_no: "000317", payee: "DNATA Travel" }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Dulsco",
    category: "Cheque",
    amount: 12800,
    currency: "AED",
    occurred_at: "2026-11-20T00:00:00Z",
    method: "LOCAL",
    reference: "CHQ-000319",
    status: "Issued",
    logo: "DU",
    color_tone: "emerald",
    memo: JSON.stringify({ kind: "cheque", book: "CHQ-BOOK-441", cheque_no: "000319", payee: "Dulsco" }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Dubai Municipality",
    category: "Cheque",
    amount: 9450,
    currency: "AED",
    occurred_at: "2026-11-24T00:00:00Z",
    method: "LOCAL",
    reference: "CHQ-000320",
    status: "Returned",
    logo: "DM",
    color_tone: "purple",
    memo: JSON.stringify({
      kind: "cheque",
      book: "CHQ-BOOK-441",
      cheque_no: "000320",
      payee: "Dubai Municipality",
      note: "Presented 24 Nov — returned unpaid (account restriction CBI-CMP-2026-0047).",
    }),
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Al Nabooda Construction",
    category: "Cheque",
    amount: 22750,
    currency: "AED",
    occurred_at: "2026-11-15T00:00:00Z",
    method: "LOCAL",
    reference: "CHQ-000321",
    status: "Stopped",
    logo: "AN",
    color_tone: "blue",
    memo: JSON.stringify({
      kind: "cheque",
      book: "CHQ-BOOK-441",
      cheque_no: "000321",
      payee: "Al Nabooda Construction",
      note: "Stop payment issued 15 Nov — cheque lost in transit.",
    }),
  },

  // ---------------- Statement rows (visible in feed) ----------------
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Emirates Steel",
    category: "Cheque Payment",
    amount: 85000,
    currency: "AED",
    occurred_at: "2026-02-12T08:00:00Z",
    method: "LOCAL",
    reference: "CHQ-000316",
    status: "Settled",
    logo: "ES",
    color_tone: "indigo",
    memo: "Cheque No. 000316 — cleared 12 Feb 2026",
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "DNATA Travel",
    category: "Cheque Payment",
    amount: 42500,
    currency: "AED",
    occurred_at: "2026-02-28T08:00:00Z",
    method: "LOCAL",
    reference: "CHQ-000317",
    status: "Settled",
    logo: "DT",
    color_tone: "amber",
    memo: "Cheque No. 000317 — cleared 28 Feb 2026",
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Commercial Bank International",
    category: "Cheque Stop Fee",
    amount: 105,
    currency: "AED",
    occurred_at: "2026-11-15T08:00:00Z",
    method: "LOCAL",
    reference: "REF-MWJ-885803",
    status: "Settled",
    logo: "CB",
    color_tone: "slate",
    memo: "Stop payment order — cheque 000321 (Al Nabooda Construction)",
  },
  {
    profile_id: PROFILE_ID,
    account_id: AED,
    type: "expense",
    counterparty: "Emirates Global Aluminium",
    category: "Local Transfer",
    amount: 340000,
    currency: "AED",
    occurred_at: "2026-02-18T08:00:00Z",
    method: "LOCAL",
    reference: "REF-MWJ-885711",
    status: "Settled",
    logo: "EG",
    color_tone: "emerald",
    memo: "Executed via dual authorization APR-777101",
  },
];

async function main() {
  // Idempotent: remove any previous rows with these references.
  const refs = rows.map((r) => r.reference as string);
  const { error: delErr } = await sb
    .from("transactions")
    .delete()
    .in("reference", refs);
  if (delErr) {
    console.error("cleanup failed:", delErr.message);
    process.exit(1);
  }

  const { error } = await sb.from("transactions").insert(rows);
  if (error) {
    console.error("insert failed:", error.message);
    process.exit(1);
  }

  const { count } = await sb
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .in("reference", refs);
  console.log(`workbench seed applied — ${count} rows now present`);
}

main();
