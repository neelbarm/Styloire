import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?error=session&next=/dashboard");
  }
  redirect("/dashboard");
}
