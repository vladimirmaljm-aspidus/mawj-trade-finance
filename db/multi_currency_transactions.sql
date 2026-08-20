-- ============================================================
-- Dopuna: transakcije za USD i AED račune (sva 3 računa imaju istoriju)
-- USD Reserve Holding: trade settlements u USD, FX conversions
-- AED Operating Account: lokalni UAE troškovi, office, vozila, utilities
-- ============================================================

SET search_path TO mawj_trade_finance, public;

-- USD Reserve Holding ('22222222-0002-0002-0002-000000000002')
INSERT INTO mawj_trade_finance.transactions (profile_id, account_id, type, counterparty, category, amount, currency, occurred_at, method, reference, status, logo, color_tone, memo) VALUES
-- 2025
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','income','JPMorgan Chase NY','USD Trade Settlement — Steel',1850000.00,'USD','2025-08-22T15:30:00','SWIFT','REF-MWJ-880050','Settled','JP','blue','Contract JPM-2025-8841 / 1200 MT structural steel'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','Standard Chartered NY','FX Conversion USD→EUR',980000.00,'USD','2025-09-15T11:00:00','SWIFT','REF-MWJ-880051','Settled','SC','indigo','Convert USD reserve to EUR treasury'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','income','Cargill Inc','Grain Export Settlement',1240000.00,'USD','2025-10-18T13:45:00','SWIFT','REF-MWJ-880052','Settled','CG','slate','Contract CAR-2025-3091 / wheat export'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','HSBC New York','USD LC Confirmation Fee',4200.00,'USD','2025-11-12T10:00:00','SWIFT','REF-MWJ-880053','Settled','HS','emerald','LC HSBC-NY-2025-4451 confirmation'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','income','Bunge Limited','Soybean Settlement',980000.00,'USD','2025-12-08T14:20:00','SWIFT','REF-MWJ-880054','Settled','BU','emerald','Contract BUN-2025-3291 / soybean export'),

-- 2026
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','income','JPMorgan Chase NY','USD Trade Settlement — Aluminium',1620000.00,'USD','2026-01-19T15:30:00','SWIFT','REF-MWJ-880055','Settled','JP','blue','Contract JPM-2026-1102 / 410 MT aluminium'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','Standard Chartered NY','FX Conversion USD→EUR',1250000.00,'USD','2026-02-11T11:00:00','SWIFT','REF-MWJ-880056','Settled','SC','indigo','Convert USD reserve to EUR treasury'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','income','Cargill Inc','Grain Export Settlement',1180000.00,'USD','2026-03-05T13:45:00','SWIFT','REF-MWJ-880057','Settled','CG','slate','Contract CAR-2026-1088 / wheat export'),
-- Posle blokade: USD account takođe restrictovan
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','Commercial Bank International','Monthly Account Maintenance',150.00,'USD','2026-04-01T08:00:00','LOCAL','REF-MWJ-880058','Settled','CB','slate','USD reserve account — April 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','Commercial Bank International','Monthly Account Maintenance',150.00,'USD','2026-05-01T08:00:00','LOCAL','REF-MWJ-880059','Settled','CB','slate','USD reserve account — May 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','Commercial Bank International','Monthly Account Maintenance',150.00,'USD','2026-06-01T08:00:00','LOCAL','REF-MWJ-880060','Settled','CB','slate','USD reserve account — June 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','Commercial Bank International','Monthly Account Maintenance',150.00,'USD','2026-07-01T08:00:00','LOCAL','REF-MWJ-880061','Settled','CB','slate','USD reserve account — July 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','Commercial Bank International','Monthly Account Maintenance',150.00,'USD','2026-08-01T08:00:00','LOCAL','REF-MWJ-880062','Settled','CB','slate','USD reserve account — August 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','Trafigura Pte Ltd','Commodity Purchase — Copper (REJECTED)',820000.00,'USD','2026-05-22T10:30:00','SWIFT','REF-MWJ-880063','Rejected','TF','slate','USD outgoing REFUSED — account restricted pending compliance. Contract TRF-2026-1201 held.'),
('11111111-1111-1111-1111-111111111111','22222222-0002-0002-0002-000000000002','expense','JPMorgan Chase NY','USD Trade Settlement (REJECTED)',980000.00,'USD','2026-06-18T15:30:00','SWIFT','REF-MWJ-880064','Rejected','JP','blue','Incoming USD settlement REFUSED — bank cannot credit restricted account. Funds returned.');


