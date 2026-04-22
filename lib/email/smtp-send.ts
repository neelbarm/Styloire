import nodemailer from "nodemailer";
import type { SendEmailInput, SendEmailResult } from "./types";

export async function sendViaSmtp(
  transportOpts: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  },
  message: SendEmailInput,
): Promise<SendEmailResult> {
  const transporter = nodemailer.createTransport({
    host: transportOpts.host,
    port: transportOpts.port,
    secure: transportOpts.secure,
    auth: {
      user: transportOpts.username,
      pass: transportOpts.password,
    },
    ...(transportOpts.port === 587
      ? { requireTLS: true, tls: { minVersion: "TLSv1.2" as const } }
      : {}),
  });
  try {
    await transporter.sendMail({
      from: message.fromName
        ? `"${message.fromName.replace(/"/g, "")}" <${message.fromEmail}>`
        : message.fromEmail,
      to: message.to.map((recipient) =>
        recipient.name
          ? `"${recipient.name.replace(/"/g, "")}" <${recipient.email}>`
          : recipient.email
      ),
      cc: message.cc.length ? message.cc : undefined,
      subject: message.subject,
      text: message.bodyText,
    });
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { ok: false, error: err.message ?? "SMTP send failed" };
  } finally {
    transporter.close();
  }
}
