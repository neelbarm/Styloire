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
  emailBody: string;
};

function subjectTemplate(): string {
  return "{talent} / {event} / {brand_name}";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateRequestPayload;
  if (!body.talent?.trim() || !body.eventName?.trim() || !body.contacts?.length) {
    return NextResponse.json({ error: "Missing request fields." }, { status: 400 });
  }

  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, id: "req_local_preview", source: "mock" });
  }
  const supabase = authed.client;

  const userId = authed.userId;
  let clientProfileId: string | null = null;
  let contactRows: Array<{ id: string; brand_name: string }> = [];

  if (body.requestType === "existing" && body.profileId) {
    clientProfileId = body.profileId;
    const { data: existing, error: existingError } = await supabase
      .from("brand_contacts")
      .select("id,brand_name")
      .eq("client_profile_id", body.profileId)
      .eq("is_active", true);
    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }
    contactRows = (existing ?? []).map((row) => ({
      id: String(row.id),
      brand_name: String(row.brand_name)
    }));
  } else {
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

    const dedupedByEmail = new Map<string, ContactInput>();
    for (const contact of body.contacts) {
      dedupedByEmail.set(contact.email.toLowerCase(), contact);
    }
    const inserts = [...dedupedByEmail.values()].map((contact) => ({
      client_profile_id: clientProfileId,
      brand_name: contact.brand_name.toUpperCase(),
      email: contact.email.toLowerCase(),
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
      email_subject_template: subjectTemplate(),
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
