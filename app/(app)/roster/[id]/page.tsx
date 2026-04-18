import Link from "next/link";
import { notFound } from "next/navigation";
import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import { getProfileWithContacts } from "@/lib/styloire/mock-data";

export default function RosterDetailPage({ params }: { params: { id: string } }) {
  const bundle = getProfileWithContacts(params.id);
  if (!bundle) notFound();
  const { profile, contacts, requests } = bundle;

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <StyloireAppPageHeader
          title={profile.talent_name}
          description="Brand contacts and request history for this talent profile."
        />
        <div className="flex flex-wrap gap-3">
          <StyloireButton type="button" variant="outline" disabled>
            Add contact
          </StyloireButton>
          <StyloireButton type="button" variant="outline" disabled>
            Upload CSV
          </StyloireButton>
          <StyloireButton href="/requests/new" variant="solid">
            New request
          </StyloireButton>
        </div>
      </div>

      <div className="mb-10 border-b border-styloire-lineSubtle">
        <div className="flex gap-5">
          <span className="border-b border-styloire-ink pb-3 font-sans text-[0.65rem] uppercase tracking-styloireWide text-styloire-ink">
            Brand contacts
          </span>
          <span className="pb-3 font-sans text-[0.65rem] uppercase tracking-styloireWide text-styloire-inkMuted">
            Request history
          </span>
        </div>
      </div>

      <StyloirePanel className="mb-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl text-styloire-champagne">Brand contacts</h2>
          <input
            readOnly
            value=""
            placeholder="Search brand or contact"
            className="w-full max-w-xs border border-styloire-lineSubtle bg-transparent px-4 py-2 font-sans text-sm text-styloire-ink md:w-auto"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-styloire-lineSubtle font-sans text-[0.65rem] uppercase tracking-styloireWide text-styloire-inkMuted">
                <th className="pb-3 pr-4">Brand</th>
                <th className="pb-3 pr-4">PR contact</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="font-sans font-light text-styloire-inkSoft">
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-styloire-lineSubtle">
                  <td className="py-3 pr-4 text-styloire-ink">{c.brand_name}</td>
                  <td className="py-3 pr-4">{c.contact_name ?? "—"}</td>
                  <td className="py-3 pr-4">{c.email}</td>
                  <td className="py-3 pr-4 text-styloire-caption uppercase tracking-styloireNav">
                    Edit · Delete
                  </td>
                </tr>
              ))}
              <tr>
                <td className="pt-4 pr-4">
                  <input
                    placeholder="Brand name"
                    className="w-full border border-styloire-lineSubtle bg-transparent px-3 py-2 font-sans text-sm"
                  />
                </td>
                <td className="pt-4 pr-4">
                  <input
                    placeholder="PR contact (optional)"
                    className="w-full border border-styloire-lineSubtle bg-transparent px-3 py-2 font-sans text-sm"
                  />
                </td>
                <td className="pt-4 pr-4">
                  <input
                    placeholder="Email"
                    className="w-full border border-styloire-lineSubtle bg-transparent px-3 py-2 font-sans text-sm"
                  />
                </td>
                <td className="pt-4 pr-4">
                  <button className="rounded-sm border border-styloire-line px-4 py-2 font-sans text-[0.65rem] uppercase tracking-styloireNav">
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </StyloirePanel>

      <StyloirePanel>
        <h2 className="font-serif text-xl text-styloire-champagne">Request history</h2>
        <ul className="mt-6 space-y-4 font-sans text-sm text-styloire-inkSoft">
          {requests.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-styloire-lineSubtle pb-4"
            >
              <span>
                {r.event_name} · {r.selected_count} contacts · {r.responded_count} responded
              </span>
              <Link
                href={`/requests/${r.id}`}
                className="text-styloire-caption uppercase tracking-styloireNav text-styloire-ink underline-offset-4 hover:underline"
              >
                Open request
              </Link>
            </li>
          ))}
        </ul>
      </StyloirePanel>
    </>
  );
}
