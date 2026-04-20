import Link from "next/link";
import { listProfiles } from "@/lib/styloire/mock-data";

function formatCardDate(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function RosterPage() {
  const profiles = listProfiles();

  return (
    <>
      <div className="mb-9 text-center">
        <h1 className="font-serif text-[clamp(2.8rem,6.2vw,5rem)] font-semibold uppercase leading-[0.94] tracking-[-0.01em] text-styloire-champagneLight">
          Existing requests
        </h1>
      </div>

      <div className="mx-auto grid max-w-6xl gap-7 md:grid-cols-2 xl:grid-cols-3">
        {profiles.map((profile) => (
          <Link
            key={profile.id}
            href={`/roster/${profile.id}`}
            className="min-h-[19.4rem] rounded-[1.9rem] border border-white/45 bg-white/26 p-6 transition-[border-color,background-color] duration-styloire ease-styloire hover:border-white/60 hover:bg-white/30"
          >
            <p className="font-serif text-[clamp(2.35rem,4vw,2.85rem)] leading-[0.95] text-styloire-champagneLight">
              {profile.talent_name}
            </p>
            <p className="mt-2 font-sans text-[1rem] font-medium text-white/78">
              {formatCardDate(profile.last_used_at)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="font-serif text-[2.45rem] leading-none text-styloire-champagneLight">
                  {profile.contact_count}
                </p>
                <p className="mt-1 font-sans text-[0.98rem] text-white/78">Contacts</p>
              </div>
              <div>
                <p className="font-serif text-[2.45rem] leading-none text-styloire-champagneLight">
                  {profile.request_count}
                </p>
                <p className="mt-1 font-sans text-[0.98rem] text-white/78">Requests</p>
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-white/35" />
            <p className="mt-4 font-sans text-[1.02rem] font-medium text-styloire-champagneLight">
              Manage profile &rarr;
            </p>
          </Link>
        ))}

        <Link
          href="/requests/new"
          className="flex min-h-[19.4rem] items-center justify-center rounded-[1.9rem] border border-white/45 bg-white/26 p-6 text-center transition-[border-color,background-color] duration-styloire ease-styloire hover:border-white/60 hover:bg-white/30"
        >
          <span className="font-sans text-[1.45rem] font-semibold uppercase tracking-[0.11em] text-styloire-champagneLight">
            + Add new profile
          </span>
        </Link>
      </div>
    </>
  );
}
