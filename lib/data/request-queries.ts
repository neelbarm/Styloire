import "server-only";

import {
  getRequestDetail as getMockRequestDetail,
  listRequests as listMockRequests,
  type RequestContactDetail
} from "@/lib/styloire/mock-data";
import type { RequestStatus, RequestSummary } from "@/lib/styloire/types";
import { createServiceRoleClient, isSupabaseConfigured } from "@/lib/supabase/service";
import { getCurrentUserId } from "@/lib/supabase/server";

export type RequestListResult = {
  source: "mock" | "supabase";
  rows: RequestSummary[];
  notice?: string;
};

export type RequestDetailResult = {
  source: "mock" | "supabase";
  request: RequestSummary;
  rows: RequestContactDetail[];
  notice?: string;
};

function mapDashboardRow(row: Record<string, unknown>): RequestSummary {
  const followup = row.followup_date;
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    client_profile_id: row.client_profile_id ? String(row.client_profile_id) : null,
    talent_name: String(row.talent_name),
    event_name: String(row.event_name),
    email_subject_template: String(row.email_subject_template ?? ""),
    email_body: String(row.email_body ?? ""),
    status: row.status as RequestStatus,
    followup_date:
      followup === null || followup === undefined
        ? null
        : typeof followup === "string"
          ? followup.slice(0, 10)
          : String(followup).slice(0, 10),
    followup_body: row.followup_body ? String(row.followup_body) : null,
    followup_sent: Boolean(row.followup_sent),
    sent_at: row.sent_at ? String(row.sent_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    selected_count: Number(row.selected_count ?? 0),
    sent_count: Number(row.sent_count ?? 0),
    opened_count: Number(row.opened_count ?? 0),
    responded_count: Number(row.responded_count ?? 0)
  };
}

function mapRequestRowToPartialSummary(req: Record<string, unknown>): RequestSummary {
  const followup = req.followup_date;
  return {
    id: String(req.id),
    user_id: String(req.user_id),
    client_profile_id: req.client_profile_id ? String(req.client_profile_id) : null,
    talent_name: String(req.talent_name),
    event_name: String(req.event_name),
    email_subject_template: String(req.email_subject_template ?? ""),
    email_body: String(req.email_body ?? ""),
    status: req.status as RequestStatus,
    followup_date:
      followup === null || followup === undefined
        ? null
        : typeof followup === "string"
          ? followup.slice(0, 10)
          : String(followup).slice(0, 10),
    followup_body: req.followup_body ? String(req.followup_body) : null,
    followup_sent: Boolean(req.followup_sent),
    sent_at: req.sent_at ? String(req.sent_at) : null,
    created_at: String(req.created_at),
    updated_at: String(req.updated_at),
    selected_count: 0,
    sent_count: 0,
    opened_count: 0,
    responded_count: 0
  };
}

export async function listDashboardRequestSummaries(
  filter: RequestStatus | "all"
): Promise<RequestListResult> {
  const mockRows = listMockRequests(filter === "all" ? undefined : filter);
  const userId = await getCurrentUserId();
  if (!userId) {
    return { source: "supabase", rows: [], notice: "Sign in to view your requests." };
  }

  if (!isSupabaseConfigured()) {
    return { source: "mock", rows: mockRows };
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return {
      source: "supabase",
      rows: [],
      notice: "Supabase client is unavailable for request listing."
    };
  }

  let query = supabase
    .from("request_dashboard_rows")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;

  if (error) {
    return {
      source: "supabase",
      rows: [],
      notice: `Supabase list failed (${error.message}).`
    };
  }

  if (!data?.length) {
    return {
      source: "supabase",
      rows: [],
      notice: "Supabase returned zero requests for this authenticated user."
    };
  }

  return { source: "supabase", rows: data.map((r) => mapDashboardRow(r as Record<string, unknown>)) };
}

async function fetchSummaryFromView(
  supabase: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  requestId: string,
  userId: string
): Promise<RequestSummary | null> {
  const { data, error } = await supabase
    .from("request_dashboard_rows")
    .select("*")
    .eq("id", requestId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDashboardRow(data as Record<string, unknown>);
}

export async function getRequestDetailResolved(
  requestId: string
): Promise<RequestDetailResult | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  if (!isSupabaseConfigured()) {
    const mock = getMockRequestDetail(requestId);
    if (!mock) return null;
    return { source: "mock", request: mock.request, rows: mock.rows };
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return null;
  }

  const { data: reqRow, error: reqErr } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .eq("user_id", userId)
    .maybeSingle();

  if (reqErr || !reqRow) {
    return null;
  }

  const { data: rcRows, error: rcErr } = await supabase
    .from("request_contacts")
    .select(
      "id,request_id,brand_contact_id,selected,email_sent,opened,responded,sent_at,send_error",
    )
    .eq("request_id", requestId);

  if (rcErr) {
    const summary =
      (await fetchSummaryFromView(supabase, requestId, userId)) ??
      mapRequestRowToPartialSummary(reqRow as Record<string, unknown>);
    return {
      source: "supabase",
      request: summary,
      rows: [],
      notice: rcErr.message
    };
  }

  const ids = [...new Set((rcRows ?? []).map((r) => r.brand_contact_id as string))];
  let merged: RequestContactDetail[] = [];

  if (ids.length) {
    const { data: bcRows, error: bcErr } = await supabase
      .from("brand_contacts")
      .select(
        "id,client_profile_id,brand_name,email,contact_name,is_active,created_at,updated_at"
      )
      .in("id", ids);

    if (bcErr) {
      const summary =
        (await fetchSummaryFromView(supabase, requestId, userId)) ??
        mapRequestRowToPartialSummary(reqRow as Record<string, unknown>);
      return {
        source: "supabase",
        request: summary,
        rows: [],
        notice: bcErr.message
      };
    }

    const byId = new Map((bcRows ?? []).map((b) => [b.id as string, b]));
    merged = (rcRows ?? []).map((rc) => {
      const bc = byId.get(rc.brand_contact_id as string);
      if (!bc) {
        return {
          ...(rc as RequestContactDetail),
          client_profile_id: "",
          brand_name: "UNKNOWN",
          email: "",
          contact_name: null,
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      return { ...(bc as object), ...(rc as object) } as RequestContactDetail;
    });
  }

  const summary =
    (await fetchSummaryFromView(supabase, requestId, userId)) ??
    mapRequestRowToPartialSummary(reqRow as Record<string, unknown>);

  return { source: "supabase", request: summary, rows: merged };
}
