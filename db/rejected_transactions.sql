-- ============================================================
-- Dodajemo 'Rejected' transakcije posle blokade
-- Banka sme naplatiti samo svoje naknade (maintenance, compliance fee).
-- Svi pokušaji transfera/operacija su REJECTED sa razlogom.
-- ============================================================

SET search_path TO mawj_trade_finance, public;

-- Obriši postojeće post-blokade transakcije (da ih zamenimo)
DELETE FROM mawj_trade_finance.transactions
WHERE profile_id = '11111111-1111-1111-1111-111111111111'
  AND occurred_at >= '2026-03-15T00:00:00Z'
  AND counterparty != 'Trafigura Pte Ltd';

-- Zadržavamo:
-- 1. 15. mart — €18.5M Trafigura BLOKIRAN (Processing)
-- 2. Bankarske naknade (banka sme naplaćivati)

INSERT INTO mawj_trade_finance.transactions (profile_id, account_id, type, counterparty, category, amount, currency, occurred_at, method, reference, status, logo, color_tone, memo) VALUES
-- Bankarske naknade (banka sme naplaćivati čak i na blokiranom računu)
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Compliance Review Fee',500.00,'EUR','2026-03-18T08:00:00','LOCAL','REF-MWJ-880090','Settled','CB','slate','One-time AML/CFT review fee — Case CBI-CMP-2026-0047'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-04-01T08:00:00','LOCAL','REF-MWJ-880091','Settled','CB','slate','Corporate treasury account — April 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-05-01T08:00:00','LOCAL','REF-MWJ-880092','Settled','CB','slate','Corporate treasury account — May 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-06-01T08:00:00','LOCAL','REF-MWJ-880093','Settled','CB','slate','Corporate treasury account — June 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-07-01T08:00:00','LOCAL','REF-MWJ-880094','Settled','CB','slate','Corporate treasury account — July 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-08-01T08:00:00','LOCAL','REF-MWJ-880095','Settled','CB','slate','Corporate treasury account — August 2026'),

-- REJECTED transakcije — pokušaji operacija koji su ODBIJENI zbog complajns blokade
-- Ovo su realni pokušaji koje je klijent pokušao, ali su odbijeni.
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Glencore International AG','Trade Settlement — Copper (REJECTED)',980000.00,'EUR','2026-03-22T14:30:00','SEPA','REF-MWJ-880110','Rejected','GC','slate','Incoming settlement REFUSED — account restricted. Held pending compliance resolution (Case CBI-CMP-2026-0047).'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Container Freight (REJECTED)',78400.00,'EUR','2026-04-05T11:20:00','SEPA','REF-MWJ-880111','Rejected','CM','blue','Outgoing payment REFUSED — account restricted pending AML review. Booking DLJ-4299 held.'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','Mitsui & Co Ltd','Documentary Collection (REJECTED)',542300.00,'EUR','2026-04-18T09:30:00','SWIFT','REF-MWJ-880112','Rejected','MT','indigo','USD account outgoing REFUSED — all accounts linked to Aspidus DMCC restricted pending compliance. D/A 90 days held.'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Dubai Customs','Import Duty Settlement (REJECTED)',94200.00,'EUR','2026-05-12T16:20:00','LOCAL','REF-MWJ-880113','Rejected','DC','amber','Customs payment REFUSED — treasury account frozen. Consignment C-77231 held at port pending duty settlement.'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','DP World','Terminal Handling (REJECTED)',38400.00,'EUR','2026-06-08T08:50:00','LOCAL','REF-MWJ-880114','Rejected','DP','amber','AED operating account outgoing REFUSED — linked to restricted EUR treasury. JAFZA storage fees unpaid, container held.'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Aramco Trading Co','Export Settlement (REJECTED)',2745000.00,'EUR','2026-07-14T12:35:00','SWIFT','REF-MWJ-880115','Rejected','AT','slate','Incoming export proceeds REFUSED — bank cannot credit restricted account. Funds returned to sender (ARAMCO-2291).');

-- Balans ostaje €124,583,921.45 (rejected transakcije ne menjaju stanje)
SELECT 'rejected_transactions_added' AS status,
  (SELECT count(*) FROM mawj_trade_finance.transactions WHERE status = 'Rejected') AS rejected,
  (SELECT count(*) FROM mawj_trade_finance.transactions WHERE status = 'Settled' AND occurred_at >= '2026-03-15') AS settled_post_block,
  (SELECT count(*) FROM mawj_trade_finance.transactions WHERE status = 'Processing') AS blocked,
  (SELECT count(*) FROM mawj_trade_finance.transactions) AS total;
