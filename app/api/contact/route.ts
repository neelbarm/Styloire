import { NextResponse } from "next/server";
import { createServiceRoleClient, isSupabaseConfigured } from "@/lib/supabase/service";

type ContactPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "stylist" | "assistant";
  message?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  if (!isSupabaseConfigured()) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
