import { NextResponse } from "next/server";
import { createUserServerClient } from "@/lib/supabase/server";
import { publicSiteOrigin } from "@/lib/site-url";

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
    return NextResponse.redirect(`${base}${redirectTo}`);
  }

  return NextResponse.redirect(`${base}/login?error=session`);
}
