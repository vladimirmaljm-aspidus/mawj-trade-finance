-- CBI Account & Blocked-Account Logic Corrections (applied 2026-11-27)
-- ============================================================
-- 1) All three accounts are held at CBI UAE, so IBANs must be AE-prefixed
--    with CBI bank code 022 and a valid mod-97 check digit, and the BIC
--    must be CBI's official CLBIAEADXXX (sourced from cbiuae.com
--    /en/personal/contact-and-support/iban-and-swift-code/).
--    Previously the EUR account carried a German Commerzbank IBAN/BIC
--    and the USD account an Emirates NBD BIC — both illogical.
-- 2) Compliance case CBI-CMP-2026-0047 blocks €18,500,000 since
--    2026-03-15 and suspends ALL outgoing transfers. Any successful
--    outgoing payment after that date is therefore illogical, except
--    account-maintenance service charges the bank debits itself.

-- ---------- accounts ----------
UPDATE accounts SET iban = 'AE88 0220 0044 0532 0130 000', bic = 'CLBIAEADXXX'
  WHERE currency = 'EUR';  -- EUR Main Treasury
UPDATE accounts SET iban = 'AE61 0220 0044 0532 0012 340', bic = 'CLBIAEADXXX'
  WHERE currency = 'USD';  -- USD Reserve Holding
UPDATE accounts SET iban = 'AE56 0220 0000 0020 8819 004', bic = 'CLBIAEADXXX'
  WHERE currency = 'AED';  -- AED Operating Account

-- ---------- illogical post-block payments -> Rejected ----------
UPDATE transactions SET status = 'Rejected',
    memo = 'Rejected — outgoing transfers suspended pending compliance review (CBI-CMP-2026-0047)'
  WHERE occurred_at >= '2026-03-15'
    AND status = 'Settled'
    AND type = 'expense'
    AND counterparty <> 'Commercial Bank International';
-- covers: Etisalat telecom (Mar), Emirates NBD office lease x5,
-- Toyota Al Futtaim vehicle lease x4 — all AED outgoing attempts.

-- ---------- account-maintenance charges continue while blocked ----------
-- Existing series: EUR 250 / USD 150 on the 1st (Apr–Aug) and
-- AED 14,200 around the 25th (through Feb). Continuations inserted:
--   EUR 250 on 2026-09-01 / 10-01 / 11-01
--   USD 150 on 2026-09-01 / 10-01 / 11-01
--   AED 14,200 on the 25th of every month 2026-03 .. 2026-11
-- (rows inserted via PostgREST; see app for live state)

-- ---------- UI-side logic (application code) ----------
-- HomeTab now derives per-account available balance:
--   available = balance − amount_blocked (compliance case currency)
--   plus a "Blocked Funds (Compliance)" row in crimson.
-- ReceivePage: BIC fallback CLBIAEADXXX, SWIFT (not SEPA) labelling
-- for a UAE bank. Notifications reworked to match blocked-state story.
