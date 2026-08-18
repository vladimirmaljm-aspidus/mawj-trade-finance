-- ============================================================
-- Mawj Trade Finance Bank DMCC — Database schema
-- Schema: mawj_trade_finance (isolated, does not touch public)
-- ============================================================

DROP SCHEMA IF EXISTS mawj_trade_finance CASCADE;
CREATE SCHEMA mawj_trade_finance;

SET search_path TO mawj_trade_finance, public;

-- ---------- profiles ----------
CREATE TABLE mawj_trade_finance.profiles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        text NOT NULL,
  company_name     text NOT NULL,
  role             text NOT NULL,
  email            text,
  phone            text,
  vip              boolean NOT NULL DEFAULT true,
  license_no       text,
  registered_office text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------- accounts ----------
CREATE TABLE mawj_trade_finance.accounts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES mawj_trade_finance.profiles(id) ON DELETE CASCADE,
  label      text NOT NULL,
  currency   text NOT NULL CHECK (currency IN ('EUR','USD','AED','GBP','CHF')),
  balance    numeric(18,2) NOT NULL DEFAULT 0,
  iban       text,
  bic        text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- cards ----------
CREATE TABLE mawj_trade_finance.cards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES mawj_trade_finance.profiles(id) ON DELETE CASCADE,
  kind          text NOT NULL CHECK (kind IN ('physical','virtual')),
  label         text NOT NULL,
  holder        text NOT NULL,
  number        text NOT NULL,
  exp           text NOT NULL,
  frozen        boolean NOT NULL DEFAULT false,
  daily_limit   numeric(18,2) NOT NULL DEFAULT 500000,
  monthly_limit numeric(18,2) NOT NULL DEFAULT 10000000,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------- beneficiaries ----------
CREATE TABLE mawj_trade_finance.beneficiaries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES mawj_trade_finance.profiles(id) ON DELETE CASCADE,
  name       text NOT NULL,
  full_name  text NOT NULL,
  initials   text NOT NULL,
  tone       text NOT NULL DEFAULT 'slate',
  iban       text,
  country    text,
  method     text NOT NULL DEFAULT 'SWIFT',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- transactions ----------
CREATE TABLE mawj_trade_finance.transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES mawj_trade_finance.profiles(id) ON DELETE CASCADE,
  account_id  uuid REFERENCES mawj_trade_finance.accounts(id) ON DELETE SET NULL,
  type        text NOT NULL CHECK (type IN ('income','expense')),
  counterparty text NOT NULL,
  category    text NOT NULL,
  amount      numeric(18,2) NOT NULL,
  currency    text NOT NULL DEFAULT 'EUR',
  occurred_at timestamptz NOT NULL,
  method      text NOT NULL DEFAULT 'SEPA',
  reference   text NOT NULL,
  status      text NOT NULL DEFAULT 'Settled',
  logo        text,
  color_tone  text NOT NULL DEFAULT 'slate',
  memo        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tx_profile_time ON mawj_trade_finance.transactions (profile_id, occurred_at DESC);
CREATE INDEX idx_tx_type ON mawj_trade_finance.transactions (profile_id, type);

-- ---------- fx_rates ----------
CREATE TABLE mawj_trade_finance.fx_rates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base       text NOT NULL,
  quote      text NOT NULL,
  rate       numeric(14,6) NOT NULL,
  change_pct numeric(7,3) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (base, quote)
);

-- ---------- webauthn_credentials (biometric device keys) ----------
CREATE TABLE mawj_trade_finance.webauthn_credentials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES mawj_trade_finance.profiles(id) ON DELETE CASCADE,
  credential_id text NOT NULL UNIQUE,
  public_key    bytea NOT NULL,
  counter       integer NOT NULL DEFAULT 0,
  device_type   text,
  transports    text[] NOT NULL DEFAULT '{}',
  nickname      text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------- auth_challenges (ephemeral WebAuthn challenges) ----------
CREATE TABLE mawj_trade_finance.auth_challenges (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES mawj_trade_finance.profiles(id) ON DELETE CASCADE,
  challenge  text NOT NULL,
  purpose    text NOT NULL CHECK (purpose IN ('register','auth')),
  expires_at timestamptz NOT NULL,
  used       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- login_events (audit log) ----------
CREATE TABLE mawj_trade_finance.login_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES mawj_trade_finance.profiles(id) ON DELETE CASCADE,
  method     text NOT NULL,
  success    boolean NOT NULL,
  device     text,
  location   text,
  ip         text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables (no policies => anon denied).
-- Server-side service_role bypasses RLS, so all app traffic flows through
-- the Next.js API layer on Render. This is the correct, secure architecture.
ALTER TABLE mawj_trade_finance.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.accounts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.cards                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.beneficiaries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.transactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.fx_rates               ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.webauthn_credentials   ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.auth_challenges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE mawj_trade_finance.login_events           ENABLE ROW LEVEL SECURITY;

-- Grant usage on schema to anon/authenticated so the API layer can resolve names,
-- but RLS keeps data locked down to the service role.
GRANT USAGE ON SCHEMA mawj_trade_finance TO anon, authenticated, service_role;

SELECT 'schema_created' AS status;
