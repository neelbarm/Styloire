export type EmailProvider = "gmail" | "outlook" | "smtp";

export type SendEmailRecipient = {
  email: string;
  name?: string | null;
};

export type SendEmailAttachment = {
  filename: string;
  contentType: string;
  /** Raw file bytes. */
  content: Buffer;
};

export type SendEmailInput = {
  to: SendEmailRecipient[];
  subject: string;
  bodyText: string;
  /** HTML version of the body. Optional so existing callers stay valid. */
  bodyHtml?: string;
  cc: string[];
  fromEmail: string;
  fromName?: string | null;
  /** File attachments. Optional so existing callers stay valid. */
  attachments?: SendEmailAttachment[];
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };
