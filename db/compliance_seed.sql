-- ============================================================
-- Compliance case seed: Funds blocked since March, deadlines Aug 1 (missed) + Oct 2 (current)
-- ============================================================

SET search_path TO mawj_trade_finance, public;

-- Insert the case. Use fixed UUIDs so re-runs are idempotent.
INSERT INTO mawj_trade_finance.compliance_cases (
  id, profile_id, case_reference, title, reason, amount_blocked, currency,
  blocked_since, deadline_1, deadline_2, status, severity, progress_pct,
  regulator_note, assigned_officer, officer_role, officer_email, officer_phone
) VALUES (
  '44444444-0001-0001-0001-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'CBI-CMP-2026-0047',
  'Source of Funds Verification — Trade Finance Transaction',
  'A SWIFT transfer of €18,500,000 to Trafigura Pte Ltd (Singapore) for copper cathode purchase triggered an automated AML review. The transaction corridor and amount exceed the standard threshold for this account, requiring enhanced due diligence under UAE Central Bank AML/CFT guidelines (Circular No. 19/2024). All account outgoing capabilities are suspended pending submission and verification of the requested documentation.',
  18500000.00,
  'EUR',
  '2026-03-15T09:00:00Z',          -- blocked since March 15
  '2026-08-01T23:59:59Z',          -- first deadline (MISSED)
  '2026-10-02T23:59:59Z',          -- current / final deadline (Oct 2)
  'Awaiting Documents',
  'critical',
  33,
  'Failure to resolve by the final deadline may result in a Suspicious Activity Report (SAR) being filed with the UAE Financial Intelligence Unit (FIU) and potential account closure per UAE Central Bank AML/CFT regulations.',
  'Khalid Al-Rashid',
  'Senior Compliance Officer · CBI Financial Crime Unit',
  'compliance.khalid@cbi-uae.ae',
  '+971 4 555 0188'
)
ON CONFLICT (id) DO UPDATE SET
  case_reference   = EXCLUDED.case_reference,
  title            = EXCLUDED.title,
  reason           = EXCLUDED.reason,
  amount_blocked  = EXCLUDED.amount_blocked,
  blocked_since    = EXCLUDED.blocked_since,
  deadline_1       = EXCLUDED.deadline_1,
  deadline_2       = EXCLUDED.deadline_2,
  status           = EXCLUDED.status,
  severity         = EXCLUDED.severity,
  progress_pct     = EXCLUDED.progress_pct,
  regulator_note   = EXCLUDED.regulator_note,
  assigned_officer = EXCLUDED.assigned_officer,
  officer_role     = EXCLUDED.officer_role,
  officer_email    = EXCLUDED.officer_email,
  officer_phone    = EXCLUDED.officer_phone,
  updated_at       = now();

-- ---------- Required documents (6 total, 2 submitted) ----------
INSERT INTO mawj_trade_finance.compliance_documents (id, case_id, title, description, status, category, submitted_at, filename, due_date) VALUES
 ('55555555-0001-0001-0001-000000000001','44444444-0001-0001-0001-000000000001',
  'Trade License Renewal (DMCC)',
  'Current DMCC trade license showing Aspidus DMCC remains in good standing with active trade finance permissions.',
  'approved','CORPORATE','2026-04-02T11:30:00Z','Aspidus_DMCC_Trade_License_2026.pdf','2026-04-15T23:59:59Z'),

 ('55555555-0002-0002-0002-000000000002','44444444-0001-0001-0001-000000000001',
  'Board Resolution Authorizing Transaction',
  'Signed board resolution authorizing the €18.5M Trafigura transaction, including authorized signatory scope and beneficiary verification.',
  'submitted','CORPORATE','2026-06-18T14:20:00Z','Board_Resolution_TRAF-2024-1187.pdf','2026-06-30T23:59:59Z'),

 ('55555555-0003-0003-0003-000000000003','44444444-0001-0001-0001-000000000001',
  'Audited Financial Statements FY2025',
  'Full audited financial statements for fiscal year 2025, signed by an accredited auditor. Must include balance sheet, P&L, and cash flow statement.',
  'pending','KYC',NULL,NULL,'2026-09-15T23:59:59Z'),

 ('55555555-0004-0004-0004-000000000004','44444444-0001-0001-0001-000000000001',
  'Source of Funds Declaration',
  'Notarized declaration of the origin of the €18.5M funds, including supporting bank statements (3 months) and proof of legitimate business income.',
  'pending','SOURCE_OF_FUNDS',NULL,NULL,'2026-09-15T23:59:59Z'),

 ('55555555-0005-0005-0005-000000000005','44444444-0001-0001-0001-000000000001',
  'Beneficial Ownership Disclosure (UBO Form)',
  'Ultimate Beneficial Owner declaration form (UAE MoECD format), identifying all individuals with ≥25% ownership or control of Aspidus DMCC.',
  'pending','KYC',NULL,NULL,'2026-09-20T23:59:59Z'),

 ('55555555-0006-0006-0006-000000000006','44444444-0001-0001-0001-000000000001',
  'Transaction Invoices & Bills of Lading',
  'Commercial invoices, bills of lading, and customs declarations supporting the Trafigura copper cathode purchase (220 MT, Contract TRF-2024-1187).',
  'pending','TRANSACTION',NULL,NULL,'2026-09-20T23:59:59Z')
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description, status=EXCLUDED.status,
  category=EXCLUDED.category, submitted_at=EXCLUDED.submitted_at, filename=EXCLUDED.filename, due_date=EXCLUDED.due_date;

