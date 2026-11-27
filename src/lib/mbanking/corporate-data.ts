/**
 * Corporate banking demo data — Trade Finance, Credit Facilities, Deposits.
 *
 * LOGICAL RULES (must stay consistent with the funds-blocked scenario
 * CBI-CMP-2026-0047 — €18,500,000 blocked since 2026-03-15, all outgoing
 * transfers suspended):
 *   1. Every instrument was issued / granted / placed BEFORE 2026-03-15.
 *   2. Anything requiring an outgoing payment AFTER 2026-03-15 is
 *      marked held / suspended pending compliance release.
 *   3. Bank-side charges (commissions, facility interest, loan installments
 *      debited under standing facility agreements) continue — same legal
 *      basis as the account-maintenance charges that continue while blocked.
 *   4. Inward proceeds (export LC payment, accepted export collections,
 *      deposit interest credits) are NOT affected by the transfer suspension.
 */

import type { Deposit, LoanFacility, TradeInstrument } from "./corporate-types";

/* ============================================================
   TRADE FINANCE — Letters of Credit, Guarantees, Collections
   ============================================================ */

export const TRADE_INSTRUMENTS: TradeInstrument[] = [
  /* ---------- Import Letters of Credit ---------- */
  {
    ref: "LC-IMP-88421",
    kind: "import-lc",
    kindLabel: "Import Letter of Credit",
    status: "Active",
    statusTone: "active",
    currency: "EUR",
    amount: 4_200_000,
    utilized: 2_436_000,
    beneficiary: "Trafigura Pte Ltd",
    beneficiaryCountry: "Singapore",
    goods: "Copper Cathode LME Grade A — 2,000 MT",
    openedAt: "2026-01-12",
    expiry: "2026-12-15",
    tenor: "At sight",
    incoterms: "CIF Jebel Ali",
    loadingPort: "Antwerp, Belgium",
    dischargePort: "Jebel Ali, UAE",
    latestShipment: "2026-11-30",
    partialShipments: "Allowed",
    transferable: false,
    marginPct: 0.2,
    charge: {
      rate: "0.85% p.a.",
      basis: "on issued amount, debited quarterly",
      nextDebit: "2026-12-15",
      amount: 8_925,
    },
    documentsRequired: [
      "Full set clean on-board Bill of Lading",
      "Commercial Invoice",
      "Packing List / Weight Certificate",
      "Certificate of Origin",
      "SGS Inspection Certificate",
    ],
    events: [
      {
        date: "2026-01-12",
        title: "LC issued",
        description:
          "Issued in favour of Trafigura Pte Ltd for EUR 4,200,000. Cash margin EUR 840,000 (20%) retained.",
      },
      {
        date: "2026-02-24",
        title: "Drawing 1 settled — EUR 1,218,000",
        description:
          "Documents presented for 1,000 MT; compliant documents paid at sight.",
      },
      {
        date: "2026-03-03",
        title: "Drawing 2 settled — EUR 1,218,000",
        description:
          "Second presentation for 1,000 MT paid at sight. Utilization now EUR 2,436,000.",
      },
      {
        date: "2026-11-14",
        title: "Final presentation — payment held",
        description:
          "Documents for the final 1,000 MT tranche received. Settlement is held pending compliance release (CBI-CMP-2026-0047).",
      },
    ],
    complianceNote:
      "Presented drawings after 15 Mar 2026 settle only after compliance release. Remaining LC commitment EUR 1,764,000.",
  },
  {
    ref: "LC-IMP-88376",
    kind: "import-lc",
    kindLabel: "Import Letter of Credit",
    status: "Utilized",
    statusTone: "done",
    currency: "USD",
    amount: 2_850_000,
    utilized: 2_850_000,
    beneficiary: "Mitsubishi Corporation",
    beneficiaryCountry: "Japan",
    goods: "Aluminium Rolling-Mill Line — 1 complete unit",
    openedAt: "2025-12-05",
    expiry: "2026-09-30",
    tenor: "At sight",
    incoterms: "FOB Kobe",
    loadingPort: "Kobe, Japan",
    dischargePort: "Jebel Ali, UAE",
    latestShipment: "2026-08-15",
    partialShipments: "Not allowed",
    transferable: false,
    marginPct: 0.25,
    charge: {
      rate: "0.95% p.a.",
      basis: "on issued amount, final commission debited 30 Sep 2026",
      nextDebit: "2026-09-30",
      amount: 6_769,
    },
    documentsRequired: [
      "Full set clean on-board Bill of Lading",
      "Commercial Invoice",
      "Packing List",
      "Mill Test Certificates",
      "Pre-shipment Inspection Certificate",
    ],
    events: [
      {
        date: "2025-12-05",
        title: "LC issued",
        description:
          "Issued for USD 2,850,000 for the rolling-mill supply contract. Cash margin 25% retained.",
      },
      {
        date: "2026-02-10",
        title: "Full drawing settled — USD 2,850,000",
        description:
          "Single presentation under the LC; documents compliant and paid at sight.",
      },
      {
        date: "2026-06-18",
        title: "Installation acceptance",
        description:
          "Provisional acceptance certificate signed; warranty bond issued separately.",
      },
      {
        date: "2026-09-30",
        title: "LC expired — fully utilized",
        description:
          "LC utilization 100%. Instrument closed at expiry; no outstanding commitment.",
      },
    ],
  },

  /* ---------- Export Letters of Credit (advised to Aspidus as beneficiary) ---------- */
  {
    ref: "LC-EXP-22014",
    kind: "export-lc",
    kindLabel: "Export Letter of Credit (Advised)",
    status: "Payment Due",
    statusTone: "info",
    currency: "EUR",
    amount: 3_150_000,
    utilized: 3_150_000,
    beneficiary: "Aurubis AG",
    beneficiaryCountry: "Germany",
    issuingBank: "Standard Chartered Bank — Frankfurt",
    goods: "Copper Cathode — 1,900 MT",
    openedAt: "2026-09-28",
    expiry: "2026-12-20",
    tenor: "At sight",
    incoterms: "CIF Hamburg",
    loadingPort: "Jebel Ali, UAE",
    dischargePort: "Hamburg, Germany",
    latestShipment: "2026-11-30",
    partialShipments: "Not allowed",
    transferable: false,
    documentsRequired: [
      "Full set clean on-board Bill of Lading",
      "Commercial Invoice",
      "Certificate of Origin",
      "SGS Quality & Weight Certificate",
    ],
    events: [
      {
        date: "2026-09-28",
        title: "LC advised",
        description:
          "Irrevocable sight LC advised through CBI Trade Finance Operations, favouring Aspidus DMCC as beneficiary.",
      },
      {
        date: "2026-11-10",
        title: "Shipment dispatched",
        description:
          "1,900 MT copper cathode shipped from Jebel Ali to Hamburg under the LC.",
      },
      {
        date: "2026-11-18",
        title: "Documents presented",
        description:
          "Full document set presented to CBI; forwarded to the issuing bank.",
      },
      {
        date: "2026-11-20",
        title: "Documents verified compliant",
        description:
          "Presentation checked compliant. Sight payment of EUR 3,150,000 expected on 02 Dec 2026.",
      },
    ],
    complianceNote:
      "Inward proceeds are not affected by the outgoing-transfer suspension — payment expected 02 Dec 2026.",
  },

  /* ---------- Letters of Guarantee ---------- */
  {
    ref: "LG-PERF-0092",
    kind: "lg-performance",
    kindLabel: "Performance Bond",
    status: "Active",
    statusTone: "active",
    currency: "AED",
    amount: 7_350_000,
    utilized: 7_350_000,
    beneficiary: "Etihad Rail PJSC",
    beneficiaryCountry: "UAE",
    goods: "Rail Freight Corridor Supply Contract ERS-C-218",
    openedAt: "2026-02-10",
    expiry: "2027-02-09",
    tenor: "First demand, unconditional",
    marginPct: 0.1,
    charge: {
      rate: "0.55% p.a.",
      basis: "on guarantee value, debited quarterly",
      nextDebit: "2027-02-09",
      amount: 10_106,
    },
    events: [
      {
        date: "2026-02-10",
        title: "Bond issued",
        description:
          "Performance bond AED 7,350,000 issued to Etihad Rail PJSC against contract award. Cash margin 10% retained.",
      },
      {
        date: "2026-07-14",
        title: "Stage-1 completion certified",
        description:
          "Stage-1 milestones certified by the employer's engineer; bond maintained at full value.",
      },
      {
        date: "2026-08-10",
        title: "Quarterly commission debited",
        description: "AED 10,106 commission debited under the standing issuance agreement.",
      },
    ],
    complianceNote:
      "Guarantees in force remain valid. Bank commissions continue to be debited under the standing issuance agreement.",
  },
  {
    ref: "LG-ADV-0031",
    kind: "lg-advance",
    kindLabel: "Advance Payment Guarantee",
    status: "Expiring Soon",
    statusTone: "warning",
    currency: "AED",
    amount: 3_000_000,
    utilized: 1_800_000,
    beneficiary: "Aldar Properties PJSC",
    beneficiaryCountry: "UAE",
    goods: "Fit-out & Equipment Supply Contract ALD-7741",
    openedAt: "2025-12-20",
    expiry: "2026-12-19",
    tenor: "First demand, unconditional",
    marginPct: 0,
    charge: {
      rate: "0.50% p.a.",
      basis: "on outstanding guarantee value, debited quarterly",
      nextDebit: "2026-12-19",
      amount: 2_250,
    },
    events: [
      {
        date: "2025-12-20",
        title: "Guarantee issued",
        description:
          "Advance payment guarantee AED 3,000,000 issued after receipt of the 10% contract advance from the employer.",
      },
      {
        date: "2026-06-15",
        title: "20% released",
        description: "AED 600,000 released against milestone certificate No. 1.",
      },
      {
        date: "2026-09-20",
        title: "20% released",
        description: "AED 600,000 released against milestone certificate No. 2. Outstanding value AED 1,800,000.",
      },
      {
        date: "2026-12-19",
        title: "Auto-expiry",
        description:
          "Guarantee expires automatically if no claim is lodged; remaining value extinguishes.",
      },
    ],
  },

  /* ---------- Documentary Collections ---------- */
  {
    ref: "DOC-COL-1180",
    kind: "collection-import",
    kindLabel: "Import Documentary Collection",
    status: "Documents Held",
    statusTone: "danger",
    currency: "EUR",
    amount: 1_820_000,
    utilized: 1_820_000,
    beneficiary: "POSCO",
    beneficiaryCountry: "South Korea",
    goods: "Cold-Rolled Steel Coils — 3,150 MT",
    openedAt: "2026-10-12",
    expiry: "2026-12-11",
    tenor: "D/P 60 days",
    incoterms: "FOB Pohang",
    loadingPort: "Pohang, South Korea",
    dischargePort: "Jebel Ali, UAE",
    partialShipments: "Not allowed",
    events: [
      {
        date: "2026-10-12",
        title: "Collection received",
        description:
          "Financial and commercial documents received from the remitting bank for D/P 60 days collection.",
      },
      {
        date: "2026-11-02",
        title: "Cargo arrived",
        description:
          "3,150 MT cold-rolled steel coils arrived at Jebel Ali. Delivery order withheld — documents release only against payment.",
      },
      {
        date: "2026-11-25",
        title: "Payment due 11 Dec — suspended",
        description:
          "Payment instruction suspended pending compliance release (CBI-CMP-2026-0047). Storage charges accruing at the port.",
      },
    ],
    complianceNote:
      "Documents are held by CBI; the EUR 1,820,000 payment is suspended pending compliance release. Inward storage costs continue to accrue.",
  },
  {
    ref: "DOC-COL-2201",
    kind: "collection-export",
    kindLabel: "Export Documentary Collection",
    status: "Accepted",
    statusTone: "done",
    currency: "EUR",
    amount: 940_000,
    utilized: 940_000,
    beneficiary: "Boliden AB",
    beneficiaryCountry: "Sweden",
    issuingBank: "Svenska Handelsbanken — Stockholm",
    goods: "Zinc Concentrate — 850 MT",
    openedAt: "2026-11-05",
    expiry: "2026-12-20",
    tenor: "D/A 30 days",
    incoterms: "FOB Jebel Ali",
    loadingPort: "Jebel Ali, UAE",
    dischargePort: "Skellefteå, Sweden",
    partialShipments: "Not allowed",
    events: [
      {
        date: "2026-11-05",
        title: "Documents drawn",
        description:
          "Documents forwarded for collection on D/A 30 days terms after shipment of 850 MT zinc concentrate.",
      },
      {
        date: "2026-11-20",
        title: "Accepted by drawee",
        description:
          "Boliden AB accepted the documents. Maturity date 20 Dec 2026 — proceeds credited inward.",
      },
    ],
    complianceNote:
      "Inward proceeds at maturity are not affected by the outgoing-transfer suspension.",
  },

  /* ---------- Trust Receipts ---------- */
  {
    ref: "TR-5521",
    kind: "trust-receipt",
    kindLabel: "Trust Receipt",
    status: "Settled",
    statusTone: "done",
    currency: "USD",
    amount: 1_450_000,
    utilized: 1_450_000,
    beneficiary: "CBI Trade Finance Operations",
    beneficiaryCountry: "UAE",
    goods: "Aluminium Ingots — 620 MT (released cargo)",
    openedAt: "2026-01-05",
    expiry: "2026-03-04",
    tenor: "60 days, clean-up on cargo proceeds",
    charge: {
      rate: "5.90% p.a.",
      basis: "on outstanding amount for actual days",
      nextDebit: "2026-03-02",
      amount: 14_333,
    },
    events: [
      {
        date: "2026-01-05",
        title: "Goods released",
        description:
          "Cargo released from the import collection against trust receipt USD 1,450,000 pending payment from domestic sale proceeds.",
      },
      {
        date: "2026-03-02",
        title: "Trust receipt settled",
        description:
          "Settled in full USD 1,450,000 plus interest USD 14,333 from cargo sale proceeds, two days before due date.",
      },
    ],
  },
];

