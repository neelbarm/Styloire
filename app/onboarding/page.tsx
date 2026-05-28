import { AppChrome } from "@/components/app/app-chrome";
import { OnboardingCheckoutLauncher } from "@/components/app/onboarding-checkout-launcher";
import { SettingsManager } from "@/components/app/settings-manager";
import { getOnboardingState } from "@/lib/data/onboarding-state";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { isPaidSubscriptionStatus } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Finish setup",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: {
    connected?: string;
    email_error?: string;
    checkout?: string;
  };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?error=session&next=/onboarding");
  }

  const defaultName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "User";
  const defaultEmail = user.email ?? "";

  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const state = await getOnboardingState();
  if (!state) {
    redirect("/dashboard");
  }

  if (state.hasCompletedOnboarding) {
    redirect("/dashboard");
  }

  const checkoutNote =
    searchParams?.checkout === "success"
      ? "Subscription updated — connect email below when you are ready."
      : searchParams?.checkout === "cancelled"
        ? "Checkout was cancelled. Start again when you are ready."
        : null;

  return (
    <AppChrome>
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6">
        <div className="mb-8 text-center">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/40">
            Welcome to Styloire
          </p>
          <h1 className="mt-3 font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold uppercase leading-[0.94] tracking-[-0.01em] text-styloire-champagneLight">
            Finish setup
          </h1>
          <p className="mx-auto mt-3 max-w-md font-sans text-[0.82rem] font-light text-white/44">
            {isPaidSubscriptionStatus(state.subscriptionStatus)
              ? "Subscribe step complete. Connect an inbox you send from, run a test send, then mark it active."
              : "Start your subscription, then connect an inbox to send pull requests from your own email."}
          </p>
          {checkoutNote ? (
            <p className="mx-auto mt-4 max-w-md rounded-[0.55rem] border border-white/14 bg-white/[0.06] px-4 py-3 font-sans text-[0.78rem] text-white/70">
              {checkoutNote}
            </p>
          ) : null}
        </div>
        <OnboardingCheckoutLauncher
          subscriptionStatus={state.subscriptionStatus}
          checkoutStatus={searchParams?.checkout}
          checkoutSuccessPath="/onboarding?checkout=success"
          checkoutCancelPath="/onboarding?checkout=cancelled"
        />
        <SettingsManager
          defaultName={defaultName}
          defaultEmail={defaultEmail}
          connected={searchParams?.connected ?? null}
          emailError={searchParams?.email_error ?? null}
          subscriptionStatus={state.subscriptionStatus}
          hasStripeCustomer={state.hasStripeCustomer}
          checkoutSuccessPath="/onboarding?checkout=success"
          checkoutCancelPath="/onboarding?checkout=cancelled"
          emailReturnPath="/onboarding"
          onboardingMode
        />
      </div>
    </AppChrome>
  );
}
