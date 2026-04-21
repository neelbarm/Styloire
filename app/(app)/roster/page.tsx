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
            <p className="font-sans text-[1.95rem] font-medium leading-[0.98] text-styloire-champagneLight">
              {profile.talent_name}
            </p>
            <p className="mt-8 font-serif text-[2.5rem] leading-none text-styloire-champagneLight">
              {profile.contact_count}
            </p>
            <p className="mt-1 font-sans text-[1rem] text-white/76">Contacts</p>
            <div className="mt-4 h-px w-full bg-white/35" />
            <div className="mt-4 space-y-2">
              <Link
                href={`/roster/${profile.id}`}
                className="block font-sans text-[0.98rem] font-medium text-styloire-champagneLight hover:text-white"
              >
                Manage profile &rarr;
              </Link>
              <p className="font-sans text-[0.78rem] text-white/42">
                {profile.request_count} past request{profile.request_count === 1 ? "" : "s"} ·{" "}
                {formatLastUsed(profile.last_used_at)}
              </p>
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
