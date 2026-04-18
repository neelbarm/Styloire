import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";

type PatchPayload = {
  responded?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = (await request.json().catch(() => ({}))) as PatchPayload;
  if (typeof body.responded !== "boolean") {
    return NextResponse.json({ error: "Missing responded flag." }, { status: 400 });
  }

  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, source: "mock" });
  }
  const supabase = authed.client;

  const { data: requestContact, error: lookupError } = await supabase
    .from("request_contacts")
    .select("id,request_id")
    .eq("id", params.id)
    .maybeSingle();
  if (lookupError || !requestContact) {
    return NextResponse.json({ error: "Request contact not found." }, { status: 404 });
  }

  const { data: requestRow, error: requestError } = await supabase
    .from("requests")
    .select("id,user_id")
    .eq("id", requestContact.request_id)
    .eq("user_id", authed.userId)
    .maybeSingle();
  if (requestError || !requestRow) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("request_contacts")
    .update({ responded: body.responded })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
