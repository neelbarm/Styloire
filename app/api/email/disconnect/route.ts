import { NextResponse } from "next/server";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { accountId?: string };
  if (!body.accountId) {
    return NextResponse.json({ error: "accountId is required." }, { status: 400 });
  }

  const { error } = await authed.client
    .from("connected_accounts")
    .delete()
    .eq("id", body.accountId)
    .eq("user_id", authed.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
