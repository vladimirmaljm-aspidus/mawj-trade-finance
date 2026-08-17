import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { getSupabase, PROFILE_ID } from "./supabase-server";
import { randomBytes } from "crypto";

/**
 * WebAuthn (passkey / Face ID / Touch ID / fingerprint) server helpers.
 *
 * The RP ID and origin are derived from the incoming request so the same
 * deployment works on Render (https://aspidus.onrender.com) and any other
 * HTTPS host without reconfiguration.
 */

export interface RpContext {
  rpID: string;
  expectedOrigin: string;
}

export function getRpContext(req: Request): RpContext {
  // Prefer explicit override, else derive from request headers.
  const override = process.env.EXPECTED_ORIGIN;
  if (override) {
    const u = new URL(override);
    return { rpID: u.hostname, expectedOrigin: override };
  }
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost";
  const expectedOrigin = `${proto}://${host}`;
  const rpID = host.split(":")[0];
  return { rpID, expectedOrigin };
}

function randomChallenge(): string {
  return randomBytes(32).toString("base64url");
}

const RP_NAME = "Commercial Bank International";

/** Store a challenge in auth_challenges and return the challenge string. */
async function persistChallenge(purpose: "register" | "auth"): Promise<string> {
  const challenge = randomChallenge();
  const supabase = getSupabase();
  const { error } = await supabase.from("auth_challenges").insert({
    profile_id: PROFILE_ID,
    challenge,
    purpose,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
  });
  if (error) throw new Error("Could not persist challenge.");
  return challenge;
}

/** Validate + consume a challenge (single use). */
async function consumeChallenge(
  challenge: string,
  purpose: "register" | "auth"
): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("auth_challenges")
    .select("id, expires_at, used")
    .eq("profile_id", PROFILE_ID)
    .eq("challenge", challenge)
    .eq("purpose", purpose)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) return false;
  const row = data[0];
  if (row.used) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;
  await supabase.from("auth_challenges").update({ used: true }).eq("id", row.id);
  return true;
}

// ---------- Registration ----------

export async function beginRegistration(req: Request) {
  const { rpID } = getRpContext(req);
  const challenge = await persistChallenge("register");

  // List existing credential ids so the authenticator skips duplicates.
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("webauthn_credentials")
    .select("credential_id")
    .eq("profile_id", PROFILE_ID);
  const excludeCredentials = (existing ?? []).map((c) => ({
    id: c.credential_id,
    type: "public-key" as const,
  }));

  const options: PublicKeyCredentialCreationOptionsJSON =
    generateRegistrationOptions({
      rpName: RP_NAME,
      rpID,
      userName: "vladimir.maljm@aspidus.ae",
      userDisplayName: "Vladimir Maljm",
      challenge,
      timeout: 60000,
      attestationType: "none",
      excludeCredentials,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
      supportedAlgorithmIDs: [-7, -257],
    });
  return options;
}

export async function finishRegistration(
  req: Request,
  credential: RegistrationResponseJSON,
  deviceLabel: string
): Promise<{ ok: true; credentialId: string } | { ok: false; reason: string }> {
  const { rpID, expectedOrigin } = getRpContext(req);
  const expectedChallenge = credential.response.clientDataJSON
    ? undefined
    : undefined;
  void expectedChallenge;
  // Decode challenge from clientDataJSON:
  const clientData = JSON.parse(
    Buffer.from(credential.response.clientDataJSON, "base64url").toString("utf8")
  );
  if (!(await consumeChallenge(clientData.challenge, "register"))) {
    return { ok: false, reason: "Stale or invalid registration challenge." };
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: clientData.challenge,
      expectedOrigin,
      expectedRPID: rpID,
    });
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { ok: false, reason: "Registration verification failed." };
  }
  const info = verification.registrationInfo;
  const credentialId = info.credentialID;
  const publicKey = Buffer.from(info.credentialPublicKey);
  const transports = info.credentialDeviceType ? [] : [];

  const supabase = getSupabase();
  // upsert (replace if same credential id re-registered)
  const { error } = await supabase.from("webauthn_credentials").upsert(
    {
      profile_id: PROFILE_ID,
      credential_id: credentialId,
      public_key: publicKey,
      counter: info.counter,
      device_type: deviceLabel || "WebAuthn device",
      transports,
      nickname: deviceLabel || "Primary device",
    },
    { onConflict: "credential_id" }
  );
  if (error) return { ok: false, reason: error.message };

  return { ok: true, credentialId };
}

// ---------- Authentication ----------

export async function beginAuthentication(req: Request) {
  const { rpID } = getRpContext(req);
  const challenge = await persistChallenge("auth");

  const supabase = getSupabase();
  const { data: creds } = await supabase
    .from("webauthn_credentials")
    .select("credential_id, counter, public_key")
    .eq("profile_id", PROFILE_ID);
  const allowCredentials = (creds ?? []).map((c) => ({
    id: c.credential_id,
    type: "public-key" as const,
  }));

  const options: PublicKeyCredentialRequestOptionsJSON = generateAuthenticationOptions({
    rpID,
    challenge,
    timeout: 60000,
    allowCredentials,
    userVerification: "preferred",
  });
  return options;
}

export async function finishAuthentication(
  req: Request,
  credential: AuthenticationResponseJSON
): Promise<{ ok: true; counter: number } | { ok: false; reason: string }> {
  const { rpID, expectedOrigin } = getRpContext(req);
  const clientData = JSON.parse(
    Buffer.from(credential.response.clientDataJSON, "base64url").toString("utf8")
  );
  if (!(await consumeChallenge(clientData.challenge, "auth"))) {
    return { ok: false, reason: "Stale or invalid authentication challenge." };
  }

  const supabase = getSupabase();
  // Find the matching credential by id.
  const credId = credential.id;
  const { data: cred } = await supabase
    .from("webauthn_credentials")
    .select("id, credential_id, public_key, counter")
    .eq("profile_id", PROFILE_ID)
    .eq("credential_id", credId)
    .limit(1);
  if (!cred || cred.length === 0) {
    return { ok: false, reason: "Unknown credential." };
  }
  const record = cred[0];

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: clientData.challenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: record.credential_id,
        publicKey: new Uint8Array(record.public_key as unknown as number[]),
        counter: record.counter,
      },
    });
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }

  if (!verification.verified) return { ok: false, reason: "Authentication failed." };

  // Bump the stored counter.
  await supabase
    .from("webauthn_credentials")
    .update({ counter: verification.authenticationInfo.newCounter })
    .eq("id", record.id);

  return { ok: true, counter: verification.authenticationInfo.newCounter };
}

/** Whether the profile has at least one enrolled credential. */
export async function hasEnrolledCredential(): Promise<boolean> {
  const supabase = getSupabase();
  const { count } = await supabase
    .from("webauthn_credentials")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", PROFILE_ID);
  return (count ?? 0) > 0;
}
