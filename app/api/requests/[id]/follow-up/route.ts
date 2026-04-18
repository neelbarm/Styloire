import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, sentCount: 0, source: "mock" });
  }
  const supabase = authed.client;

  const userId = authed.userId;
  const { data: request, error: reqError } = await supabase
    .from("requests")
    .select("id,user_id")
    .eq("id", params.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (reqError || !request) {
    return NextResponse.json({ error: reqError?.message ?? "Request not found." }, { status: 404 });
  }

  const { data: rows, error: rcError } = await supabase
    .from("request_contacts")
    .select("id")
    .eq("request_id", params.id)
    .eq("selected", true)
    .eq("email_sent", true)
    .eq("responded", false);

  if (rcError) {
    return NextResponse.json({ error: rcError.message }, { status: 500 });
  }

  const ids = (rows ?? []).map((row) => row.id);
  if (ids.length) {
    const { error: updateError } = await supabase
      .from("request_contacts")
      .update({ sent_at: new Date().toISOString() })
      .in("id", ids);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  const { error: requestError } = await supabase
    .from("requests")
    .update({ followup_sent: true })
    .eq("id", params.id)
    .eq("user_id", userId);

  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sentCount: ids.length });
}
