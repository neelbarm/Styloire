import "server-only";
import { ensurePublicUserRow } from "@/lib/supabase/ensure-public-user";
import { getCurrentUser } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

function isPaidSubscriptionStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

export type OnboardingState = {
  userId: string;
  defaultName: string;
  defaultEmail: string;
  subscriptionStatus: string;
  hasStripeCustomer: boolean;
  hasActiveSendingAccount: boolean;
  hasCompletedOnboarding: boolean;
};

export async function getOnboardingState(): Promise<OnboardingState | null> {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) return null;

  const client = createServiceRoleClient();
  if (!client) return null;

  const defaultName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email.split("@")[0] ||
    "User";

  await ensurePublicUserRow(client, {
    id: user.id,
    email: user.email,
    name: defaultName,
  });

  const [{ data: billingData }, { data: activeAccount }] = await Promise.all([
    client
      .from("users")
      .select("subscription_status,stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle(),
    client
      .from("connected_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("is_sending_active", true)
      .maybeSingle(),
  ]);

  const subscriptionStatus = (billingData?.subscription_status as string | undefined) ?? "inactive";
  const hasStripeCustomer = Boolean(billingData?.stripe_customer_id);
  const hasActiveSendingAccount = Boolean(activeAccount?.id);
  const hasCompletedOnboarding =
    isPaidSubscriptionStatus(subscriptionStatus) && hasActiveSendingAccount;

  return {
    userId: user.id,
    defaultName,
    defaultEmail: user.email,
    subscriptionStatus,
    hasStripeCustomer,
    hasActiveSendingAccount,
    hasCompletedOnboarding,
  };
}
