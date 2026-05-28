import type { SupabaseClient } from "@supabase/supabase-js";

function isMissingUsersTable(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not find the table 'public.users'") ||
    normalized.includes("relation \"public.users\" does not exist") ||
    normalized.includes("relation \"users\" does not exist")
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
  if (error) {
    if (isMissingUsersTable(error.message)) {
      return;
    }
    throw new Error(`ensurePublicUserRow: ${error.message}`);
  }
}
