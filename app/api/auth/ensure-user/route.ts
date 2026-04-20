import { NextResponse } from "next/server";
import { ensurePublicUserRow } from "@/lib/supabase/ensure-public-user";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/supabase/server";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = createServiceRoleClient();
  if (!client) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const name =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email.split("@")[0] ||
    "User";

  try {
    await ensurePublicUserRow(client, {
      id: user.id,
      email: user.email,
      name,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create user profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
