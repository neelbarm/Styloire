import { NextResponse } from "next/server";
import { microsoftOAuthWebConfig } from "@/lib/email/env-config";
import {
  createOAuthState,
  microsoftNextCookieName,
  microsoftStateCookieName,
  oauthCookieOptions,
} from "@/lib/email/oauth-state";
import { getCurrentUserId } from "@/lib/supabase/server";

function resolveNext(url: URL): string {
  const next = url.searchParams.get("next");
  return next && next.startsWith("/") ? next : "/settings";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = resolveNext(url);
  const userId = await getCurrentUserId();
  if (!userId) {
    const origin = url.origin;
    return NextResponse.redirect(
      `${origin}/login?error=session&next=${encodeURIComponent(next)}`,
    );
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
    res.cookies.set(microsoftNextCookieName(), next, oauthCookieOptions);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Microsoft OAuth setup error";
    const origin = url.origin;
    return NextResponse.redirect(
      `${origin}${next}?email_error=${encodeURIComponent(msg)}`,
    );
  }
}
