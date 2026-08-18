-- ============================================================
-- Mawj Trade Finance Bank DMCC — Seed data
-- ============================================================

SET search_path TO mawj_trade_finance, public;

-- Fixed profile id so we can reference it across inserts.
-- '11111111-1111-1111-1111-111111111111'
INSERT INTO mawj_trade_finance.profiles (id, full_name, company_name, role, email, phone, vip, license_no, registered_office)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Vladimir Maljm',
  'Aspidus DMCC',
  'Authorized Signatory',
  'vladimir.maljm@aspidus.ae',
  '+971 4 555 0192',
  true,
  'DMCC-194827',
  'Almas Tower, Jumeirah Lakes Towers, Dubai, United Arab Emirates'
)
ON CONFLICT (id) DO NOTHING;

-- ---------- Accounts ----------
INSERT INTO mawj_trade_finance.accounts (id, profile_id, label, currency, balance, iban, bic, is_primary) VALUES
 ('22222222-0001-0001-0001-000000000001','11111111-1111-1111-1111-111111111111','EUR Main Treasury','EUR',124583921.45,'DE89 3704 0044 0532 0130 00','COBADEFFXXX',true),
 ('22222222-0002-0002-0002-000000000002','11111111-1111-1111-1111-111111111111','USD Reserve Holding','USD',45000000.00,'AE89 0330 0044 0532 0012 33','EBILAEADXXX',false),
 ('22222222-0003-0003-0003-000000000003','11111111-1111-1111-1111-111111111111','AED Operating Account','AED',8750000.00,'AE07 0330 0000 0020 8819 004','EBILAEADXXX',false)
ON CONFLICT (id) DO NOTHING;

-- ---------- Cards ----------
INSERT INTO mawj_trade_finance.cards (id, profile_id, kind, label, holder, number, exp, frozen, daily_limit, monthly_limit) VALUES
 ('33333333-0001-0001-0001-000000000001','11111111-1111-1111-1111-111111111111','physical','Physical Metal — Black','VLADIMIR MALJM','4289 1102 9844 5012','12/28',false,500000,10000000),
 ('33333333-0002-0002-0002-000000000002','11111111-1111-1111-1111-111111111111','virtual','Virtual Trade Card','ASPIDUS DMCC','5311 8842 6610 9921','05/27',false,75000,1500000)
ON CONFLICT (id) DO NOTHING;

-- ---------- Beneficiaries (trade finance counterparties) ----------
INSERT INTO mawj_trade_finance.beneficiaries (profile_id, name, full_name, initials, tone, iban, country, method) VALUES
 ('11111111-1111-1111-1111-111111111111','DP World','DP World UAE Region','DP','amber','AE020334040000100801','United Arab Emirates','LOCAL'),
 ('11111111-1111-1111-1111-111111111111','Emirates NBD','Emirates NBD PJSC','EN','indigo','AE260260001012345670201','United Arab Emirates','LOCAL'),
 ('11111111-1111-1111-1111-111111111111','Trafigura','Trafigura Pte Ltd','TF','slate','GB29NWBK60161331926819','Singapore','SWIFT'),
 ('11111111-1111-1111-1111-111111111111','Glencore','Glencore International AG','GC','slate','CH9300762011623852957','Switzerland','SEPA'),
 ('11111111-1111-1111-1111-111111111111','HSBC ME','HSBC Bank Middle East','HS','emerald','AE240228000012345678901','United Arab Emirates','LOCAL'),
 ('11111111-1111-1111-1111-111111111111','Dubai Customs','Dubai Customs Authority','DC','amber','AE59023000002008819004','United Arab Emirates','LOCAL'),
 ('11111111-1111-1111-1111-111111111111','CMA CGM','CMA CGM Dubai','CM','blue','FR7630004000011234567890123','France','SEPA'),
 ('11111111-1111-1111-1111-111111111111','Aramco Trading','Aramco Trading Company','AT','slate','SA0380000000608010167519','Saudi Arabia','SWIFT'),
 ('11111111-1111-1111-1111-111111111111','Mitsui & Co','Mitsui & Co Middle East','MT','indigo','JP36SAKI1000001account','Japan','SWIFT'),
 ('11111111-1111-1111-1111-111111111111','ADNOC Logistics','ADNOC Logistics & Services','AD','emerald','AE870230000020099881','United Arab Emirates','LOCAL'),
 ('11111111-1111-1111-1111-111111111111','SGS Gulf','SGS Gulf Ltd','SG','blue','CH9300762011623852957','Switzerland','SWIFT'),
 ('11111111-1111-1111-1111-111111111111','Mercuria','Mercuria Energy Trading','ME','slate','CH5400763000012345678901','Switzerland','SEPA')
