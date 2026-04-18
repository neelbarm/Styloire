import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import type { SendEmailInput, SendEmailResult } from "./types";
import { refreshMicrosoftAccessToken } from "./microsoft-token";
import { microsoftOAuthWebConfig } from "./env-config";

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

    await client.api("/me/sendMail").post({
      message: {
        subject: message.subject,
        body: { contentType: "Text", content: message.bodyText },
        toRecipients: [
          {
            emailAddress: {
              address: message.to,
              name: message.toName ?? undefined,
            },
          },
        ],
        ccRecipients: message.cc.map((address) => ({
          emailAddress: { address },
        })),
      },
      saveToSentItems: true,
    });
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { ok: false, error: err.message ?? "Outlook send failed" };
  }
}
