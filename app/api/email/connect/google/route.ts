import { NextResponse } from "next/server";
import { google } from "googleapis";
import { googleOAuthWebConfig } from "@/lib/email/env-config";
import {
  createOAuthState,
  googleStateCookieName,
  oauthCookieOptions,
} from "@/lib/email/oauth-state";
import { getCurrentUserId } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Google OAuth setup error";
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(
      `${origin}/settings?email_error=${encodeURIComponent(msg)}`,
    );
  }
}
