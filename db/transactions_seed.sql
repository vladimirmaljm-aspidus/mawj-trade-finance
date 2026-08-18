-- ============================================================
-- Mawj Trade Finance Bank — Full year of logical transactions
-- Aug 2025 → Aug 2026. ~80 transactions.
-- Pre-blokada (do 15. mar 2026): realan trade finance + operativni tok
-- 15. mart: €18.5M Trafigura BLOKIRAN
-- Posle: samo mesečni troškovi održavanja
-- ============================================================

SET search_path TO mawj_trade_finance, public;

DELETE FROM mawj_trade_finance.transactions WHERE profile_id = '11111111-1111-1111-1111-111111111111';

-- Primary EUR account, USD reserve, AED operating
-- '22222222-0001-0001-0001-000000000001'  EUR Main Treasury
-- '22222222-0002-0002-0002-000000000002'  USD Reserve Holding
-- '22222222-0003-0003-0003-000000000003'  AED Operating Account

INSERT INTO mawj_trade_finance.transactions (profile_id, account_id, type, counterparty, category, amount, currency, occurred_at, method, reference, status, logo, color_tone, memo) VALUES

-- ============================================================
-- AVGUST 2025
-- ============================================================
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Glencore International AG','Trade Settlement — Aluminium',2150000.00,'EUR','2025-08-04T13:40:00','SEPA','REF-MWJ-880001','Settled','GC','slate','Contract GLN-2025-9102 / 410 MT primary aluminium'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Container Freight',78400.00,'EUR','2025-08-07T11:20:00','SEPA','REF-MWJ-880002','Settled','CM','blue','Booking DLJ-3998 / Antwerp → Jebel Ali'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2025-08-10T09:00:00','LOCAL','REF-MWJ-880003','Settled','EN','indigo','Almas Tower L4 — monthly rent'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Aramco Trading Co','Export Proceeds — Refined Products',2745000.00,'EUR','2025-08-14T12:35:00','SWIFT','REF-MWJ-880004','Settled','AT','slate','B/L ARAMCO-2088 / fuel oil consignment'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2025-08-15T14:30:00','LOCAL','REF-MWJ-880005','Settled','TO','amber','Lexus LX fleet — 2 vehicles'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Dubai Customs','Import Duty Settlement',84200.00,'EUR','2025-08-18T09:45:00','LOCAL','REF-MWJ-880006','Settled','DC','amber','Customs declaration C-75891'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Emirates NBD','LC Proceeds',1850000.00,'EUR','2025-08-22T10:30:00','LOCAL','REF-MWJ-880007','Settled','EN','indigo','LC ENBD-2025-6102 negotiation'),

-- SEPTEMBAR 2025
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Trafigura Pte Ltd','Commodity Purchase — Copper',1640000.00,'EUR','2025-09-03T11:08:00','SWIFT','REF-MWJ-880010','Settled','TF','slate','Contract TRF-2025-9042 / copper cathode'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','DP World','Terminal Rebate',38700.00,'EUR','2025-09-06T11:45:00','LOCAL','REF-MWJ-880011','Settled','DP','amber','Volume rebate Q3 2025'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Almas Tower Facilities','Office Utilities & Maintenance',14200.00,'AED','2025-09-10T09:00:00','LOCAL','REF-MWJ-880012','Settled','AT','slate','Utilities Level 40'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Mercuria Energy Trading','Trade Settlement',1620000.00,'EUR','2025-09-12T13:20:00','SEPA','REF-MWJ-880013','Settled','ME','slate','Contract MERC-2025-9015'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','HSBC Middle East','LC Advising Fee',3200.00,'EUR','2025-09-18T10:15:00','LOCAL','REF-MWJ-880014','Settled','HS','emerald','Usance LC advising HSBC-DXB-7791'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Etisalat Business','Telecom & Internet',3400.00,'AED','2025-09-20T15:00:00','LOCAL','REF-MWJ-880015','Settled','ET','amber','Leased line + corporate mobile'),

-- OKTOBAR 2025
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Glencore International AG','Export Proceeds — Cobalt',1985000.00,'EUR','2025-10-04T12:15:00','SEPA','REF-MWJ-880020','Settled','GC','slate','Contract GLN-2025-9187 / cobalt'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Mitsui & Co Ltd','Documentary Collection',542300.00,'EUR','2025-10-09T09:30:00','SWIFT','REF-MWJ-880021','Settled','MT','indigo','D/A 90 days — machinery parts Yokohama'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2025-10-10T09:00:00','LOCAL','REF-MWJ-880022','Settled','EN','indigo','Almas Tower L4 — monthly rent'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Ocean Freight',71200.00,'EUR','2025-10-16T17:40:00','SEPA','REF-MWJ-880023','Settled','CM','blue','Booking DLJ-4088 / Shanghai → Jebel Ali'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2025-10-15T14:30:00','LOCAL','REF-MWJ-880024','Settled','TO','amber','Lexus LX fleet — 2 vehicles'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Aramco Trading Co','Trade Settlement',3680000.00,'EUR','2025-10-27T12:00:00','SWIFT','REF-MWJ-880025','Settled','AT','slate','Contract ARAMCO-2025-9091'),

