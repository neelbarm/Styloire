import { AppChrome } from "@/components/app/app-chrome";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?error=session");
  }
  return <AppChrome>{children}</AppChrome>;
}
