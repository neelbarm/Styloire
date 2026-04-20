import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { serverEnv } from "@/lib/env/server";

function getStripeClient(): Stripe | null {
  const key = serverEnv.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

// POST /api/billing/portal
// Body: { flow?: "cancel" }
// Returns: { url: string } — redirect the client to this URL
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { flow?: string };

  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Billing is not configured on this server." },
      { status: 503 }
    );
  }

  // Fetch stripe_customer_id from the users table
  let stripeCustomerId: string | null = null;

  if (isSupabaseConfigured()) {
    const { data } = await authed.client
      .from("users")
      .select("stripe_customer_id")
      .eq("id", authed.userId)
      .maybeSingle();
    stripeCustomerId = (data?.stripe_customer_id as string | null) ?? null;
  }

  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found. Contact support if you believe this is a mistake." },
      { status: 404 }
    );
  }

  const returnUrl = `${serverEnv.NEXT_PUBLIC_SITE_URL}/settings`;

  try {
    const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: stripeCustomerId,
      return_url: returnUrl
    };

    // For the cancellation flow, look up the active subscription ID so Stripe can
    // open directly on the cancellation screen.
    if (body.flow === "cancel") {
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 1
      });
      const activeSub = subs.data[0];
      if (activeSub) {
        sessionParams.flow_data = {
          type: "subscription_cancel",
          subscription_cancel: { subscription: activeSub.id }
        };
      }
      // If no active sub found, fall through and open the portal normally
    }

    const session = await stripe.billingPortal.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
