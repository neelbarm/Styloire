import Link from "next/link";
import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import { listProfiles } from "@/lib/styloire/mock-data";

export default function RosterPage() {
  const profiles = listProfiles();

  return (
    <>
      <StyloireAppPageHeader
        title="My roster"
        description="Each profile is a talent: saved brand contacts, request history, and quick actions."
      />
      <div className="mb-8">
        <StyloireButton href="/requests/new" variant="solid">
          Add new profile
        </StyloireButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {profiles.map((profile) => (
          <StyloirePanel key={profile.id} className="h-full transition-colors hover:border-styloire-line">
            <p className="font-serif text-2xl text-styloire-champagne">{profile.talent_name}</p>
            <p className="mt-4 font-sans text-sm font-light text-styloire-inkSoft">
              {profile.contact_count} brand contacts · {profile.request_count} past requests
            </p>
            <p className="mt-2 font-sans text-xs uppercase tracking-styloireWide text-styloire-inkMuted">
              Last used{" "}
              {profile.last_used_at
                ? new Date(profile.last_used_at).toLocaleDateString("en-US")
                : "—"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <StyloireButton href={`/roster/${profile.id}`} variant="outline">
                Manage profile
              </StyloireButton>
              <StyloireButton href="/requests/new" variant="solid">
                New request
              </StyloireButton>
            </div>
          </StyloirePanel>
        ))}
      </div>
    </>
  );
}
