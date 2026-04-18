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

  const { data: row, error: fetchError } = await authed.client
    .from("connected_accounts")
    .select("id,status")
    .eq("id", body.accountId)
    .eq("user_id", authed.userId)
    .maybeSingle();

  if (fetchError || !row) {
    return NextResponse.json(
      { error: fetchError?.message ?? "Account not found." },
      { status: 404 },
    );
  }

  if (row.status !== "active") {
    return NextResponse.json(
      {
        error:
          "This account must pass a test send before it can be set as the active sender.",
      },
      { status: 400 },
    );
  }

  await authed.client
    .from("connected_accounts")
    .update({ is_sending_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", authed.userId);

  const { error: updateError } = await authed.client
    .from("connected_accounts")
    .update({ is_sending_active: true, updated_at: new Date().toISOString() })
    .eq("id", body.accountId)
    .eq("user_id", authed.userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
