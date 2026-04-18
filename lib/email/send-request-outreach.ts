import type { SupabaseClient } from "@supabase/supabase-js";
import { renderBracedFields, renderTemplate } from "@/lib/styloire/template-render";
import {
  dispatchOutboundEmail,
  type ConnectedAccountRow,
} from "./dispatch-outbound";
import type { SendEmailInput } from "./types";

const SEND_GAP_MS = 450;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

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

export type SendOutreachResult = {
  ok: boolean;
  error?: string;
  sent: number;
  failed: number;
  results: Array<{ requestContactId: string; ok: boolean; error?: string }>;
};

export async function sendRequestOutreach(params: {
  supabase: SupabaseClient;
  userId: string;
  requestId: string;
}): Promise<SendOutreachResult> {
  const { supabase, userId, requestId } = params;

  const { data: userRow } = await supabase
    .from("users")
    .select("cc_emails")
    .eq("id", userId)
    .maybeSingle();

  const ccEmails = normalizeCcList(
    (userRow?.cc_emails as string[] | null) ?? [],
  );

  const { data: account, error: accountError } = await supabase
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_sending_active", true)
    .eq("status", "active")
    .maybeSingle();

  if (accountError) {
    return {
      ok: false,
      error: accountError.message,
      sent: 0,
      failed: 0,
      results: [],
    };
  }

  if (!account) {
    return {
      ok: false,
      error:
        "No active sending account. Connect Gmail, Outlook, or SMTP in Settings, run a test send, then set the account as active.",
      sent: 0,
      failed: 0,
      results: [],
    };
  }

  const row = account as ConnectedAccountRow;

  const { data: reqRow, error: reqErr } = await supabase
    .from("requests")
    .select(
      "id,user_id,talent_name,event_name,email_subject_template,email_body,status",
    )
    .eq("id", requestId)
    .eq("user_id", userId)
    .maybeSingle();

  if (reqErr || !reqRow) {
    return {
      ok: false,
      error: reqErr?.message ?? "Request not found.",
      sent: 0,
      failed: 0,
      results: [],
    };
  }

  const { data: rcRows, error: rcErr } = await supabase
    .from("request_contacts")
    .select("id,brand_contact_id,selected,email_sent")
    .eq("request_id", requestId)
    .eq("selected", true)
    .eq("email_sent", false);

  if (rcErr) {
    return {
      ok: false,
      error: rcErr.message,
      sent: 0,
      failed: 0,
      results: [],
    };
  }

  const pending = rcRows ?? [];
  if (!pending.length) {
    const allDone = await finalizeRequestIfComplete(supabase, requestId, userId);
    return {
      ok: true,
      sent: 0,
      failed: 0,
      results: [],
      ...(allDone ? {} : {}),
    };
  }

  const brandIds = [...new Set(pending.map((r) => r.brand_contact_id as string))];
  const { data: bcRows, error: bcErr } = await supabase
    .from("brand_contacts")
    .select("id,brand_name,email,contact_name")
    .in("id", brandIds);

  if (bcErr) {
    return {
      ok: false,
      error: bcErr.message,
      sent: 0,
      failed: 0,
      results: [],
    };
  }

  const byBc = new Map((bcRows ?? []).map((b) => [b.id as string, b]));

  const results: SendOutreachResult["results"] = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const rc = pending[i]!;
    const bc = byBc.get(rc.brand_contact_id as string);
    if (!bc) {
      failed += 1;
      results.push({
        requestContactId: rc.id as string,
        ok: false,
        error: "Brand contact missing",
      });
      await supabase
        .from("request_contacts")
        .update({
          send_error: "Brand contact missing",
        })
        .eq("id", rc.id as string);
      continue;
    }

    const talent = String(reqRow.talent_name);
    const event = String(reqRow.event_name);
    const brandName = String(bc.brand_name);
    const contactName = String(bc.contact_name ?? "");
    const toEmail = String(bc.email).toLowerCase();

    const templateVars = {
      talent,
      event,
      brand_name: brandName,
      contact_name: contactName,
    };

    const subject = renderBracedFields(
      String(reqRow.email_subject_template),
      templateVars,
    );
    const bodyText = renderTemplate(String(reqRow.email_body), {
      talent,
      event,
      brand_name: brandName,
      contact_name: contactName,
    });

    const message: SendEmailInput = {
      to: toEmail,
      toName: contactName || null,
      subject,
      bodyText,
      cc: ccEmails,
      fromEmail: row.email,
      fromName: row.display_name,
    };

    const sendResult = await dispatchOutboundEmail(supabase, row, message);

    if (sendResult.ok) {
      sent += 1;
      results.push({ requestContactId: rc.id as string, ok: true });
      await supabase
        .from("request_contacts")
        .update({
          email_sent: true,
          sent_at: new Date().toISOString(),
          send_error: null,
        })
        .eq("id", rc.id as string);
    } else {
      failed += 1;
      results.push({
        requestContactId: rc.id as string,
        ok: false,
        error: sendResult.error,
      });
      await supabase
        .from("request_contacts")
        .update({
          send_error: sendResult.error,
        })
        .eq("id", rc.id as string);
    }

    if (i < pending.length - 1) {
      await delay(SEND_GAP_MS);
    }
  }

  await finalizeRequestIfComplete(supabase, requestId, userId);

  return {
    ok: failed === 0,
    error:
      failed > 0
        ? `${failed} message(s) failed; you can retry from the request detail view after fixing your sending account.`
        : undefined,
    sent,
    failed,
    results,
  };
}

async function finalizeRequestIfComplete(
  supabase: SupabaseClient,
  requestId: string,
  userId: string,
): Promise<boolean> {
  const { data: open } = await supabase
    .from("request_contacts")
    .select("id")
    .eq("request_id", requestId)
    .eq("selected", true)
    .eq("email_sent", false)
    .limit(1);

  if (open?.length) {
    return false;
  }

  await supabase
    .from("requests")
    .update({
      status: "active",
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("user_id", userId);

  return true;
}
