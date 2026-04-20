import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env/server";
import { ensurePublicUserRow } from "@/lib/supabase/ensure-public-user";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/supabase/server";
import { getStripeClient, isPaidSubscriptionStatus } from "@/lib/stripe";

type CheckoutBody = {
  successPath?: string;
  cancelPath?: string;
};

function resolveAppPath(input: string | undefined, fallback: string): string {
  if (!input || !input.startsWith("/")) return fallback;
  return input;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Billing is not configured on this server." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as CheckoutBody;
  const successPath = resolveAppPath(body.successPath, "/onboarding?checkout=success");
  const cancelPath = resolveAppPath(body.cancelPath, "/onboarding?checkout=cancelled");
  const name = (user.user_metadata?.full_name as string | undefined) ?? null;

  await ensurePublicUserRow(supabase, {
    id: user.id,
    email: user.email,
    name,
  });

  const { data: existingUser, error: userError } = await supabase
    .from("users")
    .select("stripe_customer_id,subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  if (isPaidSubscriptionStatus(existingUser?.subscription_status as string | null | undefined)) {
    return NextResponse.json(
      { error: "Your subscription is already active. Open the billing portal from Settings." },
      { status: 409 },
    );
  }

  let stripeCustomerId = (existingUser?.stripe_customer_id as string | null) ?? null;

  try {
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      stripeCustomerId = customer.id;

      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    const origin = serverEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      line_items: [
        {
          price: serverEnv.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}${cancelPath}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
