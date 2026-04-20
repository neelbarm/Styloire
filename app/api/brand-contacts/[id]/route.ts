import { NextResponse } from "next/server";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";

type PatchPayload = {
  brand_name?: string;
  email?: string;
  contact_name?: string | null;
};

// ── PATCH /api/brand-contacts/[id] ───────────────────────────────────────────

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

  // Verify ownership via profile join
  const { data: contactRow, error: lookupErr } = await supabase
    .from("brand_contacts")
    .select("id,client_profile_id")
    .eq("id", params.id)
    .maybeSingle();

  if (lookupErr || !contactRow) {
    return NextResponse.json({ error: "Contact not found." }, { status: 404 });
  }

  const { data: profileRow, error: profileErr } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("id", contactRow.client_profile_id)
    .eq("user_id", authed.userId)
    .maybeSingle();

  if (profileErr || !profileRow) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.brand_name?.trim()) patch.brand_name = body.brand_name.trim().toUpperCase();
  if (body.email?.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    patch.email = body.email.trim().toLowerCase();
  }
  if ("contact_name" in body) {
    patch.contact_name = body.contact_name?.trim() || null;
  }

  const { error } = await supabase
    .from("brand_contacts")
    .update(patch)
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ── DELETE /api/brand-contacts/[id] ──────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, source: "mock" });
  }

  const supabase = authed.client;

  // Verify ownership
  const { data: contactRow, error: lookupErr } = await supabase
    .from("brand_contacts")
    .select("id,client_profile_id")
    .eq("id", params.id)
    .maybeSingle();

  if (lookupErr || !contactRow) {
    return NextResponse.json({ error: "Contact not found." }, { status: 404 });
  }

  const { data: profileRow, error: profileErr } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("id", contactRow.client_profile_id)
    .eq("user_id", authed.userId)
    .maybeSingle();

  if (profileErr || !profileRow) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Soft-delete: set is_active = false so existing request_contacts still resolve
  const { error } = await supabase
    .from("brand_contacts")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
