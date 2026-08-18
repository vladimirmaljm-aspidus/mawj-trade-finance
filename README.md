# Mawj Trade Finance Bank — Corporate Treasury Platform

A production-grade corporate treasury & trade-finance web application for
**Mawj Trade Finance Bank DMCC** (DMCC-licensed, UAE). Built for authorized
signatories to manage liquidity, corporate cards, FX and cross-border
payments.

The single client account in this deployment belongs to **Aspidus DMCC**,
authorized signatory **Vladimir Maljm**.

## What this is

A Progressive Web App (installable on Android and iPhone, offline-capable)
backed by a real Postgres database (Supabase) and a Next.js API layer hosted
on Render. All sensitive operations flow through signed session cookies and
server-side calls with the Supabase service role — the browser never sees the
database credentials.

## Features

- **Biometric sign-in** via WebAuthn / FIDO2 (Face ID, Touch ID, fingerprint).
  Falls back to a one-time access code on devices without a platform
  authenticator. Every sign-in is recorded in an audit log.
- **Corporate treasury dashboard** — total liquidity, yield, pending clearing,
  monthly spend tracking.
- **Corporate cards** — physical metal card + virtual trade card, instant
  freeze, spending limits, masked reveal.
- **Trade payments** — SEPA / SWIFT / local transfers with quick-send
  beneficiaries (DP World, Trafigura, Glencore, Emirates NBD, HSBC Middle
  East, Dubai Customs, CMA CGM, Aramco Trading, Mitsui, ADNOC Logistics…),
  real-time balance debit and reference generation.
- **Treasury FX** — live EUR-base rates, currency converter with swap, rate
  table.
- **Trade finance data** — letters of credit, LC confirmation fees,
  documentary collections, commodity purchases, freight, customs duties,
  bank guarantees, FX hedge settlements, etc.
- **Receipts** — every transaction has a downloadable PDF receipt.
- **Login activity** audit trail with device, location and success/failure.
- **PWA install** — add to home screen on Android (Chrome) and iOS (Safari).

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + custom premium theme (navy + gold)
- Supabase (Postgres) — data lives in an isolated `mawj_trade_finance` schema,
  exposed to the API via updatable views in `public` (existing project tables
  are never touched).
- `@simplewebauthn/server` + `@simplewebauthn/browser` for passkeys
- `jsonwebtoken` httpOnly session cookies
- `jspdf` (lazy-loaded) for receipt generation
- `qrcode.react` for SEPA QR codes

## Architecture

```
Browser (PWA)
   │  fetch /api/* (credentials: include)
   ▼
Next.js API routes (Render)  ──►  signed session cookie (JWT, httpOnly)
   │  service_role key (server only, never shipped to browser)
   ▼
Supabase Postgres — schema: mawj_trade_finance
   profiles · accounts · cards · beneficiaries · transactions
   fx_rates · webauthn_credentials · auth_challenges · login_events
```

## Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `SUPABASE_URL` | server | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | server (secret) | Bypasses RLS, full DB access |
| `NEXT_PUBLIC_SUPABASE_URL` | client | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Public anon key |
| `SESSION_SECRET` | server (secret) | Signs session JWTs (≥32 chars) |
| `DEMO_PASSCODE` | server (secret) | 6-digit fallback access code |

Copy `.env.example` to `.env.local` and fill in for local development.

## Local development

```bash
bun install
bun run dev   # http://localhost:3000
```

The first time you sign in, tap the fingerprint to enroll this device's
biometrics (Face ID / Touch ID / fingerprint). On devices without a platform
authenticator, use "Use access code instead" with the `DEMO_PASSCODE`.

## Deployment (Render)

The service is configured to:

- **Build:** `npm install --legacy-peer-deps && npm run build`
- **Start:** `HOSTNAME=0.0.0.0 NODE_ENV=production node .next/standalone/server.js`
- **Health check:** `GET /api/health`

All environment variables above must be set in the Render dashboard.

## Database setup

The `db/schema.sql` and `db/seed.sql` files define and populate the
`mawj_trade_finance` schema plus the `public` views that expose it to the
PostgREST API. They are idempotent and isolated from any existing tables in
the Supabase project.

## License

Proprietary — Mawj Trade Finance Bank DMCC.
