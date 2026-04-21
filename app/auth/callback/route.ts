import { NextResponse } from "next/server";
import { ensurePublicUserRow } from "@/lib/supabase/ensure-public-user";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { createUserServerClient } from "@/lib/supabase/server";
import { publicSiteOrigin } from "@/lib/site-url";

async function ensureAuthedPublicUser(supabase: ReturnType<typeof createUserServerClient>) {
  const client = createServiceRoleClient();
  if (!client) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) return;

  await ensurePublicUserRow(client, {
    id: user.id,
    email: user.email,
    name: (user.user_metadata?.full_name as string | undefined) ?? null,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/dashboard";
  const redirectTo = next.startsWith("/") ? next : "/dashboard";
  const supabase = createUserServerClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const base = publicSiteOrigin(request);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${base}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
    await ensureAuthedPublicUser(supabase);
    return NextResponse.redirect(`${base}${redirectTo}`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "recovery" | "invite" | "email_change",
    });
    if (error) {
      return NextResponse.redirect(
        `${base}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
    await ensureAuthedPublicUser(supabase);
    if (type === "recovery") {
      return NextResponse.redirect(`${base}/reset-password`);
    }
    return NextResponse.redirect(`${base}${redirectTo}`);
  }

  return NextResponse.redirect(`${base}/login?error=session`);
}
