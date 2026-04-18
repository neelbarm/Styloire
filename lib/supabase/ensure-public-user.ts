import type { SupabaseClient } from "@supabase/supabase-js";

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
    throw new Error(`ensurePublicUserRow: ${error.message}`);
  }
}