-- ---------- Timeline ----------
INSERT INTO mawj_trade_finance.compliance_timeline (id, case_id, occurred_at, title, description, actor, tone) VALUES
 ('66666666-0001-0001-0001-000000000001','44444444-0001-0001-0001-000000000001','2026-03-15T09:00:00Z',
  'Funds Blocked — Case Opened',
  'Compliance hold placed on all outgoing transfers. Case CBI-CMP-2026-0047 opened. €18,500,000 in treasury accounts flagged for enhanced due diligence.',
  'bank','danger'),
 ('66666666-0002-0002-0002-000000000002','44444444-0001-0001-0001-000000000001','2026-03-18T10:30:00Z',
  'Initial Document Request Issued',
  'CBI Financial Crime Unit issued formal request for 6 compliance documents. Deadline: 1 August 2026.',
  'bank','info'),
 ('66666666-0003-0003-0003-000000000003','44444444-0001-0001-0001-000000000001','2026-04-02T11:30:00Z',
  'Trade License Renewal Submitted',
  'DMCC trade license renewal uploaded and verified by compliance team.',
  'client','success'),
 ('66666666-0004-0004-0004-000000000004','44444444-0001-0001-0001-000000000001','2026-06-18T14:20:00Z',
  'Board Resolution Submitted',
  'Board resolution authorizing the transaction uploaded. Pending compliance review.',
  'client','info'),
 ('66666666-0005-0005-0005-000000000005','44444444-0001-0001-0001-000000000001','2026-08-01T23:59:59Z',
  'Deadline 1 Missed',
  'First compliance deadline passed. 4 of 6 required documents remain outstanding. Account restrictions remain in effect.',
  'bank','warning'),
 ('66666666-0006-0006-0006-000000000006','44444444-0001-0001-0001-000000000001','2026-08-03T09:00:00Z',
  'Final Deadline Extended — 2 October 2026',
  'CBI compliance review committee granted a final extension to 2 October 2026. Note: This is the final extension. Failure to submit all outstanding documentation by this date will result in escalation to the UAE Financial Intelligence Unit (FIU).',
  'bank','warning'),
 ('66666666-0007-0007-0007-000000000007','44444444-0001-0001-0001-000000000001','2026-08-10T08:00:00Z',
  'Reminder — Outstanding Documentation',
  'Automated reminder issued. 4 documents remain pending: Audited Financial Statements FY2025, Source of Funds Declaration, UBO Form, Transaction Invoices & Bills of Lading.',
  'system','info')
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description, actor=EXCLUDED.actor, tone=EXCLUDED.tone, occurred_at=EXCLUDED.occurred_at;

NOTIFY pgrst, 'reload schema';

SELECT 'compliance_seed_complete' AS status,
  (SELECT count(*) FROM mawj_trade_finance.compliance_cases) AS cases,
  (SELECT count(*) FROM mawj_trade_finance.compliance_documents) AS docs,
  (SELECT count(*) FROM mawj_trade_finance.compliance_timeline) AS events;