-- NOVEMBAR 2025
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Trafigura Pte Ltd','Commodity Purchase — Zinc',1427500.00,'EUR','2025-11-03T11:08:00','SWIFT','REF-MWJ-880030','Settled','TF','slate','Contract TRF-2025-1008 / zinc concentrate'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Emirates NBD','Interest Credit — Treasury',189400.00,'EUR','2025-11-04T10:10:00','LOCAL','REF-MWJ-880031','Settled','EN','indigo','Treasury deposit — Oct interest'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Almas Tower Facilities','Office Utilities & Maintenance',14200.00,'AED','2025-11-10T09:00:00','LOCAL','REF-MWJ-880032','Settled','AT','slate','Utilities Level 40'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','SGS Gulf Ltd','Cargo Inspection',16800.00,'EUR','2025-11-14T11:05:00','SWIFT','REF-MWJ-880033','Settled','SG','blue','Inspection cert 9501-AE'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','DP World','Storage Charges',29400.00,'EUR','2025-11-18T14:10:00','LOCAL','REF-MWJ-880034','Settled','DP','amber','Cold storage JAFZA — 21 days'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Vitol SA','Trade Settlement — Gas Oil',2480000.00,'EUR','2025-11-21T13:25:00','SEPA','REF-MWJ-880035','Settled','VI','slate','Contract VIT-2025-1078 / 5000 MT gas oil'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Etisalat Business','Telecom & Internet',3400.00,'AED','2025-11-20T15:00:00','LOCAL','REF-MWJ-880036','Settled','ET','amber','Leased line + corporate mobile'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','HSBC Middle East','LC Confirmation Fee',14700.00,'EUR','2025-11-25T09:40:00','LOCAL','REF-MWJ-880037','Settled','HS','emerald','LC HSBC-2025-5015 confirmation'),

-- DECEMBAR 2025
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Glencore International AG','Trade Settlement — Copper',3120000.00,'EUR','2025-12-04T12:15:00','SEPA','REF-MWJ-880040','Settled','GC','slate','Contract GLN-2025-9210 / 620 MT copper'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2025-12-10T09:00:00','LOCAL','REF-MWJ-880041','Settled','EN','indigo','Almas Tower L4 — monthly rent'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Mitsubishi Corporation','Industrial Equipment Purchase',842000.00,'EUR','2025-12-11T10:00:00','SWIFT','REF-MWJ-880042','Settled','MI','indigo','CNC machinery — Tokyo office'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2025-12-15T14:30:00','LOCAL','REF-MWJ-880043','Settled','TO','amber','Lexus LX fleet — 2 vehicles'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Container Freight',78400.00,'EUR','2025-12-17T11:20:00','SEPA','REF-MWJ-880044','Settled','CM','blue','Booking DLJ-4155 / Rotterdam → Jebel Ali'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Bunge Limited','Trade Settlement — Grains',1275000.00,'EUR','2025-12-22T14:00:00','SWIFT','REF-MWJ-880045','Settled','BU','emerald','Contract BUN-2025-3091 / wheat export'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Almas Tower Facilities','Office Utilities & Maintenance',14200.00,'AED','2025-12-18T09:00:00','LOCAL','REF-MWJ-880046','Settled','AT','slate','Utilities Level 40'),

