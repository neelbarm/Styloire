import type { SupabaseClient } from "@supabase/supabase-js";

function isMissingUsersTable(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not find the table 'public.users'") ||
    normalized.includes("relation \"public.users\" does not exist") ||
    normalized.includes("relation \"users\" does not exist")
  );
}

function isEmailUniqueViolation(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("users_email_key") ||
    (normalized.includes("duplicate key") && normalized.includes("email"))
  );
}

export async function ensurePublicUserRow(
  client: SupabaseClient,
  params: { id: string; email: string; name?: string | null },
): Promise<void> {
  const email = params.email.trim().toLowerCase();
  const name =
    (params.name ?? "").trim() ||
    (email.includes("@") ? email.split("@")[0]! : "User");
  const { error } = await client.from("users").upsert(
    {
      id: params.id,
      email,
      name,
    },
    { onConflict: "id" },
  );
  if (!error) return;

  if (isMissingUsersTable(error.message)) {
    return;
  }

  // A row with this email already exists under a different id — e.g. the auth
  // account was recreated, so public.users.id no longer matches auth.uid().
  // Re-point that existing row to the current auth id so the app finds the user
  // under auth.uid(). Child FKs cascade the id change (ON UPDATE CASCADE).
  if (isEmailUniqueViolation(error.message)) {
    const { error: reconcileError } = await client
      .from("users")
      .update({ id: params.id, name })
      .eq("email", email);
    if (reconcileError) {
      throw new Error(
        `ensurePublicUserRow (email reconcile): ${reconcileError.message}`,
      );
    }
    return;
  }

  throw new Error(`ensurePublicUserRow: ${error.message}`);
}