-- AED Operating Account ('22222222-0003-0003-0003-000000000003')
-- Sve lokalne transakcije u AED: prihodi od lokalnih klijenata, troškovi kancelarije, vozila, utilities, salary
INSERT INTO mawj_trade_finance.transactions (profile_id, account_id, type, counterparty, category, amount, currency, occurred_at, method, reference, status, logo, color_tone, memo) VALUES
-- 2025 — lokalni prihodi i troškovi
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','income','Emirates Steel Industries','Local Settlement — Steel Products',485000.00,'AED','2025-08-12T10:00:00','LOCAL','REF-MWJ-880070','Settled','ES','amber','Local UAE steel supply contract ESI-2025-4471'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2025-08-10T09:00:00','LOCAL','REF-MWJ-880071','Settled','EN','indigo','Almas Tower L4 — monthly rent August'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2025-08-15T14:30:00','LOCAL','REF-MWJ-880072','Settled','TO','amber','Lexus LX fleet — 2 vehicles August'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Almas Tower Facilities','Office Utilities & Maintenance',14200.00,'AED','2025-08-25T09:00:00','LOCAL','REF-MWJ-880073','Settled','AT','slate','Utilities Level 40 — August'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','income','Dubai Aluminium (EGA)','Local Settlement — Aluminium Products',420000.00,'AED','2025-09-18T11:30:00','LOCAL','REF-MWJ-880074','Settled','EG','amber','Local UAE aluminium supply EGA-2025-3288'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2025-09-10T09:00:00','LOCAL','REF-MWJ-880075','Settled','EN','indigo','Almas Tower L4 — monthly rent September'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2025-09-15T14:30:00','LOCAL','REF-MWJ-880076','Settled','TO','amber','Lexus LX fleet — September'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Almas Tower Facilities','Office Utilities & Maintenance',14200.00,'AED','2025-09-25T09:00:00','LOCAL','REF-MWJ-880077','Settled','AT','slate','Utilities Level 40 — September'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Etisalat Business','Telecom & Internet',3400.00,'AED','2025-09-20T15:00:00','LOCAL','REF-MWJ-880078','Settled','ET','amber','Leased line + corporate mobile — September'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','income','ADNOC Logistics & Services','Local Freight Settlement',380000.00,'AED','2025-10-22T13:00:00','LOCAL','REF-MWJ-880079','Settled','AD','emerald','Local UAE freight ADNOC-LS-2025-8814'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2025-10-10T09:00:00','LOCAL','REF-MWJ-880080','Settled','EN','indigo','Almas Tower L4 — monthly rent October'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2025-10-15T14:30:00','LOCAL','REF-MWJ-880081','Settled','TO','amber','Lexus LX fleet — October'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Almas Tower Facilities','Office Utilities & Maintenance',14200.00,'AED','2025-10-25T09:00:00','LOCAL','REF-MWJ-880082','Settled','AT','slate','Utilities Level 40 — October'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','income','Emirates Steel Industries','Local Settlement — Steel Products',520000.00,'AED','2025-11-15T10:00:00','LOCAL','REF-MWJ-880083','Settled','ES','amber','Local UAE steel supply ESI-2025-5512'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2025-11-10T09:00:00','LOCAL','REF-MWJ-880084','Settled','EN','indigo','Almas Tower L4 — monthly rent November'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2025-11-15T14:30:00','LOCAL','REF-MWJ-880085','Settled','TO','amber','Lexus LX fleet — November'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Etisalat Business','Telecom & Internet',3400.00,'AED','2025-11-20T15:00:00','LOCAL','REF-MWJ-880086','Settled','ET','amber','Leased line + corporate mobile — November'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','income','Dubai Aluminium (EGA)','Local Settlement — Aluminium Products',465000.00,'AED','2025-12-18T11:30:00','LOCAL','REF-MWJ-880087','Settled','EG','amber','Local UAE aluminium supply EGA-2025-4411'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2025-12-10T09:00:00','LOCAL','REF-MWJ-880088','Settled','EN','indigo','Almas Tower L4 — monthly rent December'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2025-12-15T14:30:00','LOCAL','REF-MWJ-880089','Settled','TO','amber','Lexus LX fleet — December'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Almas Tower Facilities','Office Utilities & Maintenance',14200.00,'AED','2025-12-25T09:00:00','LOCAL','REF-MWJ-880090','Settled','AT','slate','Utilities Level 40 — December'),
-- 2026
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','income','ADNOC Logistics & Services','Local Freight Settlement',410000.00,'AED','2026-01-22T13:00:00','LOCAL','REF-MWJ-880091','Settled','AD','emerald','Local UAE freight ADNOC-LS-2026-1102'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-01-10T09:00:00','LOCAL','REF-MWJ-880092','Settled','EN','indigo','Almas Tower L4 — monthly rent January'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-01-15T14:30:00','LOCAL','REF-MWJ-880093','Settled','TO','amber','Lexus LX fleet — January'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Etisalat Business','Telecom & Internet',3400.00,'AED','2026-01-20T15:00:00','LOCAL','REF-MWJ-880094','Settled','ET','amber','Leased line + corporate mobile — January'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','income','Emirates Steel Industries','Local Settlement — Steel Products',540000.00,'AED','2026-02-15T10:00:00','LOCAL','REF-MWJ-880095','Settled','ES','amber','Local UAE steel supply ESI-2026-1108'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-02-10T09:00:00','LOCAL','REF-MWJ-880096','Settled','EN','indigo','Almas Tower L4 — monthly rent February'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-02-15T14:30:00','LOCAL','REF-MWJ-880097','Settled','TO','amber','Lexus LX fleet — February'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Almas Tower Facilities','Office Utilities & Maintenance',14200.00,'AED','2026-02-25T09:00:00','LOCAL','REF-MWJ-880098','Settled','AT','slate','Utilities Level 40 — February'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','income','Dubai Aluminium (EGA)','Local Settlement — Aluminium Products',490000.00,'AED','2026-03-10T11:30:00','LOCAL','REF-MWJ-880099','Settled','EG','amber','Local UAE aluminium supply EGA-2026-1205'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-03-10T09:00:00','LOCAL','REF-MWJ-880100','Settled','EN','indigo','Almas Tower L4 — monthly rent March'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Etisalat Business','Telecom & Internet',3400.00,'AED','2026-03-20T15:00:00','LOCAL','REF-MWJ-880101','Settled','ET','amber','Leased line + corporate mobile — March'),

