import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/mawj/session";
import { getSupabase } from "@/lib/mawj/supabase-server";

export const dynamic = "force-dynamic";

/** PATCH /api/cards/[id]/freeze — toggle frozen state on a card. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const frozen = Boolean(body.frozen);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("cards")
    .update({ frozen })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ card: data });
}
