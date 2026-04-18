import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";

type PatchPayload = {
  status?: "draft" | "active" | "archived";
  followupDate?: string | null;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = (await request.json().catch(() => ({}))) as PatchPayload;
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, source: "mock" });
  }
  const supabase = authed.client;

  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  if (Object.hasOwn(body, "followupDate")) patch.followup_date = body.followupDate;

  const { error } = await supabase
    .from("requests")
    .update(patch)
    .eq("id", params.id)
    .eq("user_id", authed.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
