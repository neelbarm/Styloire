import { SettingsManager } from "@/components/app/settings-manager";
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
      />
    </>
  );
}
