import { NextResponse } from "next/server";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";

export async function GET() {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ accounts: [] });
  }

  const { data, error } = await authed.client
    .from("connected_accounts")
    .select(
      "id,user_id,provider,email,display_name,smtp_host,smtp_port,smtp_username,status,is_sending_active,last_error_message,last_error_at,created_at,updated_at",
    )
    .eq("user_id", authed.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ accounts: data ?? [] });
}