ON CONFLICT DO NOTHING;

-- ---------- FX rates (EUR base) ----------
INSERT INTO mawj_trade_finance.fx_rates (base, quote, rate, change_pct, updated_at) VALUES
 ('EUR','USD',1.0824,0.08,now()),
 ('EUR','AED',3.9545,0.12,now()),
 ('EUR','GBP',0.8531,-0.04,now()),
 ('EUR','CHF',0.9682,0.03,now()),
 ('EUR','JPY',162.45,0.21,now()),
 ('USD','AED',3.6525,-0.02,now())
ON CONFLICT (base, quote) DO UPDATE SET rate=EXCLUDED.rate, change_pct=EXCLUDED.change_pct, updated_at=now();

-- ---------- Transactions (~50, last 60 days) ----------
INSERT INTO mawj_trade_finance.transactions (profile_id, account_id, type, counterparty, category, amount, currency, occurred_at, method, reference, status, logo, color_tone, memo) VALUES
-- Recent (last 3 days)
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','DP World','Port Handling Settlement',285400.00,'EUR',(current_date - 0) + '14:32:00'::time,'LOCAL','REF-MWJ-884021','Settled','DP','amber','JAFZA Berth 12 — container handling Q1 settlement'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Trafigura Pte Ltd','Commodity Purchase — Copper Cathode',1840000.00,'EUR',(current_date - 1) + '11:08:00'::time,'SWIFT','REF-MWJ-884015','Settled','TF','slate','Contract TRF-2024-1187 / 220 MT copper cathode'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Emirates NBD','LC Confirmation Fee Refund',12400.00,'EUR',(current_date - 0) + '09:45:00'::time,'LOCAL','REF-MWJ-884019','Settled','EN','indigo','Reversal of duplicate LC confirmation charge'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Dubai Customs','Import Duty Settlement',94200.00,'EUR',(current_date - 0) + '16:20:00'::time,'LOCAL','REF-MWJ-884023','Settled','DC','amber','Customs declaration C-77231 — electronics consignment'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Container Freight',67800.00,'EUR',(current_date - 1) + '17:55:00'::time,'SEPA','REF-MWJ-884011','Settled','CM','blue','Booking DLJ-4551 / Jebel Ali → Rotterdam'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Glencore International','Trade Settlement — Aluminium',2150000.00,'EUR',(current_date - 3) + '13:40:00'::time,'SEPA','REF-MWJ-883998','Settled','GC','slate','Contract GLN-2024-3391 / 410 MT primary aluminium'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','HSBC Middle East','LC Advising Fee',3200.00,'EUR',(current_date - 4) + '10:15:00'::time,'LOCAL','REF-MWJ-883980','Settled','HS','emerald','Usance LC advising — HSBC-DXB-7821'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','SGS Gulf','Pre-Shipment Inspection',18600.00,'EUR',(current_date - 5) + '15:10:00'::time,'SWIFT','REF-MWJ-883965','Settled','SG','blue','SGS cert 9812-AE — pre-shipment QC Dubai'),
-- Last 2 weeks
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Aramco Trading','Export Proceeds — Refined Products',3680000.00,'EUR',(current_date - 7) + '12:00:00'::time,'SWIFT','REF-MWJ-883940','Settled','AT','slate','B/L ARAMCO-2291 / fuel oil consignment'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Mitsui & Co Middle East','Documentary Collection',542300.00,'EUR',(current_date - 8) + '09:30:00'::time,'SWIFT','REF-MWJ-883921','Settled','MT','indigo','D/A 90 days — machinery parts Kobe'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Mercuria Energy Trading','FX Hedge Settlement',412700.00,'EUR',(current_date - 9) + '14:05:00'::time,'SEPA','REF-MWJ-883912','Settled','ME','slate','NDF EUR/USD maturity — notional 25M'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','ADNOC Logistics','Vessel Charter',920000.00,'EUR',(current_date - 10) + '11:22:00'::time,'LOCAL','REF-MWJ-883898','Settled','AD','emerald','MR tanker ADNOC-LS-77 voyage hire'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Trafigura Pte Ltd','Trade Settlement',1427500.00,'EUR',(current_date - 12) + '16:48:00'::time,'SWIFT','REF-MWJ-883870','Settled','TF','slate','Contract TRF-2024-1142 / zinc concentrate'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','DP World','Terminal Handling Charges',38400.00,'EUR',(current_date - 13) + '08:50:00'::time,'LOCAL','REF-MWJ-883859','Settled','DP','amber','JAFZA — terminal handling + storage'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Dubai Customs','Bonded Warehouse Fees',12750.00,'EUR',(current_date - 14) + '13:15:00'::time,'LOCAL','REF-MWJ-883845','Settled','DC','amber','Bonded WH Q1 — JAFZA Zone 5'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Emirates NBD','LC Proceeds',2150000.00,'EUR',(current_date - 15) + '10:30:00'::time,'LOCAL','REF-MWJ-883831','Settled','EN','indigo','LC ENBD-2024-8814 negotiation'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Ocean Freight',84300.00,'EUR',(current_date - 16) + '17:40:00'::time,'SEPA','REF-MWJ-883812','Settled','CM','blue','Booking DLJ-4498 / Shanghai → Jebel Ali'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','SGS Gulf','Cargo Inspection',21800.00,'EUR',(current_date - 17) + '11:05:00'::time,'SWIFT','REF-MWJ-883798','Settled','SG','blue','Inspection cert 9744-AE'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Glencore International','Export Proceeds',1985000.00,'EUR',(current_date - 19) + '14:55:00'::time,'SEPA','REF-MWJ-883776','Settled','GC','slate','Contract GLN-2024-3308 / cobalt'),
-- Last 4-8 weeks
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','HSBC Middle East','Bank Guarantee Issuance',8600.00,'EUR',(current_date - 22) + '10:00:00'::time,'LOCAL','REF-MWJ-883740','Settled','HS','emerald','Performance guarantee BG-2024-5561'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Aramco Trading','Trade Settlement',2745000.00,'EUR',(current_date - 24) + '12:35:00'::time,'SWIFT','REF-MWJ-883711','Settled','AT','slate','Contract ARAMCO-2024-1188'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Mitsui & Co Middle East','Import Prepayment',685000.00,'EUR',(current_date - 26) + '09:12:00'::time,'SWIFT','REF-MWJ-883685','Settled','MT','indigo','Prepayment 30% — Yokohama machinery'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Demurrage Charges',41800.00,'EUR',(current_date - 28) + '15:30:00'::time,'SEPA','REF-MWJ-883659','Settled','CM','blue','Demurrage DLJ-4471 — 4 days over'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','DP World','Terminal Rebate',38700.00,'EUR',(current_date - 29) + '11:45:00'::time,'LOCAL','REF-MWJ-883648','Settled','DP','amber','Volume rebate Q1'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Mercuria Energy Trading','Trade Settlement',1620000.00,'EUR',(current_date - 31) + '13:20:00'::time,'SEPA','REF-MWJ-883622','Settled','ME','slate','Contract MERC-2024-2290'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Trafigura Pte Ltd','Commodity Purchase',2180000.00,'EUR',(current_date - 33) + '16:10:00'::time,'SWIFT','REF-MWJ-883599','Settled','TF','slate','Contract TRF-2024-1098 / aluminium ingot'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Dubai Customs','VAT Settlement',164300.00,'EUR',(current_date - 35) + '10:30:00'::time,'LOCAL','REF-MWJ-883571','Settled','DC','amber','Q1 import VAT'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Emirates NBD','FX Forward Settlement',492000.00,'EUR',(current_date - 37) + '14:00:00'::time,'LOCAL','REF-MWJ-883549','Settled','EN','indigo','EUR/USD fwd maturity — notional 50M'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','HSBC Middle East','LC Confirmation Fee',14700.00,'EUR',(current_date - 39) + '09:40:00'::time,'LOCAL','REF-MWJ-883523','Settled','HS','emerald','LC HSBC-2024-6620 confirmation'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Glencore International','Export Proceeds',3120000.00,'EUR',(current_date - 41) + '12:15:00'::time,'SEPA','REF-MWJ-883498','Settled','GC','slate','Contract GLN-2024-3210 / copper'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','ADNOC Logistics','Bunker Fuel Supply',538000.00,'EUR',(current_date - 43) + '15:25:00'::time,'LOCAL','REF-MWJ-883471','Settled','AD','emerald','Bunker supply Fujairah anchorage'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','SGS Gulf','Quality Inspection',16800.00,'EUR',(current_date - 45) + '11:00:00'::time,'SWIFT','REF-MWJ-883445','Settled','SG','blue','Inspection cert 9618-AE'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Aramco Trading','Export Proceeds',4210000.00,'EUR',(current_date - 47) + '13:50:00'::time,'SWIFT','REF-MWJ-883419','Settled','AT','slate','B/L ARAMCO-2188 / naphtha'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Mitsui & Co Middle East','Letter of Credit Issuance',3240000.00,'EUR',(current_date - 49) + '10:20:00'::time,'SWIFT','REF-MWJ-883392','Settled','MT','indigo','LC MT-2024-4451 / 60 days usance'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','CMA CGM Dubai','Container Freight',71200.00,'EUR',(current_date - 51) + '16:35:00'::time,'SEPA','REF-MWJ-883365','Settled','CM','blue','Booking DLJ-4405 / Antwerp → Jebel Ali'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Trafigura Pte Ltd','Trade Settlement',1885000.00,'EUR',(current_date - 53) + '11:30:00'::time,'SWIFT','REF-MWJ-883338','Settled','TF','slate','Contract TRF-2024-1012'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','DP World','Storage Charges',29400.00,'EUR',(current_date - 55) + '14:10:00'::time,'LOCAL','REF-MWJ-883311','Settled','DP','amber','Cold storage JAFZA — 21 days'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Mercuria Energy Trading','Export Proceeds',2370000.00,'EUR',(current_date - 57) + '09:55:00'::time,'SEPA','REF-MWJ-883284','Settled','ME','slate','Contract MERC-2024-2150'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','HSBC Middle East','Trade Finance Facility Interest',48600.00,'EUR',(current_date - 58) + '12:40:00'::time,'LOCAL','REF-MWJ-883268','Settled','HS','emerald','Revolving credit facility — Mar interest'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Dubai Customs','Processing Fee',8900.00,'EUR',(current_date - 59) + '15:05:00'::time,'LOCAL','REF-MWJ-883251','Settled','DC','amber','Express clearance — electronics'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Emirates NBD','Interest Credit',189400.00,'EUR',(current_date - 60) + '10:10:00'::time,'LOCAL','REF-MWJ-883230','Settled','EN','indigo','Treasury deposit — Mar interest'),
-- A couple of pending to look live
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','expense','Trafigura Pte Ltd','Commodity Purchase — Cobalt',1420000.00,'EUR',(current_date - 0) + '08:15:00'::time,'SWIFT','REF-MWJ-884030','Processing','TF','slate','Contract TRF-2024-1201 / awaiting LC confirmation'),
 ('11111111-1111-1111-1111-111111111111','22222222-0001-0001-0001-000000000001','income','Glencore International','Trade Settlement',980000.00,'EUR',(current_date - 0) + '18:50:00'::time,'SEPA','REF-MWJ-884031','Pending','GC','slate','Contract GLN-2024-3422 / awaiting value date')
