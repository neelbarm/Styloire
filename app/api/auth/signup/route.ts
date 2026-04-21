import { NextResponse } from "next/server";
import { ensurePublicUserRow } from "@/lib/supabase/ensure-public-user";
import { createServiceRoleClient } from "@/lib/supabase/service";

type SignupPayload = {
  name?: string;
  email?: string;
  password?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SignupPayload;
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const name = body.name?.trim() ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const client = createServiceRoleClient();
  if (!client) {
    return NextResponse.json({ error: "Signup is temporarily unavailable." }, { status: 503 });
  }

  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || undefined },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already been registered") || message.includes("already registered")) {
      return NextResponse.json(
        { error: "An account with that email already exists. Try signing in instead." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data.user?.id) {
    await ensurePublicUserRow(client, {
      id: data.user.id,
      email,
      name: name || null,
    });
  }

  return NextResponse.json({ ok: true });
}
