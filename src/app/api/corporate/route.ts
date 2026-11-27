import { NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { DEPOSITS, LOAN_FACILITIES, TRADE_INSTRUMENTS } from "@/lib/mbanking/corporate-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/corporate — corporate banking reference data for the
 * authenticated signatory: trade finance instruments (LCs, LGs,
 * documentary collections, trust receipts), credit facilities and
 * deposits. Served from the server-side corporate data module so the
 * client store stays data-driven like every other dashboard payload.
 */
export async function GET() {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      tradeInstruments: TRADE_INSTRUMENTS,
      facilities: LOAN_FACILITIES,
      deposits: DEPOSITS,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
