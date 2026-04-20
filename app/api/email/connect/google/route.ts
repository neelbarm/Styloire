import { NextResponse } from "next/server";
import { google } from "googleapis";
import { googleOAuthWebConfig } from "@/lib/email/env-config";
import {
  createOAuthState,
  googleNextCookieName,
  googleStateCookieName,
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
    const { clientId, clientSecret, redirectUri } = googleOAuthWebConfig();
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const state = createOAuthState();
    const url = oauth2.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
      ],
      state,
      include_granted_scopes: true,
    });
    const res = NextResponse.redirect(url);
    res.cookies.set(googleStateCookieName(), state, oauthCookieOptions);
    res.cookies.set(googleNextCookieName(), next, oauthCookieOptions);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Google OAuth setup error";
    const origin = url.origin;
    return NextResponse.redirect(
      `${origin}${next}?email_error=${encodeURIComponent(msg)}`,
    );
  }
}