-- JANUAR 2026
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Glencore International AG','Trade Settlement — Aluminium',2150000.00,'EUR','2026-01-08T13:40:00','SEPA','REF-MWJ-880050','Settled','GC','slate','Contract GLN-2026-1102 / 410 MT primary aluminium'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Container Freight',78400.00,'EUR','2026-01-10T11:20:00','SEPA','REF-MWJ-880051','Settled','CM','blue','Booking DLJ-4102 / Antwerp → Jebel Ali'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-01-10T09:00:00','LOCAL','REF-MWJ-880052','Settled','EN','indigo','Almas Tower L4 — monthly rent'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Aramco Trading Co','Export Proceeds — Refined Products',2745000.00,'EUR','2026-01-14T12:35:00','SWIFT','REF-MWJ-880053','Settled','AT','slate','B/L ARAMCO-2188 / fuel oil consignment'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-01-15T14:30:00','LOCAL','REF-MWJ-880054','Settled','TO','amber','Lexus LX fleet — 2 vehicles'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Dubai Customs','Import Duty Settlement',84200.00,'EUR','2026-01-16T09:45:00','LOCAL','REF-MWJ-880055','Settled','DC','amber','Customs declaration C-76891'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','HSBC Middle East','LC Advising Fee',3200.00,'EUR','2026-01-18T10:15:00','LOCAL','REF-MWJ-880056','Settled','HS','emerald','Usance LC advising HSBC-DXB-7791'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Emirates NBD','LC Proceeds',1850000.00,'EUR','2026-01-22T10:30:00','LOCAL','REF-MWJ-880057','Settled','EN','indigo','LC ENBD-2026-7102 negotiation'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','DP World','Terminal Handling Charges',38400.00,'EUR','2026-01-25T08:50:00','LOCAL','REF-MWJ-880058','Settled','DP','amber','JAFZA — terminal handling + storage'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Trafigura Pte Ltd','Trade Settlement — Zinc Concentrate',1427500.00,'EUR','2026-01-29T16:48:00','SWIFT','REF-MWJ-880059','Settled','TF','slate','Contract TRF-2026-1008'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Etisalat Business','Telecom & Internet',3400.00,'AED','2026-01-20T15:00:00','LOCAL','REF-MWJ-880060','Settled','ET','amber','Leased line + corporate mobile'),

-- FEBRUAR 2026
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Trafigura Pte Ltd','Commodity Purchase — Copper Cathode',1640000.00,'EUR','2026-02-03T11:08:00','SWIFT','REF-MWJ-880061','Settled','TF','slate','Contract TRF-2026-1042 / 220 MT copper cathode'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','DP World','Terminal Rebate',38700.00,'EUR','2026-02-06T11:45:00','LOCAL','REF-MWJ-880062','Settled','DP','amber','Volume rebate Q4 2025'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Mitsui & Co Middle East','Documentary Collection',542300.00,'EUR','2026-02-09T09:30:00','SWIFT','REF-MWJ-880063','Settled','MT','indigo','D/A 90 days — machinery parts Yokohama'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Mercuria Energy Trading','Trade Settlement',1620000.00,'EUR','2026-02-12T13:20:00','SEPA','REF-MWJ-880064','Settled','ME','slate','Contract MERC-2026-2015'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Almas Tower Facilities','Office Utilities & Maintenance',14200.00,'AED','2026-02-10T09:00:00','LOCAL','REF-MWJ-880065','Settled','AT','slate','Utilities Level 40'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Ocean Freight',71200.00,'EUR','2026-02-16T17:40:00','SEPA','REF-MWJ-880066','Settled','CM','blue','Booking DLJ-4188 / Shanghai → Jebel Ali'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-02-10T09:00:00','LOCAL','REF-MWJ-880067','Settled','EN','indigo','Almas Tower L4 — monthly rent'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Glencore International AG','Export Proceeds — Cobalt',1985000.00,'EUR','2026-02-19T12:15:00','SEPA','REF-MWJ-880068','Settled','GC','slate','Contract GLN-2026-1187 / cobalt'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-02-15T14:30:00','LOCAL','REF-MWJ-880069','Settled','TO','amber','Lexus LX fleet — 2 vehicles'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','SGS Gulf Ltd','Cargo Inspection',16800.00,'EUR','2026-02-24T11:05:00','SWIFT','REF-MWJ-880070','Settled','SG','blue','Inspection cert 9601-AE'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Aramco Trading Co','Trade Settlement',3680000.00,'EUR','2026-02-27T12:00:00','SWIFT','REF-MWJ-880071','Settled','AT','slate','Contract ARAMCO-2026-1091'),

-- MART 2026 (pre blokade, 1-14. mart)
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','HSBC Middle East','Bank Guarantee Issuance',8600.00,'EUR','2026-03-02T10:00:00','LOCAL','REF-MWJ-880075','Settled','HS','emerald','Performance guarantee BG-2026-5102'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Emirates NBD','Interest Credit — Treasury Deposit',189400.00,'EUR','2026-03-04T10:10:00','LOCAL','REF-MWJ-880076','Settled','EN','indigo','Treasury deposit — Feb interest'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Etisalat Business','Telecom & Internet',3400.00,'AED','2026-03-20T15:00:00','LOCAL','REF-MWJ-880077','Settled','ET','amber','Leased line + corporate mobile'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','DP World','Storage Charges',29400.00,'EUR','2026-03-06T14:10:00','LOCAL','REF-MWJ-880078','Settled','DP','amber','Cold storage JAFZA — 21 days'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Trafigura Pte Ltd','Trade Settlement',1885000.00,'EUR','2026-03-09T11:30:00','SWIFT','REF-MWJ-880079','Settled','TF','slate','Contract TRF-2026-1078'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','HSBC Middle East','LC Confirmation Fee',14700.00,'EUR','2026-03-11T09:40:00','LOCAL','REF-MWJ-880080','Settled','HS','emerald','LC HSBC-2026-6015 confirmation'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Mercuria Energy Trading','FX Hedge Settlement',412700.00,'EUR','2026-03-12T14:05:00','SEPA','REF-MWJ-880081','Settled','ME','slate','NDF EUR/USD maturity — notional 25M'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Demurrage Charges',41800.00,'EUR','2026-03-13T15:30:00','SEPA','REF-MWJ-880082','Settled','CM','blue','Demurrage DLJ-4201 — 4 days over'),

