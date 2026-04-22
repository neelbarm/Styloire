import { NextResponse } from "next/server";
import { dispatchOutboundEmail } from "@/lib/email/dispatch-outbound";
import type { ConnectedAccountRow } from "@/lib/email/dispatch-outbound";
import type { SendEmailInput } from "@/lib/email/types";
import { getAuthedServiceRoleClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";

function normalizeCcList(raw: string[] | null | undefined): string[] {
  if (!raw?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of raw) {
    const e = entry.trim().toLowerCase();
    if (!e || !e.includes("@")) continue;
    if (seen.has(e)) continue;
    seen.add(e);
    out.push(e);
  }
  return out;
}

export async function POST(request: Request) {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    accountId?: string;
    to?: string;
  };

  if (!body.accountId) {
    return NextResponse.json({ error: "accountId is required." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user?.email) {
    return NextResponse.json({ error: "User email missing." }, { status: 400 });
  }

  const { data: account, error: accErr } = await authed.client
    .from("connected_accounts")
    .select("*")
    .eq("user_id", authed.userId)
    .eq("id", body.accountId)
    .maybeSingle();

  if (accErr) {
    return NextResponse.json({ error: accErr.message }, { status: 500 });
  }

  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const { data: userRow } = await authed.client
    .from("users")
    .select("cc_emails")
    .eq("id", authed.userId)
    .maybeSingle();

  const cc = normalizeCcList((userRow?.cc_emails as string[]) ?? []);

  const to = (body.to?.trim().toLowerCase() || user.email.toLowerCase()) as string;

  const row = account as ConnectedAccountRow;
  const message: SendEmailInput = {
    to: [{ email: to }],
    subject: "Styloire connection test",
    bodyText:
      "This is a test message from Styloire. If you received it, your connected account can send mail.",
    cc,
    fromEmail: row.email,
    fromName: row.display_name,
  };

  const result = await dispatchOutboundEmail(authed.client, row, message);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  await authed.client
    .from("connected_accounts")
    .update({
      status: "active",
      last_error_message: null,
      last_error_at: null,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("user_id", authed.userId);

  return NextResponse.json({ ok: true });
}
