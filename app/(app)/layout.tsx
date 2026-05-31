import { AppChrome } from "@/components/app/app-chrome";
import { getOnboardingState } from "@/lib/data/onboarding-state";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { isPaidSubscriptionStatus } from "@/lib/stripe";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?error=session");
  }

  if (isSupabaseConfigured()) {
    const onboarding = await getOnboardingState();
    if (!onboarding) {
      redirect("/onboarding");
    }
    if (!isPaidSubscriptionStatus(onboarding.subscriptionStatus)) {
      redirect("/onboarding");
    }
    if (!onboarding.hasActiveSendingAccount) {
      redirect("/onboarding");
    }
  }

  return <AppChrome>{children}</AppChrome>;
}
