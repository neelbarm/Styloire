import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import type { SendEmailInput, SendEmailResult } from "./types";

function encodeMimeWord(s: string): string {
  if (/^[\x01-\x7F]*$/.test(s)) return s;
  const b = Buffer.from(s, "utf8").toString("base64");
  return `=?UTF-8?B?${b}?=`;
}

function buildRfc822(m: SendEmailInput): string {
  const from = m.fromName
    ? `${encodeMimeWord(m.fromName)} <${m.fromEmail}>`
    : m.fromEmail;
  const to = m.toName
    ? `${encodeMimeWord(m.toName)} <${m.to}>`
    : m.to;
  const lines = [`From: ${from}`, `To: ${to}`];
  if (m.cc.length) {
    lines.push(`Cc: ${m.cc.join(", ")}`);
  }
  lines.push(`Subject: ${encodeMimeWord(m.subject)}`);
  lines.push("MIME-Version: 1.0");
  lines.push("Content-Type: text/plain; charset=UTF-8");
  lines.push("Content-Transfer-Encoding: base64");
  lines.push("");
  const b64 = Buffer.from(m.bodyText, "utf8").toString("base64");
  lines.push(b64.replace(/.{1,76}/g, (chunk) => `${chunk}\r\n`).trimEnd());
  return lines.join("\r\n");
}

function toRawWebSafe(rfc: string): string {
  return Buffer.from(rfc, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function ensureFreshGoogleAccess(
  oauth2: OAuth2Client,
  onRefreshed?: (tokens: {
    accessToken: string;
    refreshToken: string | null;
    expiresAtIso: string | null;
  }) => Promise<void>,
): Promise<void> {
  const exp = oauth2.credentials.expiry_date;
  const refreshSoon = Date.now() + 5 * 60 * 1000;
  if (exp && exp > refreshSoon) return;
  if (!oauth2.credentials.refresh_token) {
    throw new Error("Gmail connection missing refresh token; reconnect your account.");
  }
  const { credentials } = await oauth2.refreshAccessToken();
  oauth2.setCredentials(credentials);
  if (onRefreshed) {
    await onRefreshed({
      accessToken: credentials.access_token!,
      refreshToken:
        credentials.refresh_token ??
        oauth2.credentials.refresh_token ??
        null,
      expiresAtIso: credentials.expiry_date
        ? new Date(credentials.expiry_date).toISOString()
        : null,
    });
  }
}

export async function sendViaGmail(
  oauth2: OAuth2Client,
  message: SendEmailInput,
  onRefreshed?: (tokens: {
    accessToken: string;
    refreshToken: string | null;
    expiresAtIso: string | null;
  }) => Promise<void>,
): Promise<SendEmailResult> {
  try {
    await ensureFreshGoogleAccess(oauth2, onRefreshed);
    const gmail = google.gmail({ version: "v1", auth: oauth2 });
    const raw = toRawWebSafe(buildRfc822(message));
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { ok: false, error: err.message ?? "Gmail send failed" };
  }
}
