import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Render health check endpoint. */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mawj-trade-finance",
    time: new Date().toISOString(),
  });
}
