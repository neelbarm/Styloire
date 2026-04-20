import Link from "next/link";
import { StyloireButton } from "@/components/styloire/button";
import { listDashboardRequestSummaries } from "@/lib/data/request-queries";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const view = typeof searchParams?.view === "string" ? searchParams.view : "";
  const heading = view === "requests" ? "Existing requests" : "Dashboard";
  const requestData = await listDashboardRequestSummaries("all");
  const requestRows = requestData.rows;

  function formatDate(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  return (
    <div className="mx-auto max-w-5xl pb-12 pt-8">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-serif text-[clamp(2.5rem,5.6vw,4.6rem)] font-semibold uppercase leading-[0.92] tracking-[-0.014em] text-styloire-champagneLight">
            {heading}
          </h1>
          <p className="mt-2 font-sans text-[0.82rem] font-light text-white/42">
            All requests, sorted by most recent.
          </p>
        </div>
        <StyloireButton href="/requests/new" variant="solid" className="px-8">
          New request
        </StyloireButton>
      </div>

      {requestRows.length === 0 ? (
        <div className="rounded-[0.9rem] border border-white/12 bg-black/8 px-6 py-10 text-center">
          <p className="font-serif text-[1.8rem] text-styloire-champagneLight">
            No requests yet
          </p>
          <p className="mt-2 font-sans text-[0.88rem] text-white/45">
            Create your first request to start sending personalized outreach.
          </p>
          <div className="mt-6">
            <StyloireButton href="/requests/new" variant="outline">
              Send a new request
            </StyloireButton>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[0.8rem] border border-white/12 bg-black/8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="border-b border-white/10 bg-black/14">
                <tr>
                  <th className="px-5 py-3 text-left font-sans text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-white/42">
                    Talent
                  </th>
                  <th className="px-5 py-3 text-left font-sans text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-white/42">
                    Event / Publication
                  </th>
                  <th className="px-5 py-3 text-left font-sans text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-white/42">
                    Emails sent
                  </th>
                  <th className="px-5 py-3 text-left font-sans text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-white/42">
                    Created
                  </th>
                  <th className="px-5 py-3 text-right font-sans text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-white/42">
                    Open
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {requestRows.map((request) => (
                  <tr key={request.id} className="transition-colors hover:bg-white/[0.025]">
                    <td className="px-5 py-4 font-sans text-[0.9rem] font-medium text-styloire-champagneLight">
                      {request.talent_name}
                    </td>
                    <td className="px-5 py-4 font-sans text-[0.88rem] text-white/66">
                      {request.event_name}
                    </td>
                    <td className="px-5 py-4 font-sans text-[0.88rem] text-white/66">
                      {request.sent_count}
                    </td>
                    <td className="px-5 py-4 font-sans text-[0.82rem] text-white/46">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/requests/${request.id}`}
                        className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-styloire-champagneMuted hover:text-styloire-champagneLight"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