-- Posle blokade — samo maintenance (banka sme naplaćivati)
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-04-10T09:00:00','LOCAL','REF-MWJ-880102','Settled','EN','indigo','Almas Tower L4 — April'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-04-15T14:30:00','LOCAL','REF-MWJ-880103','Settled','TO','amber','Lexus LX fleet — April'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-05-10T09:00:00','LOCAL','REF-MWJ-880104','Settled','EN','indigo','Almas Tower L4 — May'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-05-15T14:30:00','LOCAL','REF-MWJ-880105','Settled','TO','amber','Lexus LX fleet — May'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-06-10T09:00:00','LOCAL','REF-MWJ-880106','Settled','EN','indigo','Almas Tower L4 — June'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-06-15T14:30:00','LOCAL','REF-MWJ-880107','Settled','TO','amber','Lexus LX fleet — June'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-07-10T09:00:00','LOCAL','REF-MWJ-880108','Settled','EN','indigo','Almas Tower L4 — July'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-07-15T14:30:00','LOCAL','REF-MWJ-880109','Settled','TO','amber','Lexus LX fleet — July'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-08-10T09:00:00','LOCAL','REF-MWJ-880110','Settled','EN','indigo','Almas Tower L4 — August'),

-- Rejected na AED accountu posle blokade
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','income','Emirates Steel Industries','Local Settlement (REJECTED)',540000.00,'AED','2026-04-18T10:00:00','LOCAL','REF-MWJ-880111','Rejected','ES','amber','Incoming AED settlement REFUSED — operating account restricted. ESI-2026-2201 held.');

SELECT 'multi_currency_seeded' AS status,
  (SELECT count(*) FROM mawj_trade_finance.transactions WHERE account_id = '22222222-0001-0001-0001-000000000001') AS eur_tx,
  (SELECT count(*) FROM mawj_trade_finance.transactions WHERE account_id = '22222222-0002-0002-0002-000000000002') AS usd_tx,
  (SELECT count(*) FROM mawj_trade_finance.transactions WHERE account_id = '22222222-0003-0003-0003-000000000003') AS aed_tx,
  (SELECT count(*) FROM mawj_trade_finance.transactions) AS total;
