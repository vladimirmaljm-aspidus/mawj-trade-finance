import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

/** GET /api/transactions/[id] — single transaction receipt. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ transaction: { ...data, amount: Number(data.amount) } });
}
