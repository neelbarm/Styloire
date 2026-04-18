import Link from "next/link";
import { notFound } from "next/navigation";
import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import { getProfileWithContacts } from "@/lib/styloire/mock-data";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const bundle = getProfileWithContacts(params.id);
  if (!bundle) notFound();
  const { profile, contacts, requests } = bundle;

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <StyloireAppPageHeader
          title={profile.talent_name}
          description="Roster, history, and room to add or refine contacts."
        />
        <div className="flex flex-wrap gap-3">
          <StyloireButton type="button" variant="outline" disabled>
            Add contact
          </StyloireButton>
          <StyloireButton type="button" variant="outline" disabled>
            Upload CSV
          </StyloireButton>
        </div>
      </div>

      <StyloirePanel className="mb-10">
        <h2 className="font-serif text-xl text-styloire-ink">Brand contacts</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-styloire-lineSubtle font-sans text-[0.65rem] uppercase tracking-styloireWide text-styloire-inkMuted">
                <th className="pb-3 pr-4">Brand</th>
                <th className="pb-3 pr-4">Contact</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3">Active</th>
              </tr>
            </thead>
            <tbody className="font-sans font-light text-styloire-inkSoft">
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-styloire-lineSubtle">
                  <td className="py-3 pr-4 text-styloire-ink">{c.brand_name}</td>
                  <td className="py-3 pr-4">{c.contact_name ?? "—"}</td>
                  <td className="py-3 pr-4">{c.email}</td>
                  <td className="py-3">{c.is_active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StyloirePanel>

      <StyloirePanel>
        <h2 className="font-serif text-xl text-styloire-ink">Past requests</h2>
        <ul className="mt-6 space-y-4 font-sans text-sm text-styloire-inkSoft">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-styloire-lineSubtle pb-4">
              <span>
                {r.event_name}{" "}
                <span className="text-styloire-inkMuted">· {r.status}</span>
              </span>
              <Link
                href={`/requests/${r.id}`}
                className="text-styloire-caption uppercase tracking-styloireNav text-styloire-ink underline-offset-4 hover:underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      </StyloirePanel>
    </>
  );
}
