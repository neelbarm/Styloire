import { AppChrome } from "@/components/app/app-chrome";
import { redirect } from "next/navigation";
import { getOnboardingState } from "@/lib/data/onboarding-state";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const onboarding = await getOnboardingState();
  if (!onboarding) {
    redirect("/login?error=session");
  }
  if (!onboarding.hasCompletedOnboarding) {
    redirect("/onboarding");
  }
  return <AppChrome>{children}</AppChrome>;
}
