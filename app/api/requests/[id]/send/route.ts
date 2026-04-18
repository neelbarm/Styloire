import { NextResponse } from "next/server";
import { sendRequestOutreach } from "@/lib/email/send-request-outreach";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured; cannot send." },
      { status: 503 },
    );
  }

  const result = await sendRequestOutreach({
    supabase: authed.client,
    userId: authed.userId,
    requestId: params.id,
  });

  const blocked = !result.ok && result.sent === 0 && result.failed === 0;
  if (blocked) {
    return NextResponse.json(
      {
        error: result.error ?? "Send failed.",
        sent: result.sent,
        failed: result.failed,
        results: result.results,
      },
      { status: 400 },
    );
  }

  const partial = !result.ok && (result.sent > 0 || result.failed > 0);
  if (partial) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        sent: result.sent,
        failed: result.failed,
        results: result.results,
      },
      { status: 207 },
    );
  }

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    failed: result.failed,
    results: result.results,
  });
}
