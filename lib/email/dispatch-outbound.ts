import type { SupabaseClient } from "@supabase/supabase-js";
import { google } from "googleapis";
import { encryptSecret, decryptSecret } from "@/lib/crypto/encryption";
import { googleOAuthWebConfig } from "./env-config";
import { sendViaGmail } from "./gmail-send";
import { sendViaOutlook } from "./outlook-send";
import { sendViaSmtp } from "./smtp-send";
import type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

export type ConnectedAccountRow = {
  id: string;
  user_id: string;
  provider: string;
  email: string;
  display_name: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  smtp_password_encrypted: string | null;
  smtp_secure: boolean | null;
  status: string;
  is_sending_active: boolean;
};

async function persistOAuthTokens(
  supabase: SupabaseClient,
  accountId: string,
  patch: {
    accessToken: string;
    refreshToken: string | null;
    expiresAtIso: string | null;
  },
) {
  const row: Record<string, unknown> = {
    access_token_encrypted: encryptSecret(patch.accessToken),
    token_expires_at: patch.expiresAtIso,
    updated_at: new Date().toISOString(),
  };
  if (patch.refreshToken) {
    row.refresh_token_encrypted = encryptSecret(patch.refreshToken);
  }
  await supabase.from("connected_accounts").update(row).eq("id", accountId);
}

async function markAccountBroken(
  supabase: SupabaseClient,
  accountId: string,
  msg: string,
) {
  await supabase
    .from("connected_accounts")
    .update({
      last_error_message: msg,
      last_error_at: new Date().toISOString(),
      status: "error",
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);
}

async function recordSendFailure(
  supabase: SupabaseClient,
  accountId: string,
  msg: string,
) {
  await supabase
    .from("connected_accounts")
    .update({
      last_error_message: msg,
      last_error_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);
}

async function clearAccountError(supabase: SupabaseClient, accountId: string) {
  await supabase
    .from("connected_accounts")
    .update({
      last_error_message: null,
      last_error_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);
}

export async function dispatchOutboundEmail(
  supabase: SupabaseClient,
  account: ConnectedAccountRow,
  message: SendEmailInput,
): Promise<SendEmailResult> {
  const provider = account.provider as EmailProvider;

  if (provider === "gmail") {
    const { clientId, clientSecret, redirectUri } = googleOAuthWebConfig();
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    let access = "";
    let refresh: string | null = null;
    try {
      if (!account.access_token_encrypted || !account.refresh_token_encrypted) {
        await markAccountBroken(
          supabase,
          account.id,
          "Gmail account is missing tokens; reconnect.",
        );
        return { ok: false, error: "Gmail account is missing tokens; reconnect." };
      }
      access = decryptSecret(account.access_token_encrypted);
      refresh = decryptSecret(account.refresh_token_encrypted);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not read Gmail tokens.";
      await markAccountBroken(supabase, account.id, msg);
      return { ok: false, error: msg };
    }
    oauth2.setCredentials({
      access_token: access,
      refresh_token: refresh,
      expiry_date: account.token_expires_at
        ? Date.parse(account.token_expires_at)
        : undefined,
    });
    const result = await sendViaGmail(oauth2, message, async (t) => {
      await persistOAuthTokens(supabase, account.id, {
        accessToken: t.accessToken,
        refreshToken: t.refreshToken,
        expiresAtIso: t.expiresAtIso,
      });
    });
    if (result.ok) await clearAccountError(supabase, account.id);
    else await recordSendFailure(supabase, account.id, result.error);
    return result;
  }

  if (provider === "outlook") {
    let access = "";
    let refresh: string | null = null;
    try {
      if (!account.access_token_encrypted) {
        await markAccountBroken(
          supabase,
          account.id,
          "Outlook account is missing an access token; reconnect.",
        );
        return {
          ok: false,
          error: "Outlook account is missing an access token; reconnect.",
        };
      }
      access = decryptSecret(account.access_token_encrypted);
      refresh = account.refresh_token_encrypted
        ? decryptSecret(account.refresh_token_encrypted)
        : null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not read Outlook tokens.";
      await markAccountBroken(supabase, account.id, msg);
      return { ok: false, error: msg };
    }
    const result = await sendViaOutlook(
      {
        accessToken: access,
        refreshToken: refresh,
        tokenExpiresAt: account.token_expires_at,
        onRefreshed: async (p) => {
          await persistOAuthTokens(supabase, account.id, {
            accessToken: p.accessToken,
            refreshToken: p.refreshToken,
            expiresAtIso: p.expiresAtIso,
          });
        },
      },
      message,
    );
    if (result.ok) await clearAccountError(supabase, account.id);
    else await recordSendFailure(supabase, account.id, result.error);
    return result;
  }

  if (provider === "smtp") {
    try {
      if (
        !account.smtp_host ||
        account.smtp_port == null ||
        !account.smtp_username ||
        !account.smtp_password_encrypted
      ) {
        await markAccountBroken(supabase, account.id, "SMTP configuration is incomplete.");
        return { ok: false, error: "SMTP configuration is incomplete." };
      }
      const password = decryptSecret(account.smtp_password_encrypted);
      const secure =
        account.smtp_secure ?? account.smtp_port === 465;
      const result = await sendViaSmtp(
        {
          host: account.smtp_host,
          port: account.smtp_port,
          secure,
          username: account.smtp_username,
          password,
        },
        message,
      );
      if (result.ok) await clearAccountError(supabase, account.id);
      else await recordSendFailure(supabase, account.id, result.error);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "SMTP error";
      await markAccountBroken(supabase, account.id, msg);
      return { ok: false, error: msg };
    }
  }

  await markAccountBroken(supabase, account.id, `Unknown provider: ${provider}`);
  return { ok: false, error: `Unknown provider: ${provider}` };
}
