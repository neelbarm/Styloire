import { NextResponse } from "next/server";
import { createUserServerClient } from "@/lib/supabase/server";
import { publicSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  const supabase = createUserServerClient();
  await supabase.auth.signOut();
  const base = publicSiteOrigin(request);
  return NextResponse.redirect(`${base}/login`);
}
