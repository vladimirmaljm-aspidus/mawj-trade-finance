import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase, PROFILE_ID } from "@/lib/mawj/supabase-server";
import { WORK_CATEGORIES } from "@/lib/mawj/workbench";

export const dynamic = "force-dynamic";

/** GET /api/workbench — all work records (approvals, scheduled, cheques, books). */
export async function GET() {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("profile_id", PROFILE_ID)
    .in("category", [...WORK_CATEGORIES])
    .order("occurred_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    workItems: (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) })),
  });
}

/**
 * PATCH /api/workbench — generic work-record action.
 * Body: { id, action: "cancel" }
 *   cancel — for scheduled/standing orders (status -> Cancelled)
 */
export async function PATCH(req: NextRequest) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const { id, action } = (body ?? {}) as { id?: string; action?: string };
  if (!id || !action) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const supabase = getSupabase();

  const { data: row } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("profile_id", PROFILE_ID)
    .maybeSingle();
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (action === "cancel") {
    if (row.status !== "Scheduled") {
      return NextResponse.json(
        { error: "Only scheduled items can be cancelled." },
        { status: 422 }
      );
    }
    const { error } = await supabase
      .from("transactions")
      .update({ status: "Cancelled" })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
