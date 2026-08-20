-- ============================================================
-- Mawj Trade Finance Bank — Compliance (funds-blocked) scenario
-- Adds: compliance_cases, compliance_documents, compliance_timeline
-- ============================================================

SET search_path TO mawj_trade_finance, public;

-- ---------- compliance_cases ----------
CREATE TABLE IF NOT EXISTS mawj_trade_finance.compliance_cases (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES mawj_trade_finance.profiles(id) ON DELETE CASCADE,
  case_reference  text NOT NULL UNIQUE,
  title           text NOT NULL,
  reason          text NOT NULL,
  amount_blocked  numeric(18,2) NOT NULL,
  currency        text NOT NULL DEFAULT 'EUR',
  blocked_since   timestamptz NOT NULL,
  deadline_1      timestamptz NOT NULL,         -- first (missed) deadline
  deadline_2      timestamptz NOT NULL,         -- current / final deadline
  status          text NOT NULL DEFAULT 'Awaiting Documents',
  severity        text NOT NULL DEFAULT 'high', -- low|medium|high|critical
  progress_pct    integer NOT NULL DEFAULT 0,    -- 0..100
  regulator_note  text,
  assigned_officer text,
  officer_role    text,
  officer_email   text,
  officer_phone   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- compliance_documents ----------
CREATE TABLE IF NOT EXISTS mawj_trade_finance.compliance_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid NOT NULL REFERENCES mawj_trade_finance.compliance_cases(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  status          text NOT NULL DEFAULT 'pending', -- pending|submitted|approved|rejected
  required        boolean NOT NULL DEFAULT true,
  submitted_at    timestamptz,
  filename        text,
  category        text NOT NULL DEFAULT 'KYC', -- KYC|AML|SOURCE_OF_FUNDS|CORPORATE|TRANSACTION
  due_date        timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- compliance_timeline ----------
CREATE TABLE IF NOT EXISTS mawj_trade_finance.compliance_timeline (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES mawj_trade_finance.compliance_cases(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL,
  title       text NOT NULL,
  description text NOT NULL,
  actor       text NOT NULL DEFAULT 'bank', -- bank|client|system
  tone        text NOT NULL DEFAULT 'info', -- info|warning|success|danger
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE mawj_trade_finance.compliance_cases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.compliance_documents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.compliance_timeline   ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA mawj_trade_finance TO anon, authenticated, service_role;

-- Public views (PostgREST)
CREATE OR REPLACE VIEW public.compliance_cases     AS SELECT * FROM mawj_trade_finance.compliance_cases;
CREATE OR REPLACE VIEW public.compliance_documents AS SELECT * FROM mawj_trade_finance.compliance_documents;
CREATE OR REPLACE VIEW public.compliance_timeline  AS SELECT * FROM mawj_trade_finance.compliance_timeline;
NOTIFY pgrst, 'reload schema';

SELECT 'compliance_schema_ready' AS status;
