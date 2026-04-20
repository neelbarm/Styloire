import Link from "next/link";
import { redirect } from "next/navigation";
import { SettingsManager } from "@/components/app/settings-manager";
import { getOnboardingState } from "@/lib/data/onboarding-state";

type Props = {
  searchParams?: {
    connected?: string;
    email_error?: string;
    checkout?: string;
  };
};

function stepBadge(done: boolean) {
  return done
    ? "border-emerald-400/38 bg-emerald-500/12 text-emerald-300"
    : "border-white/18 bg-white/6 text-white/40";
}

export default async function OnboardingPage({ searchParams }: Props) {
  const onboarding = await getOnboardingState();
  if (!onboarding) {
    redirect("/login?error=session&next=/onboarding");
  }

  if (onboarding.hasCompletedOnboarding) {
    redirect("/dashboard");
  }

  const isSubscribed =
    onboarding.subscriptionStatus === "active" || onboarding.subscriptionStatus === "trialing";

  return (
    <div className="min-h-screen bg-styloire-canvas text-styloire-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 pt-10 md:px-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-sans text-[1.02rem] font-semibold uppercase tracking-[0.18em] text-styloire-champagneLight"
          >
            Styloire
          </Link>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-white/18 bg-white/8 px-4 py-2 font-sans text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-white/72 transition-colors hover:border-white/30 hover:bg-white/12 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mx-auto w-full max-w-[54rem] space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.01em] text-styloire-champagneLight">
              Complete your setup
            </h1>
            <p className="mx-auto mt-3 max-w-[36rem] font-sans text-[0.95rem] font-light leading-relaxed text-white/54">
              Finish payment and connect your sending account before entering the portal.
            </p>
          </div>

          {searchParams?.checkout === "cancelled" ? (
            <div className="rounded-[0.65rem] border border-white/14 bg-white/[0.04] px-5 py-4 font-sans text-[0.84rem] text-white/62">
              Checkout was canceled. You can restart subscription any time below.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[0.65rem] border border-white/12 bg-black/8 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/48">
                  Step 1
                </p>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${stepBadge(isSubscribed)}`}
                >
                  {isSubscribed ? onboarding.subscriptionStatus : "Pending"}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-[1.8rem] text-styloire-champagneLight">
                Activate subscription
              </h2>
              <p className="mt-2 font-sans text-[0.84rem] leading-relaxed text-white/48">
                Styloire is $30/month flat with no tiers or usage limits.
              </p>
            </div>

            <div className="rounded-[0.65rem] border border-white/12 bg-black/8 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/48">
                  Step 2
                </p>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${stepBadge(onboarding.hasActiveSendingAccount)}`}
                >
                  {onboarding.hasActiveSendingAccount ? "Ready" : "Pending"}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-[1.8rem] text-styloire-champagneLight">
                Connect your email
              </h2>
              <p className="mt-2 font-sans text-[0.84rem] leading-relaxed text-white/48">
                Add Gmail, Outlook, or SMTP, run a test send, then mark one account active.
              </p>
            </div>
          </div>

          <SettingsManager
            defaultName={onboarding.defaultName}
            defaultEmail={onboarding.defaultEmail}
            connected={searchParams?.connected ?? null}
            emailError={searchParams?.email_error ?? null}
            subscriptionStatus={onboarding.subscriptionStatus}
            hasStripeCustomer={onboarding.hasStripeCustomer}
            checkoutSuccessPath="/onboarding?checkout=success"
            checkoutCancelPath="/onboarding?checkout=cancelled"
            emailReturnPath="/onboarding"
            onboardingMode
          />
        </div>
      </div>
    </div>
  );
}
