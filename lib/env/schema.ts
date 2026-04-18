import { z } from "zod";

const HELP: Record<string, string> = {
  NEXT_PUBLIC_SITE_URL:
    "Set your canonical app URL, e.g. https://styloire.co (no trailing slash preferred).",
  NEXT_PUBLIC_SUPABASE_URL:
    "Set your Supabase project URL, e.g. https://<project>.supabase.co.",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    "Set the public anon key from Supabase project settings.",
  SUPABASE_SERVICE_ROLE_KEY:
    "Set the service role key from Supabase project settings (server-only secret).",
  STYLOIRE_ENCRYPTION_KEY:
    "Set a 32-byte key encoded as base64 or as 64 hex chars. Example: openssl rand -base64 32",
  GOOGLE_CLIENT_ID: "Set Google OAuth client ID from Google Cloud OAuth credentials.",
  GOOGLE_CLIENT_SECRET: "Set Google OAuth client secret from Google Cloud OAuth credentials.",
  GOOGLE_REDIRECT_URI: "Set the full Google OAuth callback URI configured in Google Cloud.",
  MICROSOFT_CLIENT_ID: "Set Microsoft Entra app client ID.",
  MICROSOFT_CLIENT_SECRET: "Set Microsoft Entra app client secret.",
  MICROSOFT_TENANT_ID:
    "Set Entra tenant ID (or 'common' for multi-tenant apps). Must be non-empty.",
  MICROSOFT_REDIRECT_URI:
    "Set the full Microsoft OAuth callback URI configured in Entra.",
  STRIPE_SECRET_KEY: "Set Stripe secret key, e.g. sk_live_... or sk_test_...",
  STRIPE_WEBHOOK_SECRET: "Set Stripe webhook signing secret, e.g. whsec_...",
  NEXT_PUBLIC_STRIPE_PRICE_ID: "Set Stripe price id, e.g. price_...",
};

function requiredNonEmpty(name: string) {
  return z
    .string({ required_error: `${name} is required` })
    .trim()
    .min(1, `${name} must not be empty`);
}

function requiredUrl(name: string) {
  return requiredNonEmpty(name).refine((value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, `${name} must be a valid URL`);
}

function decodeEncryptionKeyBytes(raw: string): Buffer | null {
  const trimmed = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }
  try {
    return Buffer.from(trimmed, "base64");
  } catch {
    return null;
  }
}

const encryptionKeySchema = requiredNonEmpty("STYLOIRE_ENCRYPTION_KEY").refine(
  (value) => {
    const bytes = decodeEncryptionKeyBytes(value);
    return Boolean(bytes && bytes.length === 32);
  },
  "STYLOIRE_ENCRYPTION_KEY must decode to exactly 32 bytes (base64 or 64-char hex).",
);

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: requiredUrl("NEXT_PUBLIC_SITE_URL"),
  NEXT_PUBLIC_SUPABASE_URL: requiredUrl("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredNonEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  NEXT_PUBLIC_STRIPE_PRICE_ID: requiredNonEmpty("NEXT_PUBLIC_STRIPE_PRICE_ID"),
});

export const serverEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: requiredUrl("NEXT_PUBLIC_SITE_URL"),
  NEXT_PUBLIC_SUPABASE_URL: requiredUrl("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredNonEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: requiredNonEmpty("SUPABASE_SERVICE_ROLE_KEY"),
  STYLOIRE_ENCRYPTION_KEY: encryptionKeySchema,
  GOOGLE_CLIENT_ID: requiredNonEmpty("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requiredNonEmpty("GOOGLE_CLIENT_SECRET"),
  GOOGLE_REDIRECT_URI: requiredUrl("GOOGLE_REDIRECT_URI"),
  MICROSOFT_CLIENT_ID: requiredNonEmpty("MICROSOFT_CLIENT_ID"),
  MICROSOFT_CLIENT_SECRET: requiredNonEmpty("MICROSOFT_CLIENT_SECRET"),
  MICROSOFT_TENANT_ID: requiredNonEmpty("MICROSOFT_TENANT_ID"),
  MICROSOFT_REDIRECT_URI: requiredUrl("MICROSOFT_REDIRECT_URI"),
  STRIPE_SECRET_KEY: requiredNonEmpty("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: requiredNonEmpty("STRIPE_WEBHOOK_SECRET"),
  NEXT_PUBLIC_STRIPE_PRICE_ID: requiredNonEmpty("NEXT_PUBLIC_STRIPE_PRICE_ID"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function formatError(prefix: string, error: z.ZodError): Error {
  const lines = error.issues.map((issue) => {
    const key = String(issue.path[0] ?? "unknown");
    const hint = HELP[key] ? ` Fix: ${HELP[key]}` : "";
    return `- ${key}: ${issue.message}.${hint}`;
  });
  return new Error(`${prefix}\n${lines.join("\n")}`);
}

export function parseClientEnv(input: Record<string, string | undefined>): ClientEnv {
  const parsed = clientEnvSchema.safeParse(input);
  if (!parsed.success) {
    throw formatError("Invalid client environment configuration.", parsed.error);
  }
  return parsed.data;
}

export function parseServerEnv(input: Record<string, string | undefined>): ServerEnv {
  const parsed = serverEnvSchema.safeParse(input);
  if (!parsed.success) {
    throw formatError("Invalid server environment configuration.", parsed.error);
  }
  return parsed.data;
}

export function validateEnvOrThrow(input: Record<string, string | undefined>) {
  const clientResult = clientEnvSchema.safeParse(input);
  const serverResult = serverEnvSchema.safeParse(input);

  if (!clientResult.success || !serverResult.success) {
    const clientIssues = clientResult.success ? [] : clientResult.error.issues;
    const serverIssues = serverResult.success ? [] : serverResult.error.issues;
    const seen = new Set(
      clientIssues.map((issue) => `${issue.path.join(".")}:${issue.message}`),
    );
    const dedupedServer = serverIssues.filter((issue) => {
      const key = `${issue.path.join(".")}:${issue.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const issues = [...clientIssues, ...dedupedServer];
    const error = new z.ZodError(issues);
    throw formatError("Invalid environment configuration.", error);
  }

  return { client: clientResult.data, server: serverResult.data };
}
