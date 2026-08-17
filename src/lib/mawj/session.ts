import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { PROFILE_ID } from "./supabase-server";

/**
 * Signed session cookie (JWT). Issued after biometric verification,
 * verified on every protected API route.
 */

const COOKIE_NAME = "mawj_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h

export interface MawjSession extends JwtPayload {
  pid: string; // profile id
  method: "webauthn" | "passcode" | "demo";
  iat?: number;
  exp?: number;
}

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET is not configured.");
  }
  return s;
}

export function signSession(method: MawjSession["method"]): string {
  return jwt.sign({ pid: PROFILE_ID, method }, getSecret(), {
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function verifySession(token: string | undefined): MawjSession | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret()) as MawjSession;
    if (payload.pid !== PROFILE_ID) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Read the session from the request cookies (App Router, request scope). */
export function readSessionFromRequest(req: NextRequest): MawjSession | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

/** Read the session from next/headers cookies (server components / route handlers). */
export async function readSessionFromCookies(): Promise<MawjSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;

/** Set the session cookie (httpOnly) — used after successful auth. */
export async function setSessionCookie(method: MawjSession["method"]): Promise<void> {
  const token = signSession(method);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Clear the session cookie — used on logout. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
