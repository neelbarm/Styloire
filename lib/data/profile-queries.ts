import "server-only";

import {
  getProfileWithContacts as getMockBundle,
  listProfiles as listMockProfiles
} from "@/lib/styloire/mock-data";
import type {
  BrandContact,
  ClientProfile,
  ClientProfileSummary,
  RequestSummary
} from "@/lib/styloire/types";
import { createServiceRoleClient, isSupabaseConfigured } from "@/lib/supabase/service";
import { getCurrentUserId } from "@/lib/supabase/server";

export type ProfileDetailResult = {
  source: "mock" | "supabase";
  profile: ClientProfile;
  contacts: BrandContact[];
  requests: RequestSummary[];
};

function mapContact(c: Record<string, unknown>): BrandContact {
  return {
    id: String(c.id),
    client_profile_id: String(c.client_profile_id),
    brand_name: String(c.brand_name),
    email: String(c.email),
    contact_name: c.contact_name ? String(c.contact_name) : null,
    is_active: Boolean(c.is_active),
    created_at: String(c.created_at),
    updated_at: String(c.updated_at)
  };
}

function mapRequest(r: Record<string, unknown>): RequestSummary {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    client_profile_id: r.client_profile_id ? String(r.client_profile_id) : null,
    talent_name: String(r.talent_name),
    event_name: String(r.event_name),
    email_subject_template: String(r.email_subject_template ?? ""),
    email_body: String(r.email_body ?? ""),
    status: r.status as RequestSummary["status"],
    followup_date: r.followup_date ? String(r.followup_date) : null,
    followup_body: r.followup_body ? String(r.followup_body) : null,
    followup_sent: Boolean(r.followup_sent),
    sent_at: r.sent_at ? String(r.sent_at) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    selected_count: Number(r.selected_count ?? 0),
    sent_count: Number(r.sent_count ?? 0),
    opened_count: Number(r.opened_count ?? 0),
    responded_count: Number(r.responded_count ?? 0)
  };
}

function mapProfileSummary(
  row: Record<string, unknown>,
  counts: { contactCount: number; requestCount: number }
): ClientProfileSummary {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    talent_name: String(row.talent_name),
    last_used_at: row.last_used_at ? String(row.last_used_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    contact_count: counts.contactCount,
    request_count: counts.requestCount
  };
}

export async function listClientProfileSummaries(): Promise<ClientProfileSummary[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const mockRows = listMockProfiles();
  if (!isSupabaseConfigured()) {
    return mockRows;
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return mockRows;
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("client_profiles")
    .select("id,user_id,talent_name,last_used_at,created_at,updated_at")
    .eq("user_id", userId)
    .order("last_used_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (profileError || !profileRows) {
    return mockRows;
  }

  if (!profileRows.length) {
    return [];
  }

  const profileIds = profileRows.map((row) => String(row.id));

  const [{ data: contactRows }, { data: requestRows }] = await Promise.all([
    supabase
      .from("brand_contacts")
      .select("client_profile_id")
      .in("client_profile_id", profileIds)
      .eq("is_active", true),
    supabase
      .from("requests")
      .select("client_profile_id")
      .in("client_profile_id", profileIds)
      .eq("user_id", userId)
  ]);

  const contactCounts = new Map<string, number>();
  for (const row of contactRows ?? []) {
    const key = String(row.client_profile_id);
    contactCounts.set(key, (contactCounts.get(key) ?? 0) + 1);
  }

  const requestCounts = new Map<string, number>();
  for (const row of requestRows ?? []) {
    if (!row.client_profile_id) continue;
    const key = String(row.client_profile_id);
    requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1);
  }

  return profileRows.map((row) =>
    mapProfileSummary(row as Record<string, unknown>, {
      contactCount: contactCounts.get(String(row.id)) ?? 0,
      requestCount: requestCounts.get(String(row.id)) ?? 0
    })
  );
}

export async function getProfileDetail(
  profileId: string
): Promise<ProfileDetailResult | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const mock = getMockBundle(profileId);

  if (!isSupabaseConfigured()) {
    if (!mock) return null;
    return { source: "mock", ...mock };
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    if (!mock) return null;
    return { source: "mock", ...mock };
  }

  // Verify profile belongs to this user
  const { data: profileRow, error: profileErr } = await supabase
    .from("client_profiles")
    .select("id,user_id,talent_name,last_used_at,created_at,updated_at")
    .eq("id", profileId)
    .eq("user_id", userId)
    .maybeSingle();

  if (profileErr || !profileRow) {
    if (!mock) return null;
    return { source: "mock", ...mock };
  }

  const profile: ClientProfile = {
    id: String(profileRow.id),
    user_id: String(profileRow.user_id),
    talent_name: String(profileRow.talent_name),
    last_used_at: profileRow.last_used_at ? String(profileRow.last_used_at) : null,
    created_at: String(profileRow.created_at),
    updated_at: String(profileRow.updated_at)
  };

  const { data: contactRows } = await supabase
    .from("brand_contacts")
    .select("id,client_profile_id,brand_name,email,contact_name,is_active,created_at,updated_at")
    .eq("client_profile_id", profileId)
    .eq("is_active", true)
    .order("brand_name", { ascending: true });

  const contacts: BrandContact[] = (contactRows ?? []).map((c) =>
    mapContact(c as Record<string, unknown>)
  );

  const { data: requestRows } = await supabase
    .from("requests")
    .select(
      "id,user_id,client_profile_id,talent_name,event_name,email_subject_template,email_body,status," +
        "followup_date,followup_body,followup_sent,sent_at,created_at,updated_at"
    )
    .eq("client_profile_id", profileId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const normalizedRequestRows = (requestRows ?? []) as unknown as Record<string, unknown>[];
  const requestIds = normalizedRequestRows.map((row) => String(row.id));
  let requestCounts = new Map<
    string,
    { selected_count: number; sent_count: number; opened_count: number; responded_count: number }
  >();

  if (requestIds.length > 0) {
    const { data: requestContactRows } = await supabase
      .from("request_contacts")
      .select("request_id,selected,email_sent,opened,responded")
      .in("request_id", requestIds);

    requestCounts = (requestContactRows ?? []).reduce((acc, row) => {
      const key = String(row.request_id);
      const current = acc.get(key) ?? {
        selected_count: 0,
        sent_count: 0,
        opened_count: 0,
        responded_count: 0
      };
      if (row.selected) current.selected_count += 1;
      if (row.email_sent) current.sent_count += 1;
      if (row.opened) current.opened_count += 1;
      if (row.responded) current.responded_count += 1;
      acc.set(key, current);
      return acc;
    }, new Map<string, { selected_count: number; sent_count: number; opened_count: number; responded_count: number }>());
  }

  const requests: RequestSummary[] = normalizedRequestRows.map((r) => {
    const mapped = mapRequest(r);
    const counts = requestCounts.get(mapped.id);
    if (!counts) return mapped;
    return {
      ...mapped,
      selected_count: counts.selected_count,
      sent_count: counts.sent_count,
      opened_count: counts.opened_count,
      responded_count: counts.responded_count
    };
  });

  return { source: "supabase", profile, contacts, requests };
}