/* ============================================================
   CREDIT FACILITIES / LOANS
   ============================================================ */

export const LOAN_FACILITIES: LoanFacility[] = [
  {
    ref: "FAC-WCF-001",
    kindLabel: "Revolving Working Capital Facility",
    type: "revolving",
    currency: "USD",
    limit: 12_000_000,
    outstanding: 6_400_000,
    rateBasis: "3M EIBOR + 2.10%",
    currentRate: "6.25% p.a.",
    openedAt: "2025-10-15",
    expiry: "2027-06-30",
    security:
      "Corporate guarantee of Aspidus DMCC, assignment of trade receivables and lien over USD Reserve Holding account",
    servicingNote:
      "Interest is debited quarterly by the bank under the standing facility agreement — not affected by the transfer suspension.",
    nextPayment: {
      date: "2026-12-31",
      amount: 100_000,
      description: "Quarterly interest on USD 6,400,000 outstanding",
    },
    movements: [
      {
        date: "2025-10-15",
        description: "Drawdown — initial utilisation",
        amount: 9_400_000,
        currency: "USD",
      },
      {
        date: "2026-02-20",
        description: "Principal repayment from export proceeds",
        amount: 3_000_000,
        currency: "USD",
      },
      {
        date: "2026-06-30",
        description: "Interest debit (quarterly)",
        amount: 100_000,
        currency: "USD",
      },
      {
        date: "2026-09-30",
        description: "Interest debit (quarterly)",
        amount: 100_000,
        currency: "USD",
      },
    ],
  },
  {
    ref: "FAC-TL-2025-04",
    kindLabel: "Term Loan — Equipment & Facility Fit-out",
    type: "term",
    currency: "AED",
    limit: 25_000_000,
    outstanding: 20_000_000,
    rateBasis: "Fixed",
    currentRate: "5.75% p.a.",
    openedAt: "2025-11-05",
    expiry: "2030-11-05",
    security:
      "First mortgage over DMCC business facility, hypothecation of plant & machinery",
    servicingNote:
      "Monthly installments are debited by direct debit under the facility agreement (principal + interest). 12 of 60 installments debited to date.",
    nextPayment: {
      date: "2026-12-05",
      amount: 512_500,
      description: "Installment 13 of 60 — principal AED 416,667 + interest AED 95,833",
    },
    movements: [
      {
        date: "2025-11-05",
        description: "Disbursement of term loan",
        amount: 25_000_000,
        currency: "AED",
      },
      {
        date: "2026-09-05",
        description: "Installment 10 — principal 416,667 + interest 99,826",
        amount: 516_493,
        currency: "AED",
      },
      {
        date: "2026-10-05",
        description: "Installment 11 — principal 416,667 + interest 97,854",
        amount: 514_521,
        currency: "AED",
      },
      {
        date: "2026-11-05",
        description: "Installment 12 — principal 416,667 + interest 95,833",
        amount: 512_500,
        currency: "AED",
      },
    ],
    extras: [
      { label: "Tenor", value: "60 months" },
      { label: "Installments debited", value: "12 of 60" },
      { label: "Principal per installment", value: "AED 416,667" },
    ],
  },
  {
    ref: "FAC-IDF-002",
    kindLabel: "Invoice Discounting Facility (with recourse)",
    type: "receivables",
    currency: "EUR",
    limit: 8_000_000,
    outstanding: 3_240_000,
    rateBasis: "3M EURIBOR + 1.95%",
    currentRate: "5.45% p.a.",
    openedAt: "2025-12-01",
    expiry: "2027-03-31",
    security: "Assignment of invoiced trade receivables, general corporate guarantee",
    servicingNote:
      "Discount charges are debited monthly under the facility agreement. Utilisation reduces automatically as buyers settle invoices inward.",
    nextPayment: {
      date: "2026-12-04",
      amount: 1_180_000,
      description: "Inward settlement of discounted invoices — EUR 1,180,000 expected (buyer payment, inward)",
    },
    movements: [
      {
        date: "2026-09-30",
        description: "Discount charge — September",
        amount: 12_840,
        currency: "EUR",
      },
      {
        date: "2026-10-31",
        description: "Discount charge — October",
        amount: 12_840,
        currency: "EUR",
      },
    ],
    extras: [
      { label: "Advance rate", value: "85% of invoice face" },
      { label: "Average ageing", value: "38 days" },
    ],
  },
];

