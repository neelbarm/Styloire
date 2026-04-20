import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encryptSecret } from "@/lib/crypto/encryption";
import { microsoftOAuthWebConfig } from "@/lib/email/env-config";
import { exchangeMicrosoftAuthorizationCode } from "@/lib/email/microsoft-token";
import { microsoftNextCookieName, microsoftStateCookieName } from "@/lib/email/oauth-state";
import { publicSiteOrigin } from "@/lib/site-url";
import { ensurePublicUserRow } from "@/lib/supabase/ensure-public-user";
import { getAuthedServiceRoleClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";

function readNext(cookieStore: ReturnType<typeof cookies>): string {
  const next = cookieStore.get(microsoftNextCookieName())?.value;
  return next && next.startsWith("/") ? next : "/settings";
}

export async function GET(request: Request) {
  const base = publicSiteOrigin(request);
  const authed = await getAuthedServiceRoleClient();
  const cookieStore = cookies();
  const next = readNext(cookieStore);
  if (!authed) {
    const res = NextResponse.redirect(`${base}${next}?email_error=unauthorized`);
    res.cookies.delete(microsoftStateCookieName());
    res.cookies.delete(microsoftNextCookieName());
    return res;
  }

  const u = new URL(request.url);
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state");
  const expected = cookieStore.get(microsoftStateCookieName())?.value;
  if (!code || !state || !expected || state !== expected) {
    const res = NextResponse.redirect(`${base}${next}?email_error=oauth_state`);
    res.cookies.delete(microsoftStateCookieName());
    res.cookies.delete(microsoftNextCookieName());
    return res;
  }

  if (!isSupabaseConfigured()) {
    const res = NextResponse.redirect(`${base}${next}?email_error=supabase`);
    res.cookies.delete(microsoftStateCookieName());
    res.cookies.delete(microsoftNextCookieName());
    return res;
  }

  const user = await getCurrentUser();
  if (!user?.email) {
    const res = NextResponse.redirect(`${base}${next}?email_error=no_email`);
    res.cookies.delete(microsoftStateCookieName());
    res.cookies.delete(microsoftNextCookieName());
    return res;
  }

  try {
    const { clientId, clientSecret, tenantId, redirectUri } =
      microsoftOAuthWebConfig();
    const token = await exchangeMicrosoftAuthorizationCode({
      tenant: tenantId,
      clientId,
      clientSecret,
      code,
      redirectUri,
    });

    const meRes = await fetch(
      "https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName,displayName",
      { headers: { Authorization: `Bearer ${token.access_token}` } },
    );
    if (!meRes.ok) {
      throw new Error(`Graph profile failed: ${await meRes.text()}`);
    }
    const me = (await meRes.json()) as {
      mail?: string;
      userPrincipalName?: string;
      displayName?: string;
    };
    const email = (me.mail ?? me.userPrincipalName ?? "").toLowerCase();
    if (!email) {
      throw new Error("Microsoft did not return a mailbox address.");
    }

    const encAccess = encryptSecret(token.access_token);
    const encRefresh = token.refresh_token
      ? encryptSecret(token.refresh_token)
      : null;
    const expiresAt = new Date(
      Date.now() + token.expires_in * 1000,
    ).toISOString();

    await ensurePublicUserRow(authed.client, {
      id: authed.userId,
      email: user.email,
      name: user.user_metadata?.full_name as string | undefined,
    });

    const { error: insertError } = await authed.client
      .from("connected_accounts")
      .insert({
        user_id: authed.userId,
        provider: "outlook",
        email,
        display_name: me.displayName ?? null,
        access_token_encrypted: encAccess,
        refresh_token_encrypted: encRefresh,
        token_expires_at: expiresAt,
        status: "inactive",
        is_sending_active: false,
        last_error_message: null,
        last_error_at: null,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    const res = NextResponse.redirect(`${base}${next}?connected=outlook`);
    res.cookies.delete(microsoftStateCookieName());
    res.cookies.delete(microsoftNextCookieName());
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "microsoft_callback";
    const res = NextResponse.redirect(
      `${base}${next}?email_error=${encodeURIComponent(msg)}`,
    );
    res.cookies.delete(microsoftStateCookieName());
    res.cookies.delete(microsoftNextCookieName());
    return res;
  }
}
