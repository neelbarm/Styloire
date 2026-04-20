import { NextResponse } from "next/server";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { MOCK_CONTACTS } from "@/lib/styloire/mock-data";

// ── Helpers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertProfileOwnership(supabase: any, profileId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("id", profileId)
    .eq("user_id", userId)
    .maybeSingle();
  return !error && !!data;
}

// ── GET /api/brand-contacts?profile_id=xxx ────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profile_id");
  if (!profileId) {
    return NextResponse.json({ error: "profile_id is required." }, { status: 400 });
  }

  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    const contacts = MOCK_CONTACTS.filter((c) => c.client_profile_id === profileId);
    return NextResponse.json({ contacts, source: "mock" });
  }

  const supabase = authed.client;
  const owned = await assertProfileOwnership(supabase, profileId, authed.userId);
  if (!owned) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("brand_contacts")
    .select("id,client_profile_id,brand_name,email,contact_name,is_active,created_at,updated_at")
    .eq("client_profile_id", profileId)
    .eq("is_active", true)
    .order("brand_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contacts: data ?? [], source: "supabase" });
}

// ── POST /api/brand-contacts ──────────────────────────────────────────────────

type CreatePayload = {
  profile_id: string;
  brand_name: string;
  email: string;
  contact_name?: string | null;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreatePayload;
  const { profile_id, brand_name, email, contact_name } = body;

  if (!profile_id || !brand_name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "profile_id, brand_name, and email are required." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    // Return a mock row so the client can add it to local state
    return NextResponse.json({
      contact: {
        id: `bc_mock_${Date.now()}`,
        client_profile_id: profile_id,
        brand_name: brand_name.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        contact_name: contact_name?.trim() || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      source: "mock"
    });
  }

  const supabase = authed.client;
  const owned = await assertProfileOwnership(supabase, profile_id, authed.userId);
  if (!owned) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  // Check for duplicate email within this profile
  const { data: existing } = await supabase
    .from("brand_contacts")
    .select("id")
    .eq("client_profile_id", profile_id)
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "A contact with this email already exists." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("brand_contacts")
    .insert({
      client_profile_id: profile_id,
      brand_name: brand_name.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      contact_name: contact_name?.trim() || null,
      is_active: true
    })
    .select("id,client_profile_id,brand_name,email,contact_name,is_active,created_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contact: data, source: "supabase" });
}
