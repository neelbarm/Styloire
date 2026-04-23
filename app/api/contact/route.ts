import { NextResponse } from "next/server";
import { sendViaSmtp } from "@/lib/email/smtp-send";
import { createServiceRoleClient, isSupabaseConfigured } from "@/lib/supabase/service";

type ContactPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "stylist" | "assistant";
  message?: string;
};

function isMissingContactMessagesTable(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not find the table 'public.contact_messages'") ||
    normalized.includes("relation \"public.contact_messages\" does not exist") ||
    normalized.includes("relation \"contact_messages\" does not exist")
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type ContactSmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
};

function loadContactSmtpConfig(): ContactSmtpConfig | null {
  const host = process.env.CONTACT_SMTP_HOST?.trim() ?? "";
  const username = process.env.CONTACT_SMTP_USERNAME?.trim() ?? "";
  const password = process.env.CONTACT_SMTP_PASSWORD?.trim() ?? "";
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim() ?? "";
  const toEmail = process.env.CONTACT_NOTIFICATION_TO_EMAIL?.trim() ?? "";
  const fromName = process.env.CONTACT_FROM_NAME?.trim() || "Styloire";
  const portRaw = process.env.CONTACT_SMTP_PORT?.trim() ?? "587";
  const port = Number(portRaw);
  const secureRaw = process.env.CONTACT_SMTP_SECURE?.trim().toLowerCase();
  const secure = secureRaw ? secureRaw === "true" : port === 465;

  if (!host || !username || !password || !fromEmail || !toEmail || !Number.isFinite(port)) {
    return null;
  }

  return {
    host,
    port,
    secure,
    username,
    password,
    fromEmail,
    fromName,
    toEmail,
  };
}

async function sendContactNotification(
  config: ContactSmtpConfig,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    role: "stylist" | "assistant";
    message: string;
  },
) {
  const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
  return sendViaSmtp(
    {
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password,
    },
    {
      to: [{ email: config.toEmail }],
      subject: "New Styloire contact form submission",
      bodyText: [
        `Name: ${fullName}`,
        `Email: ${payload.email}`,
        `Role: ${payload.role}`,
        "",
        "Message:",
        payload.message,
      ].join("\n"),
      cc: [],
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ContactPayload;
  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const role = body.role;
  const message = body.message?.trim() ?? "";

  if (!firstName || !lastName || !email || !message || !role) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  if (role !== "stylist" && role !== "assistant") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const smtpConfig = loadContactSmtpConfig();

  if (!isSupabaseConfigured()) {
    if (smtpConfig) {
      const notifyResult = await sendContactNotification(smtpConfig, {
        firstName,
        lastName,
        email,
        role,
        message,
      });
      if (!notifyResult.ok) {
        return NextResponse.json({ error: notifyResult.error }, { status: 502 });
      }
    }
    return NextResponse.json({ ok: true, queued: true });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, queued: true });
  }

  const { error } = await supabase.from("contact_messages").insert({
    first_name: firstName,
    last_name: lastName,
    email,
    role,
    message
  });

  if (error) {
    if (isMissingContactMessagesTable(error.message)) {
      if (smtpConfig) {
        const notifyResult = await sendContactNotification(smtpConfig, {
          firstName,
          lastName,
          email,
          role,
          message,
        });
        if (!notifyResult.ok) {
          return NextResponse.json({ error: notifyResult.error }, { status: 502 });
        }
      }
      return NextResponse.json({ ok: true, queued: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (smtpConfig) {
    const notifyResult = await sendContactNotification(smtpConfig, {
      firstName,
      lastName,
      email,
      role,
      message,
    });
    if (!notifyResult.ok) {
      return NextResponse.json({ error: notifyResult.error }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
