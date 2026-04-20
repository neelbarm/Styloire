import { SettingsManager } from "@/components/app/settings-manager";
import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { connected?: string; email_error?: string };
}) {
  const user = await getCurrentUser();
  const defaultName = (user?.user_metadata?.full_name as string | undefined) ?? "User";
  const defaultEmail = user?.email ?? "";

  return (
    <>
      <StyloireAppPageHeader
        title="Account"
        description="Connected sending account, CC defaults, and subscription controls."
      />
      <SettingsManager
        defaultName={defaultName}
        defaultEmail={defaultEmail}
        connected={searchParams?.connected ?? null}
        emailError={searchParams?.email_error ?? null}
      />
    </>
  );
}
