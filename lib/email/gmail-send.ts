import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import type {
  SendEmailAttachment,
  SendEmailInput,
  SendEmailRecipient,
  SendEmailResult,
} from "./types";

function encodeMimeWord(s: string): string {
  if (/^[\x01-\x7F]*$/.test(s)) return s;
  const b = Buffer.from(s, "utf8").toString("base64");
  return `=?UTF-8?B?${b}?=`;
}

function formatRecipient(recipient: SendEmailRecipient): string {
  return recipient.name
    ? `${encodeMimeWord(recipient.name)} <${recipient.email}>`
    : recipient.email;
}

function makeBoundary(tag: string): string {
  return `styloire_${tag}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`;
}

function encodeBase64Body(content: string): string {
  const b64 = Buffer.from(content, "utf8").toString("base64");
  return b64.replace(/.{1,76}/g, (chunk) => `${chunk}\r\n`).trimEnd();
}

function encodeBase64Bytes(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/.{1,76}/g, (chunk) => `${chunk}\r\n`)
    .trimEnd();
}

/** MIME lines for the message body alone (multipart/alternative or single part). */
function buildBodyEntity(m: SendEmailInput): string[] {
  if (m.bodyHtml) {
    const boundary = makeBoundary("alt");
    return [
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      encodeBase64Body(m.bodyText),
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      encodeBase64Body(m.bodyHtml),
      `--${boundary}--`,
    ];
  }
  return [
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64Body(m.bodyText),
  ];
}

/** MIME lines for a single file attachment. */
function buildAttachmentEntity(a: SendEmailAttachment): string[] {
  const name = encodeMimeWord(a.filename);
  return [
    `Content-Type: ${a.contentType}; name="${name}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${name}"`,
    "",
    encodeBase64Bytes(a.content),
  ];
}

function buildRfc822(m: SendEmailInput): string {
  const from = m.fromName
    ? `${encodeMimeWord(m.fromName)} <${m.fromEmail}>`
    : m.fromEmail;
  const to = m.to.map(formatRecipient).join(", ");
  const lines = [`From: ${from}`, `To: ${to}`];
  if (m.cc.length) {
    lines.push(`Cc: ${m.cc.join(", ")}`);
  }
  lines.push(`Subject: ${encodeMimeWord(m.subject)}`);
  lines.push("MIME-Version: 1.0");

  if (m.attachments?.length) {
    const boundary = makeBoundary("mixed");
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push("");
    lines.push(`--${boundary}`);
    lines.push(...buildBodyEntity(m));
    for (const a of m.attachments) {
      lines.push(`--${boundary}`);
      lines.push(...buildAttachmentEntity(a));
    }
    lines.push(`--${boundary}--`);
    return lines.join("\r\n");
  }

  lines.push(...buildBodyEntity(m));
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
