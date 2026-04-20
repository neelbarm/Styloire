import { NextResponse } from "next/server";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import type { BrandContact } from "@/lib/styloire/types";

// Client sends already-parsed contacts (brand_name, email, contact_name).
// Server deduplicates against existing DB rows by email, then bulk-inserts.

type ParsedContactInput = {
  brand_name: string;
  email: string;
  contact_name: string | null;
};

type ImportPayload = {
  profile_id: string;
  contacts: ParsedContactInput[];
};

export type ImportResult = {
  added: number;
  skipped: number;
  errors: string[];
  contacts: BrandContact[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ImportPayload;
  const { profile_id, contacts } = body;

  if (!profile_id) {
    return NextResponse.json({ error: "profile_id is required." }, { status: 400 });
  }
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: "No contacts provided." }, { status: 400 });
  }

  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    // Return mock-inserted rows so the client can merge into local state
    const mockRows: BrandContact[] = contacts.map((c, i) => ({
      id: `bc_mock_import_${Date.now()}_${i}`,
      client_profile_id: profile_id,
      brand_name: c.brand_name,
      email: c.email,
      contact_name: c.contact_name,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    return NextResponse.json({
      added: mockRows.length,
      skipped: 0,
      errors: [],
      contacts: mockRows,
      source: "mock"
    } satisfies ImportResult & { source: string });
  }

  const supabase = authed.client;

  // Verify profile belongs to this user
  const { data: profileRow, error: profileErr } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("id", profile_id)
    .eq("user_id", authed.userId)
    .maybeSingle();

  if (profileErr || !profileRow) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  // Fetch existing emails for this profile to deduplicate
  const { data: existing } = await supabase
    .from("brand_contacts")
    .select("email")
    .eq("client_profile_id", profile_id)
    .eq("is_active", true);

  const existingEmails = new Set(
    (existing ?? []).map((r) => (r.email as string).toLowerCase())
  );

  const errors: string[] = [];
  const toInsert: Array<{
    client_profile_id: string;
    brand_name: string;
    email: string;
    contact_name: string | null;
    is_active: boolean;
  }> = [];

  for (const c of contacts) {
    const email = c.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Skipped invalid email: ${c.email}`);
      continue;
    }
    if (existingEmails.has(email)) continue; // silent dedupe
    existingEmails.add(email); // prevent duplicates within this batch
    toInsert.push({
      client_profile_id: profile_id,
      brand_name: c.brand_name.trim().toUpperCase(),
      email,
      contact_name: c.contact_name?.trim() || null,
      is_active: true
    });
  }

  const skipped = contacts.length - toInsert.length - errors.length;

  if (toInsert.length === 0) {
    return NextResponse.json({
      added: 0,
      skipped,
      errors,
      contacts: [],
      source: "supabase"
    } satisfies ImportResult & { source: string });
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("brand_contacts")
    .insert(toInsert)
    .select("id,client_profile_id,brand_name,email,contact_name,is_active,created_at,updated_at");

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const newContacts: BrandContact[] = (inserted ?? []).map((c) => ({
    id: String(c.id),
    client_profile_id: String(c.client_profile_id),
    brand_name: String(c.brand_name),
    email: String(c.email),
    contact_name: c.contact_name ? String(c.contact_name) : null,
    is_active: Boolean(c.is_active),
    created_at: String(c.created_at),
    updated_at: String(c.updated_at)
  }));

  return NextResponse.json({
    added: newContacts.length,
    skipped,
    errors,
    contacts: newContacts,
    source: "supabase"
  } satisfies ImportResult & { source: string });
}
