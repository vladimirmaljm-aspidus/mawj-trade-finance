import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET /api/biometric/auth/options — start WebAuthn authentication. */
export async function GET(req: NextRequest) {
  const { beginAuthentication } = await import("@/lib/mawj/webauthn");
  try {
    const options = await beginAuthentication(req);
    return NextResponse.json({ options });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
