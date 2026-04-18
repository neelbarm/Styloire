import { NextResponse } from "next/server";
import { getAuthedServiceRoleClient, getCurrentUser } from "@/lib/supabase/server";
import { ensurePublicUserRow } from "@/lib/supabase/ensure-public-user";
import { isSupabaseConfigured } from "@/lib/supabase/service";

function normalizeList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const e = entry.trim().toLowerCase();
    if (!e || !e.includes("@")) continue;
    if (seen.has(e)) continue;
    seen.add(e);
    out.push(e);
  }
  return out;
}

export async function GET() {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ emails: [] as string[] });
  }

  const { data, error } = await authed.client
    .from("users")
    .select("cc_emails")
    .eq("id", authed.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    emails: normalizeList(data?.cc_emails),
  });
}

export async function PUT(request: Request) {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user?.email) {
    return NextResponse.json({ error: "User email missing." }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as { emails?: unknown };
  const emails = normalizeList(body.emails);

  try {
    await ensurePublicUserRow(authed.client, {
      id: authed.userId,
      email: user.email,
      name: user.user_metadata?.full_name as string | undefined,
    });

    const { error } = await authed.client
      .from("users")
      .update({
        cc_emails: emails,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authed.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, emails });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "update_failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
