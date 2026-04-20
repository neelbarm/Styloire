import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { serverEnv } from "@/lib/env/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripeClient, mapStripeSubscriptionStatus } from "@/lib/stripe";

export const runtime = "nodejs";

async function updateUserBillingById(
  userId: string,
  payload: { stripeCustomerId?: string | null; subscriptionStatus?: "active" | "inactive" | "trialing" },
) {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const updates: Record<string, string> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.stripeCustomerId !== undefined && payload.stripeCustomerId !== null) {
    updates.stripe_customer_id = payload.stripeCustomerId;
  }
  if (payload.subscriptionStatus !== undefined) {
    updates.subscription_status = payload.subscriptionStatus;
  }

  const { error } = await supabase.from("users").update(updates).eq("id", userId);
  if (error) {
    throw new Error(error.message);
  }
}

async function updateUserBillingByCustomer(
  stripeCustomerId: string,
  subscriptionStatus: "active" | "inactive" | "trialing",
) {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("users")
    .update({
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    throw new Error(error.message);
  }
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Billing is not configured on this server." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      serverEnv.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id ?? session.metadata?.supabase_user_id ?? null;
        const customerId = getCustomerId(session.customer);

        let subscriptionStatus: "active" | "inactive" | "trialing" | undefined;
        if (typeof session.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          subscriptionStatus = mapStripeSubscriptionStatus(subscription.status);
        }

        if (userId) {
          await updateUserBillingById(userId, {
            stripeCustomerId: customerId,
            subscriptionStatus,
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);
        const userId = subscription.metadata?.supabase_user_id ?? null;
        const subscriptionStatus = mapStripeSubscriptionStatus(subscription.status);

        if (userId) {
          await updateUserBillingById(userId, {
            stripeCustomerId: customerId,
            subscriptionStatus,
          });
        } else if (customerId) {
          await updateUserBillingByCustomer(customerId, subscriptionStatus);
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
