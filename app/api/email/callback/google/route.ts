import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { encryptSecret } from "@/lib/crypto/encryption";
import { googleOAuthWebConfig } from "@/lib/email/env-config";
import { googleNextCookieName, googleStateCookieName } from "@/lib/email/oauth-state";
import { publicSiteOrigin } from "@/lib/site-url";
import { ensurePublicUserRow } from "@/lib/supabase/ensure-public-user";
import { getAuthedServiceRoleClient, getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";

function readNext(cookieStore: ReturnType<typeof cookies>): string {
  const next = cookieStore.get(googleNextCookieName())?.value;
  return next && next.startsWith("/") ? next : "/settings";
}

export async function GET(request: Request) {
  const base = publicSiteOrigin(request);
  const authed = await getAuthedServiceRoleClient();
  const cookieStore = cookies();
  const next = readNext(cookieStore);
  if (!authed) {
    const res = NextResponse.redirect(`${base}${next}?email_error=unauthorized`);
    res.cookies.delete(googleStateCookieName());
    res.cookies.delete(googleNextCookieName());
    return res;
  }

  const u = new URL(request.url);
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state");
  const expected = cookieStore.get(googleStateCookieName())?.value;
  if (!code || !state || !expected || state !== expected) {
    const res = NextResponse.redirect(`${base}${next}?email_error=oauth_state`);
    res.cookies.delete(googleStateCookieName());
    res.cookies.delete(googleNextCookieName());
    return res;
  }

  if (!isSupabaseConfigured()) {
    const res = NextResponse.redirect(`${base}${next}?email_error=supabase`);
    res.cookies.delete(googleStateCookieName());
    res.cookies.delete(googleNextCookieName());
    return res;
  }

  const user = await getCurrentUser();
  if (!user?.email) {
    const res = NextResponse.redirect(`${base}${next}?email_error=no_email`);
    res.cookies.delete(googleStateCookieName());
    res.cookies.delete(googleNextCookieName());
    return res;
  }

  try {
    const { clientId, clientSecret, redirectUri } = googleOAuthWebConfig();
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);

    const oauth2Api = google.oauth2({ version: "v2", auth: oauth2 });
    const { data: profile } = await oauth2Api.userinfo.get();
    const email = profile.email?.toLowerCase();
    if (!email) {
      throw new Error("Google did not return an email address.");
    }

    const encAccess = encryptSecret(tokens.access_token!);
    const encRefresh = tokens.refresh_token
      ? encryptSecret(tokens.refresh_token)
      : null;
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : null;

    await ensurePublicUserRow(authed.client, {
      id: authed.userId,
      email: user.email,
      name: user.user_metadata?.full_name as string | undefined,
    });

    const { data: existingRows, error: existingError } = await authed.client
      .from("connected_accounts")
      .select("id,refresh_token_encrypted")
      .eq("user_id", authed.userId)
      .eq("provider", "gmail")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (existingError) {
      throw new Error(existingError.message);
    }

    const payload = {
      user_id: authed.userId,
      provider: "gmail" as const,
      email,
      display_name: profile.name ?? null,
      access_token_encrypted: encAccess,
      refresh_token_encrypted:
        encRefresh ?? existingRows?.[0]?.refresh_token_encrypted ?? null,
      token_expires_at: expiresAt,
      status: "inactive" as const,
      is_sending_active: false,
      last_error_message: null,
      last_error_at: null,
    };

    if (existingRows?.length) {
      const primaryId = String(existingRows[0]!.id);
      const { error: updateError } = await authed.client
        .from("connected_accounts")
        .update(payload)
        .eq("id", primaryId)
        .eq("user_id", authed.userId);
      if (updateError) {
        throw new Error(updateError.message);
      }
      const duplicateIds = existingRows.slice(1).map((row) => String(row.id));
      if (duplicateIds.length > 0) {
        const { error: deleteError } = await authed.client
          .from("connected_accounts")
          .delete()
          .in("id", duplicateIds)
          .eq("user_id", authed.userId);
        if (deleteError) {
          throw new Error(deleteError.message);
        }
      }
    } else {
      const { error: insertError } = await authed.client
        .from("connected_accounts")
        .insert(payload);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    const res = NextResponse.redirect(`${base}${next}?connected=gmail`);
    res.cookies.delete(googleStateCookieName());
    res.cookies.delete(googleNextCookieName());
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "google_callback";
    const res = NextResponse.redirect(
      `${base}${next}?email_error=${encodeURIComponent(msg)}`,
    );
    res.cookies.delete(googleStateCookieName());
    res.cookies.delete(googleNextCookieName());
    return res;
  }
}
