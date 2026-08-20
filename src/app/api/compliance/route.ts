import { NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

/** GET /api/compliance — active compliance case + documents + timeline. */
export async function GET() {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();

  const [caseRes, docsRes, timelineRes] = await Promise.all([
    supabase
      .from("compliance_cases")
      .select("*")
      .eq("profile_id", PROFILE_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("compliance_documents")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("compliance_timeline")
      .select("*")
      .order("occurred_at", { ascending: true }),
  ]);

  if (caseRes.error) {
    return NextResponse.json({ error: caseRes.error.message }, { status: 500 });
  }

  const caseRow = caseRes.data;
  if (!caseRow) {
    return NextResponse.json({ case: null });
  }

  return NextResponse.json({
    case: {
      ...caseRow,
      amount_blocked: Number(caseRow.amount_blocked),
      documents: (docsRes.data ?? []).map((d) => ({ ...d })),
      timeline: (timelineRes.data ?? []).map((t) => ({ ...t })),
    },
  });
}