/* ============================================================
   DEPOSITS / INVESTMENTS
   ============================================================ */

export const DEPOSITS: Deposit[] = [
  {
    ref: "TD-2026-0117",
    kind: "term",
    kindLabel: "Term Deposit",
    currency: "USD",
    principal: 20_000_000,
    rate: "4.45% p.a. fixed",
    placedAt: "2026-01-27",
    maturity: "2027-01-27",
    interestAtMaturity: 890_000,
    rollover: "Auto-renew principal + interest at the prevailing board rate",
    status: "Active",
  },
  {
    ref: "TD-2026-0042",
    kind: "term",
    kindLabel: "Term Deposit",
    currency: "EUR",
    principal: 15_000_000,
    rate: "3.75% p.a. fixed",
    placedAt: "2026-02-05",
    maturity: "2027-02-05",
    interestAtMaturity: 562_500,
    rollover: "Credit principal + interest to EUR Main Treasury at maturity",
    status: "Active",
    note: "If account restrictions persist at maturity, proceeds are credited to the restricted EUR account pending compliance release.",
  },
  {
    ref: "CD-2026-0008",
    kind: "call",
    kindLabel: "Call Deposit",
    currency: "USD",
    principal: 5_000_000,
    rate: "3.10% p.a. variable",
    placedAt: "2026-01-08",
    rollover: "Withdrawable on 48 hours' written notice",
    status: "Active",
    lastInterestCredit: { amount: 12_917, date: "2026-11-08" },
    note: "Withdrawal instructions are currently suspended pending compliance review (CBI-CMP-2026-0047). Interest continues to accrue.",
  },
];