-- ============================================================
-- 15. MART 2026 — BLOKIRANI TRANSFER (okidač complajnsa)
-- €18.5M ka Trafiguri — Processing status (na holdu)
-- ============================================================
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Trafigura Pte Ltd','Commodity Purchase — Copper Cathode (BLOCKED)',18500000.00,'EUR','2026-03-15T09:00:00','SWIFT','REF-MWJ-880083','Processing','TF','slate','Contract TRF-2026-1187 / 220 MT copper cathode — HELD pending AML review (Case CBI-CMP-2026-0047)'),

-- ============================================================
-- POSLE BLOKADE — samo troškovi održavanja računa
-- Mesečna naknada €250 + jednokratna complajns naknada €500
-- ============================================================
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Compliance Review Fee',500.00,'EUR','2026-03-18T08:00:00','LOCAL','REF-MWJ-880090','Settled','CB','slate','One-time AML/CFT review fee — Case CBI-CMP-2026-0047'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-04-01T08:00:00','LOCAL','REF-MWJ-880091','Settled','CB','slate','Corporate treasury account — April 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-04-10T09:00:00','LOCAL','REF-MWJ-880092','Settled','EN','indigo','Almas Tower L4 — monthly rent'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-04-15T14:30:00','LOCAL','REF-MWJ-880093','Settled','TO','amber','Lexus LX fleet — 2 vehicles'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-05-01T08:00:00','LOCAL','REF-MWJ-880094','Settled','CB','slate','Corporate treasury account — May 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-05-10T09:00:00','LOCAL','REF-MWJ-880095','Settled','EN','indigo','Almas Tower L4 — monthly rent'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-05-15T14:30:00','LOCAL','REF-MWJ-880096','Settled','TO','amber','Lexus LX fleet — 2 vehicles'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-06-01T08:00:00','LOCAL','REF-MWJ-880097','Settled','CB','slate','Corporate treasury account — June 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-06-10T09:00:00','LOCAL','REF-MWJ-880098','Settled','EN','indigo','Almas Tower L4 — monthly rent'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-06-15T14:30:00','LOCAL','REF-MWJ-880099','Settled','TO','amber','Lexus LX fleet — 2 vehicles'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-07-01T08:00:00','LOCAL','REF-MWJ-880100','Settled','CB','slate','Corporate treasury account — July 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-07-10T09:00:00','LOCAL','REF-MWJ-880101','Settled','EN','indigo','Almas Tower L4 — monthly rent'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Toyota Al Futtaim','Corporate Vehicle Lease',8200.00,'AED','2026-07-15T14:30:00','LOCAL','REF-MWJ-880102','Settled','TO','amber','Lexus LX fleet — 2 vehicles'),
('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Commercial Bank International','Monthly Account Maintenance',250.00,'EUR','2026-08-01T08:00:00','LOCAL','REF-MWJ-880103','Settled','CB','slate','Corporate treasury account — August 2026'),
('11111111-1111-1111-1111-111111111111','22222222-0003-0003-0003-000000000003','expense','Emirates NBD','Office Lease — JLT',125000.00,'AED','2026-08-10T09:00:00','LOCAL','REF-MWJ-880104','Settled','EN','indigo','Almas Tower L4 — monthly rent');

-- Ažuriraj balans primarnog računa
UPDATE mawj_trade_finance.accounts
SET balance = 124583921.45
WHERE id = '22222222-0001-0001-0001-000000000001';

SELECT 'transactions_seeded' AS status,
  (SELECT count(*) FROM mawj_trade_finance.transactions) AS total,
  (SELECT count(*) FROM mawj_trade_finance.transactions WHERE occurred_at < '2026-03-15') AS pre_block,
  (SELECT count(*) FROM mawj_trade_finance.transactions WHERE occurred_at >= '2026-03-15') AS post_block,
  (SELECT count(*) FROM mawj_trade_finance.transactions WHERE status = 'Processing') AS blocked,
  (SELECT count(DISTINCT counterparty) FROM mawj_trade_finance.transactions) AS counterparties;
