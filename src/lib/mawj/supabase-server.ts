import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service_role key.
 *
 * IMPORTANT: this module must never be imported from a "use client" file.
 * The service_role key bypasses RLS and has full DB access — it stays on
 * the server (Render) and is never shipped to the browser.
 */

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "[mawj] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — data layer will fail at runtime."
  );
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  if (!url || !serviceKey) {
    throw new Error("Supabase env vars are not configured.");
  }
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Tables physically live in the isolated `mawj_trade_finance` schema; a set
    // of updatable views in `public` (named identically) exposes them to the
    // PostgREST API so the existing `public` tables of this Supabase project
    // are never touched. The default (public) schema is used here.
  });
  return _client;
}

/** The fixed demo profile id (Aspidus DMCC / Vladimir Maljm). */
export const PROFILE_ID = "11111111-1111-1111-1111-111111111111";
