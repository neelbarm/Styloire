import { NextResponse } from "next/server";
import { microsoftOAuthWebConfig } from "@/lib/email/env-config";
import {
  createOAuthState,
  microsoftStateCookieName,
  oauthCookieOptions,
} from "@/lib/email/oauth-state";
import { getCurrentUserId } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clientId, tenantId, redirectUri } = microsoftOAuthWebConfig();
    const state = createOAuthState();
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope:
        "offline_access openid profile https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read",
      state,
    });
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
    const res = NextResponse.redirect(url);
    res.cookies.set(microsoftStateCookieName(), state, oauthCookieOptions);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Microsoft OAuth setup error";
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(
      `${origin}/settings?email_error=${encodeURIComponent(msg)}`,
    );
  }
}
