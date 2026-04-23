import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import type { SendEmailInput, SendEmailResult } from "./types";
import { refreshMicrosoftAccessToken } from "./microsoft-token";
import { microsoftOAuthWebConfig } from "./env-config";

const OUTLOOK_SEND_TIMEOUT_MS = 15_000;

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms.`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function sendViaOutlook(
  args: {
    accessToken: string;
    refreshToken: string | null;
    tokenExpiresAt: string | null;
    onRefreshed?: (patch: {
      accessToken: string;
      refreshToken: string | null;
      expiresAtIso: string | null;
    }) => Promise<void>;
  },
  message: SendEmailInput,
): Promise<SendEmailResult> {
  let accessToken = args.accessToken;
  try {
    const exp = args.tokenExpiresAt ? Date.parse(args.tokenExpiresAt) : 0;
    const refreshSoon = Date.now() + 5 * 60 * 1000;
    if ((!exp || exp < refreshSoon) && !args.refreshToken) {
      return {
        ok: false,
        error: "Outlook connection needs to be reconnected before it can send mail."
      };
    }
    if ((!exp || exp < refreshSoon) && args.refreshToken) {
      const { clientId, clientSecret, tenantId } = microsoftOAuthWebConfig();
      const refreshed = await refreshMicrosoftAccessToken({
        tenant: tenantId,
        clientId,
        clientSecret,
        refreshToken: args.refreshToken,
      });
      accessToken = refreshed.access_token;
      const expiresAtIso = new Date(
        Date.now() + refreshed.expires_in * 1000,
      ).toISOString();
      if (args.onRefreshed) {
        await args.onRefreshed({
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? args.refreshToken,
          expiresAtIso,
        });
      }
    }

    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    await withTimeout(
      client.api("/me/sendMail").post({
        message: {
          subject: message.subject,
          body: { contentType: "Text", content: message.bodyText },
          toRecipients: message.to.map((recipient) => ({
            emailAddress: {
              address: recipient.email,
              name: recipient.name ?? undefined,
            },
          })),
          ccRecipients: message.cc.map((address) => ({
            emailAddress: { address },
          })),
        },
        saveToSentItems: true,
      }),
      OUTLOOK_SEND_TIMEOUT_MS,
      "Outlook sendMail request",
    );
    return { ok: true };
  } catch (e: unknown) {
    const err = e as {
      message?: string;
      statusCode?: number;
      code?: string;
      body?: unknown;
    };
    const body =
      typeof err.body === "string"
        ? err.body
        : err.body
          ? JSON.stringify(err.body)
          : null;
    const details = [err.code, err.statusCode ? `status ${err.statusCode}` : null, body]
      .filter(Boolean)
      .join(" | ");
    const message = err.message ?? "Outlook send failed";
    return { ok: false, error: details ? `${message} (${details})` : message };
  }
}