ON CONFLICT DO NOTHING;

-- ---------- Login events (audit trail) ----------
INSERT INTO mawj_trade_finance.login_events (profile_id, method, success, device, location, ip) VALUES
 ('11111111-1111-1111-1111-111111111111','biometric',true,'iPhone 15 Pro · Face ID','Dubai, AE','188.55.4x.x'),
 ('11111111-1111-1111-1111-111111111111','biometric',true,'MacBook Pro · Touch ID','Dubai, AE','188.55.4x.x'),
 ('11111111-1111-1111-1111-111111111111','biometric',true,'iPhone 15 Pro · Face ID','Dubai, AE','188.55.4x.x'),
 ('11111111-1111-1111-1111-111111111111','biometric',false,'Unknown device','Singapore, SG','103.21.2x.x'),
 ('11111111-1111-1111-1111-111111111111','biometric',true,'iPhone 15 Pro · Face ID','Dubai, AE','188.55.4x.x')
ON CONFLICT DO NOTHING;

SELECT 'seed_complete' AS status,
  (SELECT count(*) FROM mawj_trade_finance.transactions) AS tx_count,
  (SELECT count(*) FROM mawj_trade_finance.beneficiaries) AS ben_count,
  (SELECT count(*) FROM mawj_trade_finance.accounts) AS acct_count;
