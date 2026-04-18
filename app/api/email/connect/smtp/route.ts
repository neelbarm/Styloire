import { NextResponse } from "next/server";
import { encryptSecret } from "@/lib/crypto/encryption";
import { getAuthedServiceRoleClient, getCurrentUser } from "@/lib/supabase/server";
import { ensurePublicUserRow } from "@/lib/supabase/ensure-public-user";
import { isSupabaseConfigured } from "@/lib/supabase/service";

type Body = {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  fromEmail?: string;
  displayName?: string | null;
  secure?: boolean | null;
};

export async function POST(request: Request) {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const host = body.host?.trim();
  const port = body.port;
  const username = body.username?.trim();
  const password = body.password ?? "";
  const fromEmail = body.fromEmail?.trim().toLowerCase();

  if (!host || port == null || !username || !password || !fromEmail) {
    return NextResponse.json(
      { error: "host, port, username, password, and fromEmail are required." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return NextResponse.json({ error: "Invalid SMTP port." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user?.email) {
    return NextResponse.json({ error: "User email missing." }, { status: 400 });
  }

  try {
    await ensurePublicUserRow(authed.client, {
      id: authed.userId,
      email: user.email,
      name: user.user_metadata?.full_name as string | undefined,
    });

    const encPassword = encryptSecret(password);
    const secure =
      body.secure ?? (port === 465 ? true : false);

    const { data, error } = await authed.client
      .from("connected_accounts")
      .insert({
        user_id: authed.userId,
        provider: "smtp",
        email: fromEmail,
        display_name: body.displayName?.trim() || null,
        smtp_host: host,
        smtp_port: port,
        smtp_username: username,
        smtp_password_encrypted: encPassword,
        smtp_secure: secure,
        status: "inactive",
        is_sending_active: false,
        access_token_encrypted: null,
        refresh_token_encrypted: null,
        token_expires_at: null,
        last_error_message: null,
        last_error_at: null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not save SMTP account." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, id: data.id as string });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "encrypt_failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
