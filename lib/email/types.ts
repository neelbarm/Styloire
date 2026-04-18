export type EmailProvider = "gmail" | "outlook" | "smtp";

export type SendEmailInput = {
  to: string;
  toName?: string | null;
  subject: string;
  bodyText: string;
  cc: string[];
  fromEmail: string;
  fromName?: string | null;
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };
