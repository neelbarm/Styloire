import Link from "next/link";
import { notFound } from "next/navigation";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import { getProfileWithContacts } from "@/lib/styloire/mock-data";

export default function RosterDetailPage({ params }: { params: { id: string } }) {
  const bundle = getProfileWithContacts(params.id);
  if (!bundle) notFound();
  const { profile, contacts, requests } = bundle;

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="font-serif text-[clamp(2.8rem,6.2vw,5rem)] font-semibold uppercase leading-[0.94] tracking-[-0.01em] text-styloire-champagneLight">
          Manage profile
        </h1>
      </div>

      <div className="mx-auto max-w-6xl">
        <Link
          href="/roster"
          className="mb-2 inline-block font-sans text-[1.08rem] font-semibold text-styloire-champagneLight/90 hover:text-styloire-champagneLight"
        >
          &larr; Back to My Roster
        </Link>

        <h2 className="font-serif text-[clamp(2.4rem,5vw,3.7rem)] leading-[0.92] text-styloire-champagneLight">
          {profile.talent_name}
        </h2>
        <p className="mt-2 font-sans text-[1.18rem] font-semibold text-white/76">
          {contacts.length} brand contacts · {requests.length} past requests
        </p>

        <div className="mt-5 border-b border-white/42">
          <div className="flex gap-6">
            <span className="border-b border-styloire-champagneLight pb-2 font-sans text-[1.08rem] font-semibold text-styloire-champagneLight">
              Brand Contacts
            </span>
            <span className="pb-2 font-sans text-[1.08rem] font-semibold text-white/72">Request History</span>
          </div>
        </div>

        <div className="mt-6">
          <input
            readOnly
            value=""
            placeholder="Search brand or contact name...."
            className="w-full rounded-full border border-white/48 bg-white/10 px-6 py-2.5 text-center font-sans text-[1.05rem] text-styloire-champagneLight placeholder:text-white/62"
          />
        </div>

        <div className="mt-7 rounded-[2px] border border-white/35 bg-white/[0.03] p-1">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-white/35 font-sans text-[1.85rem] leading-none text-styloire-champagneLight">
                  <th className="px-5 py-4">Brand</th>
                  <th className="px-5 py-4">PR Contact</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4 text-right"> </th>
                </tr>
              </thead>
              <tbody className="font-sans text-[1.05rem] text-white/84">
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-white/28 align-top">
                    <td className="px-5 py-3.5">{c.brand_name}</td>
                    <td className="px-5 py-3.5">{c.contact_name ?? "N/A"}</td>
                    <td className="px-5 py-3.5">{c.email}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-full border border-white/52 bg-white/18 px-4 py-1 font-sans text-[0.58rem] uppercase tracking-[0.12em] text-white/92">
                          Edit
                        </button>
                        <button className="rounded-full border border-white/52 bg-white/10 px-4 py-1 font-sans text-[0.58rem] uppercase tracking-[0.12em] text-white/82">
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

        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input
            placeholder="Brand Name"
            className="w-full rounded-[0.55rem] border border-white/45 bg-white/18 px-4 py-2.5 font-sans text-[1.02rem] text-styloire-champagneLight placeholder:text-white/62"
          />
          <input
            placeholder="PR Contact (Optional)"
            className="w-full rounded-[0.55rem] border border-white/45 bg-white/18 px-4 py-2.5 font-sans text-[1.02rem] text-styloire-champagneLight placeholder:text-white/62"
          />
          <input
            placeholder="Email Address"
            className="w-full rounded-[0.55rem] border border-white/45 bg-white/18 px-4 py-2.5 font-sans text-[1.02rem] text-styloire-champagneLight placeholder:text-white/62"
          />
          <StyloireButton type="button" variant="outline" className="px-8">
            Add
          </StyloireButton>
        </div>

        {requests.length ? (
          <div className="mt-8 border-t border-white/25 pt-5">
            <p className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-white/62">
              Recent requests
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {requests.map((r) => (
                <Link
                  key={r.id}
                  href={`/requests/${r.id}`}
                  className="rounded-full border border-white/35 bg-white/8 px-4 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.1em] text-white/82 transition-colors duration-styloire ease-styloire hover:border-white/55 hover:bg-white/15"
                >
                  {r.event_name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
