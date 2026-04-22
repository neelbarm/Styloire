import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";

type ContactInput = {
  brand_name: string;
  email: string;
  contact_name: string;
};

type CreateRequestPayload = {
  talent: string;
  eventName: string;
  requestType: "new" | "existing";
  profileId?: string;
  contacts: ContactInput[];
  selectedBrands: string[];
  emailSubject?: string;
  emailBody: string;
};

function subjectTemplate(): string {
  return "{talent} / {event} / {brand_name}";
}

function normalizeSubjectTemplate(input?: string): string {
  const trimmed = input?.trim();
  if (!trimmed) return subjectTemplate();

  return trimmed
    .replace(/\{\{\s*talent\s*\}\}/gi, "{talent}")
    .replace(/\{\{\s*event\s*\}\}/gi, "{event}")
    .replace(/\{\{\s*brand_name\s*\}\}/gi, "{brand_name}")
    .replace(/BRAND NAME/gi, "{brand_name}");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeContact(contact: ContactInput): ContactInput | null {
  const brand_name = contact.brand_name?.trim().toUpperCase();
  const email = contact.email?.trim().toLowerCase();
  const contact_name = contact.contact_name?.trim() ?? "";

  if (!brand_name || !email || !isValidEmail(email)) {
    return null;
  }

  return {
    brand_name,
    email,
    contact_name
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateRequestPayload;
  if (!body.talent?.trim() || !body.eventName?.trim()) {
    return NextResponse.json({ error: "Missing request fields." }, { status: 400 });
  }
  if (body.requestType !== "existing" && !body.contacts?.length) {
    return NextResponse.json({ error: "At least one contact is required." }, { status: 400 });
  }

  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      source: "mock",
      previewOnly: true,
      notice: "Supabase is not configured, so this request was not saved or sent."
    });
  }
  const supabase = authed.client;

  const userId = authed.userId;
  let clientProfileId: string | null = null;
  let contactRows: Array<{ id: string; brand_name: string }> = [];

  if (body.requestType === "existing" && body.profileId) {
    const { data: profileRow, error: profileError } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("id", body.profileId)
      .eq("user_id", userId)
      .maybeSingle();
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    if (!profileRow) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }
    clientProfileId = String(profileRow.id);
    const { data: existing, error: existingError } = await supabase
      .from("brand_contacts")
      .select("id,brand_name")
      .eq("client_profile_id", clientProfileId)
      .eq("is_active", true);
    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }
    contactRows = (existing ?? []).map((row) => ({
      id: String(row.id),
      brand_name: String(row.brand_name)
    }));
    if (!contactRows.length) {
      return NextResponse.json(
        { error: "This saved profile does not have any active contacts yet." },
        { status: 400 }
      );
    }
  } else {
    const normalizedContacts = body.contacts
      .map(normalizeContact)
      .filter((contact): contact is ContactInput => contact !== null);

    if (!normalizedContacts.length) {
      return NextResponse.json(
        { error: "At least one valid contact with a brand name and email is required." },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("client_profiles")
      .insert({
        user_id: userId,
        talent_name: body.talent.trim(),
        last_used_at: new Date().toISOString()
      })
      .select("id")
      .single();
    if (profileError || !profile) {
      return NextResponse.json({ error: profileError?.message ?? "Profile creation failed." }, { status: 500 });
    }
    clientProfileId = String(profile.id);

    const dedupedByBrandAndEmail = new Map<string, ContactInput>();
    for (const contact of normalizedContacts) {
      const dedupeKey = `${contact.brand_name}::${contact.email}`;
      dedupedByBrandAndEmail.set(dedupeKey, contact);
    }
    const inserts = [...dedupedByBrandAndEmail.values()].map((contact) => ({
      client_profile_id: clientProfileId,
      brand_name: contact.brand_name,
      email: contact.email,
      contact_name: contact.contact_name || null,
      is_active: true
    }));
    const { data: insertedContacts, error: contactsError } = await supabase
      .from("brand_contacts")
      .insert(inserts)
      .select("id,brand_name");
    if (contactsError) {
      return NextResponse.json({ error: contactsError.message }, { status: 500 });
    }
    contactRows = (insertedContacts ?? []).map((row) => ({
      id: String(row.id),
      brand_name: String(row.brand_name)
    }));
  }

  const { data: requestRow, error: requestError } = await supabase
    .from("requests")
    .insert({
      user_id: userId,
      client_profile_id: clientProfileId,
      talent_name: body.talent.trim(),
      event_name: body.eventName.trim(),
      email_subject_template: normalizeSubjectTemplate(body.emailSubject),
      email_body: body.emailBody,
      status: "draft",
      sent_at: null
    })
    .select("id")
    .single();
  if (requestError || !requestRow) {
    return NextResponse.json({ error: requestError?.message ?? "Request creation failed." }, { status: 500 });
  }

  const selectedSet = new Set(body.selectedBrands.map((brand) => brand.toUpperCase()));
  const requestContacts = contactRows.map((contact) => {
    const selected = selectedSet.has(contact.brand_name.toUpperCase());
    return {
      request_id: requestRow.id,
      brand_contact_id: contact.id,
      selected,
      email_sent: false,
      opened: false,
      responded: false,
      sent_at: null,
      send_error: null
    };
  });

  const { error: requestContactsError } = await supabase.from("request_contacts").insert(requestContacts);
  if (requestContactsError) {
    return NextResponse.json({ error: requestContactsError.message }, { status: 500 });
  }

  if (clientProfileId) {
    await supabase
      .from("client_profiles")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", clientProfileId);
  }

  return NextResponse.json({ ok: true, id: String(requestRow.id), source: "supabase" });
}
