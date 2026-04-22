export type EmailProvider = "gmail" | "outlook" | "smtp";

export type SendEmailRecipient = {
  email: string;
  name?: string | null;
};

export type SendEmailInput = {
  to: SendEmailRecipient[];
  subject: string;
  bodyText: string;
  cc: string[];
  fromEmail: string;
  fromName?: string | null;
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };
