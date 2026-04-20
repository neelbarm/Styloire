import { SettingsManager } from "@/components/app/settings-manager";
import { getCurrentUser } from "@/lib/supabase/server";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";

export default async function SettingsPage({
  searchParams
}: {
  searchParams?: { connected?: string; email_error?: string };
}) {
  const user = await getCurrentUser();
  const defaultName = (user?.user_metadata?.full_name as string | undefined) ?? "User";
  const defaultEmail = user?.email ?? "";

  // Load subscription status and Stripe customer ID from the public users table
  let subscriptionStatus: string = "unknown";
  let hasStripeCustomer = false;

  if (user && isSupabaseConfigured()) {
    const authed = await getAuthedServiceRoleClient();
    if (authed) {
      const { data } = await authed.client
        .from("users")
        .select("subscription_status,stripe_customer_id")
        .eq("id", authed.userId)
        .maybeSingle();

      if (data) {
        subscriptionStatus = (data.subscription_status as string) ?? "unknown";
        hasStripeCustomer = Boolean(data.stripe_customer_id);
      }
    }
  }

  return (
    <>
      <div className="mb-7 text-center">
        <h1 className="font-serif text-[clamp(1.9rem,3.8vw,2.8rem)] font-semibold uppercase leading-[0.94] tracking-[-0.01em] text-styloire-champagneLight">
          Account
        </h1>
        <p className="mt-2 font-sans text-[0.82rem] font-light text-white/40">
          Email connection, CC defaults, and subscription.
        </p>
      </div>
      <SettingsManager
        defaultName={defaultName}
        defaultEmail={defaultEmail}
        connected={searchParams?.connected ?? null}
        emailError={searchParams?.email_error ?? null}
        subscriptionStatus={subscriptionStatus}
        hasStripeCustomer={hasStripeCustomer}
      />
    </>
  );
}
