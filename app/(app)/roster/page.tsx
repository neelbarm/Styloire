import Link from "next/link";
import { listClientProfileSummaries } from "@/lib/data/profile-queries";

function formatLastUsed(value: string | null) {
  if (!value) return "New profile";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "New profile";
  return `Last used ${parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;
}

export default async function RosterPage() {
  const profiles = await listClientProfileSummaries();

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="font-serif text-[clamp(3.9rem,8vw,6.8rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-styloire-champagneLight">
          Client profiles
        </h1>
      </div>

      <div className="mx-auto grid max-w-[72rem] gap-8 md:grid-cols-2 xl:grid-cols-3">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="min-h-[18.8rem] rounded-[1.9rem] border border-white/42 bg-white/22 px-6 py-8 transition-[border-color,background-color] duration-styloire ease-styloire hover:border-white/55 hover:bg-white/26"
          >
            <p className="font-sans text-[2.05rem] font-medium leading-[0.96] text-styloire-champagneLight">
              {profile.talent_name}
            </p>
            <p className="mt-6 font-serif text-[2.9rem] leading-none text-styloire-champagneLight">
              {profile.contact_count}
            </p>
            <p className="mt-1 font-sans text-[1.05rem] text-white/76">Contacts</p>
            <p className="mt-2 font-sans text-[0.92rem] text-white/58">
              {profile.request_count} past request{profile.request_count === 1 ? "" : "s"}
            </p>
            <p className="mt-1 font-sans text-[0.78rem] text-white/42">
              {formatLastUsed(profile.last_used_at)}
            </p>
            <div className="mt-3 h-px w-full bg-white/35" />
            <div className="mt-4 flex flex-wrap items-center gap-4 font-sans text-[1rem] font-medium text-styloire-champagneLight">
              <Link href={`/roster/${profile.id}`} className="hover:text-white">
                Manage profile &rarr;
              </Link>
              <span className="text-white/34">·</span>
              <Link
                href={`/requests/new?profile=${profile.id}`}
                className="hover:text-white"
              >
                New request &rarr;
              </Link>
            </div>
          </div>
        ))}

        <Link
          href="/requests/new"
          className="flex min-h-[18.8rem] items-center justify-center rounded-[1.9rem] border border-white/42 bg-white/22 p-6 text-center transition-[border-color,background-color] duration-styloire ease-styloire hover:border-white/55 hover:bg-white/26"
        >
          <span className="font-sans text-[1.3rem] font-semibold uppercase tracking-[0.12em] text-styloire-champagneLight">
            + Add new profile
          </span>
        </Link>
      </div>
    </>
  );
}
