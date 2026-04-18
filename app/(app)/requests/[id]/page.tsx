import Link from "next/link";
import { notFound } from "next/navigation";
import { DataSourceBanner } from "@/components/app/data-source-banner";
import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import { getRequestDetailResolved } from "@/lib/data/request-queries";
import { showDataSourceBanner } from "@/lib/site";

function contactStatus(row: {
  email_sent: boolean;
  opened: boolean;
  responded: boolean;
}) {
  if (!row.email_sent) return "Queued";
  if (row.responded) return "Responded";
  if (row.opened) return "Opened";
  return "No response";
}

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const detail = await getRequestDetailResolved(params.id);
  if (!detail) notFound();
  const { request, rows, source, notice } = detail;

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <StyloireAppPageHeader
          title={`${request.talent_name} / ${request.event_name}`}
          description="Outreach at a glance — counts, each house, and where a follow-up belongs."
        />
        <div className="flex flex-wrap gap-3">
          <StyloireButton type="button" variant="outline" disabled>
            Mark archived
          </StyloireButton>
          <StyloireButton type="button" variant="outline" disabled>
            Send follow up
          </StyloireButton>
        </div>
      </div>

      {showDataSourceBanner() ? <DataSourceBanner source={source} notice={notice} /> : null}

      <StyloirePanel className="mb-10">
        <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
          Stats
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            ["Emails sent", String(request.sent_count)],
            ["Opened", String(request.opened_count)],
            ["Responded", String(request.responded_count)],
            ["No response", String(Math.max(0, request.sent_count - request.responded_count))]
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-serif text-3xl text-styloire-ink">{value}</p>
              <p className="mt-1 font-sans text-xs uppercase tracking-wide text-styloire-inkMuted">
                {label}
              </p>
            </div>
          ))}
        </div>
        {request.followup_date ? (
          <p className="mt-8 font-sans text-sm text-styloire-inkSoft">
            Follow up scheduled for{" "}
            <span className="text-styloire-ink">{request.followup_date}</span> ·{" "}
            <button type="button" className="underline underline-offset-4">
              Reschedule
            </button>{" "}
            ·{" "}
            <button type="button" className="underline underline-offset-4">
              Cancel
            </button>
          </p>
        ) : (
          <p className="mt-8 font-sans text-sm text-styloire-inkMuted">No follow-up scheduled.</p>
        )}
      </StyloirePanel>

      <StyloirePanel>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-xl text-styloire-ink">Contacts</h2>
          <Link
            href="/dashboard"
            className="font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-inkSoft underline-offset-4 hover:text-styloire-ink hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
        <div className="overflow-x-auto">
          {rows.length ? (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-styloire-lineSubtle font-sans text-[0.65rem] uppercase tracking-styloireWide text-styloire-inkMuted">
                  <th className="pb-3 pr-4">Brand</th>
                  <th className="pb-3 pr-4">Contact</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Responded</th>
                </tr>
              </thead>
              <tbody className="font-sans font-light text-styloire-inkSoft">
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-styloire-lineSubtle">
                    <td className="py-4 pr-4 text-styloire-ink">{row.brand_name}</td>
                    <td className="py-4 pr-4">{row.contact_name ?? "—"}</td>
                    <td className="py-4 pr-4">{row.email}</td>
                    <td className="py-4 pr-4">{contactStatus(row)}</td>
                    <td className="py-4 text-right">
                      <input type="checkbox" checked={row.responded} readOnly className="h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="font-sans text-sm text-styloire-inkMuted">
              No contacts on this request yet (or junction rows still migrating).
            </p>
          )}
        </div>
        <p className="mt-6 font-sans text-xs text-styloire-inkMuted">
          Response flags stay manual until your messaging layer is connected.
        </p>
      </StyloirePanel>
    </>
  );
}
