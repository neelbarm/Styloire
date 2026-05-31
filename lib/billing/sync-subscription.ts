import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripeClient, mapStripeSubscriptionStatus } from "@/lib/stripe";

export type SubscriptionStatus = "active" | "inactive" | "trialing";

/**
 * Pull the latest subscription state from Stripe and update public.users.
 * Used when checkout succeeded but the webhook has not updated the DB yet.
 */
export async function syncSubscriptionForUser(
  userId: string,
): Promise<SubscriptionStatus | null> {
  const supabase = createServiceRoleClient();
  const stripe = getStripeClient();
  if (!supabase || !stripe) return null;

  const { data: user, error } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user?.stripe_customer_id) return null;

  const customerId = user.stripe_customer_id as string;
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });

  let status: SubscriptionStatus = "inactive";
  for (const subscription of subscriptions.data) {
    const mapped = mapStripeSubscriptionStatus(subscription.status);
    if (mapped === "active" || mapped === "trialing") {
      status = mapped;
      break;
    }
  }

  if (status === "inactive" && subscriptions.data[0]) {
    status = mapStripeSubscriptionStatus(subscriptions.data[0].status);
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({
      subscription_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return status;
}
