import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileWithContacts } from "@/lib/styloire/mock-data";

function formatSendDate(value: string | null) {
  if (!value) return "Send date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Send date";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RosterDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const bundle = getProfileWithContacts(params.id);
  if (!bundle) notFound();
  const { profile, contacts, requests } = bundle;
  const rawTab = searchParams?.tab;
  const tab = typeof rawTab === "string" && rawTab === "history" ? "history" : "contacts";

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-serif text-[clamp(3.4rem,6.9vw,5.8rem)] font-semibold uppercase leading-[0.92] tracking-[-0.012em] text-styloire-champagneLight">
          Manage profile
        </h1>
      </div>

      <div className="mx-auto max-w-[54rem] px-2">
        <Link
          href="/roster"
          className="mb-1 inline-block font-sans text-[0.92rem] font-semibold text-styloire-champagneLight/90 hover:text-styloire-champagneLight"
        >
          &larr; Back to My Roster
        </Link>

        <h2 className="font-serif text-[clamp(2.2rem,4.8vw,3.5rem)] leading-[0.94] text-styloire-champagneLight">
          {profile.talent_name}
        </h2>
        <p className="mt-1.5 font-sans text-[1.02rem] font-semibold text-white/72">
          {contacts.length} brand contacts · {requests.length} past requests
        </p>

        <div className="mt-4 border-b border-white/42">
          <div className="flex gap-5">
            <Link
              href={`/roster/${params.id}?tab=contacts`}
              className={`pb-2 font-sans text-[0.95rem] font-semibold ${
                tab === "contacts"
                  ? "border-b border-styloire-champagneLight text-styloire-champagneLight"
                  : "text-white/72 hover:text-styloire-champagneLight"
              }`}
            >
              Brand Contacts
            </Link>
            <Link
              href={`/roster/${params.id}?tab=history`}
              className={`pb-2 font-sans text-[0.95rem] font-semibold ${
                tab === "history"
                  ? "border-b border-styloire-champagneLight text-styloire-champagneLight"
                  : "text-white/72 hover:text-styloire-champagneLight"
              }`}
            >
              Request History
            </Link>
          </div>
        </div>

        {tab === "contacts" ? (
          <>
            <div className="mt-5">
              <input
                readOnly
                value=""
                placeholder="Search brand or contact name...."
                className="w-full rounded-full border border-white/48 bg-white/10 px-6 py-2.5 text-center font-sans text-[1rem] text-styloire-champagneLight placeholder:text-white/62"
              />
            </div>

            <div className="mt-6 rounded-[2px] border border-white/35 bg-white/[0.02] p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-white/35 font-sans text-[1.95rem] leading-none text-styloire-champagneLight">
                      <th className="px-5 py-4">Brand</th>
                      <th className="px-5 py-4">PR Contact</th>
                      <th className="px-5 py-4">Email</th>
                      <th className="px-5 py-4 text-right" />
                    </tr>
                  </thead>
                  <tbody className="font-sans text-[0.96rem] text-white/84">
                    {contacts.map((c) => (
                      <tr key={c.id} className="border-b border-white/28 align-top">
                        <td className="px-5 py-3.5 uppercase">{c.brand_name}</td>
                        <td className="px-5 py-3.5">{c.contact_name ?? "N/A"}</td>
                        <td className="px-5 py-3.5">{c.email}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-2">
                            <button className="rounded-full border border-white/52 bg-white/18 px-4 py-1 font-sans text-[0.56rem] uppercase tracking-[0.12em] text-white/92">
                              Edit
                            </button>
                            <button className="rounded-full border border-white/52 bg-white/10 px-4 py-1 font-sans text-[0.56rem] uppercase tracking-[0.12em] text-white/82">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-5 py-3 font-sans text-[1rem] font-semibold italic text-white/72">
                + {Math.max(0, contacts.length * 8 - contacts.length)} more contacts
              </p>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                placeholder="Brand Name"
                className="w-full rounded-[0.7rem] border border-white/45 bg-white/22 px-4 py-2.5 font-sans text-[1rem] text-styloire-champagneLight placeholder:text-white/62"
              />
              <input
                placeholder="PR Contact (Optional)"
                className="w-full rounded-[0.7rem] border border-white/45 bg-white/22 px-4 py-2.5 font-sans text-[1rem] text-styloire-champagneLight placeholder:text-white/62"
              />
              <input
                placeholder="Email Address"
                className="w-full rounded-[0.7rem] border border-white/45 bg-white/22 px-4 py-2.5 font-sans text-[1rem] text-styloire-champagneLight placeholder:text-white/62"
              />
              <button className="rounded-full border border-white/45 bg-white/22 px-7 py-2.5 font-sans text-[1rem] font-medium uppercase tracking-[0.05em] text-styloire-champagneLight">
                Add
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-[2px] border border-white/35 bg-white/[0.02] p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-white/35 font-sans text-[1.8rem] leading-none text-styloire-champagneLight">
                    <th className="px-5 py-4">Event</th>
                    <th className="px-5 py-4">Sent</th>
                    <th className="px-5 py-4">Contacts</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-[0.96rem] text-white/84">
                  {(requests.length ? requests : [{ id: "placeholder", event_name: "Event", sent_at: null, selected_count: 0 }]).map((r) => (
                    <tr key={r.id} className="border-b border-white/28 align-top last:border-b-0">
                      <td className="px-5 py-3.5">{r.event_name || "Event"}</td>
                      <td className="px-5 py-3.5">{formatSendDate(r.sent_at ?? null)}</td>
                      <td className="px-5 py-3.5">{r.selected_count || "XX"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
