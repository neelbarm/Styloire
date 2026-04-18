import Link from "next/link";
import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloirePanel } from "@/components/styloire/panel";
import { listProfiles } from "@/lib/styloire/mock-data";

export default function ClientsPage() {
  const profiles = listProfiles();

  return (
    <>
      <StyloireAppPageHeader
        title="My clients"
        description="Each card is a talent — contacts saved, requests filed beneath."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {profiles.map((profile) => (
          <Link key={profile.id} href={`/clients/${profile.id}`}>
            <StyloirePanel className="h-full transition-colors hover:border-styloire-line">
              <p className="font-serif text-2xl text-styloire-ink">{profile.talent_name}</p>
              <p className="mt-4 font-sans text-sm font-light text-styloire-inkSoft">
                {profile.contact_count} brand contacts · {profile.request_count} past requests
              </p>
            </StyloirePanel>
          </Link>
        ))}
      </div>
    </>
  );
}
