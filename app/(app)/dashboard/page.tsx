import Link from "next/link";
import { listDashboardRequestSummaries } from "@/lib/data/request-queries";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const view = typeof searchParams?.view === "string" ? searchParams.view : "";
  const heading = view === "requests" ? "Existing requests" : "My Portal";
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
    <div className="mx-auto max-w-[72rem] pb-12 pt-4">
      {view === "requests" ? (
        <>
          <div className="mb-10 text-center">
            <h1 className="font-serif text-[clamp(3.9rem,8vw,6.8rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-styloire-champagneLight">
              {heading}
            </h1>
          </div>

          {requestRows.length === 0 ? (
            <div className="mx-auto max-w-[52rem] rounded-[0.55rem] border border-white/12 bg-[#323230] px-6 py-12 text-center">
              <p className="font-serif text-[1.9rem] text-styloire-champagneLight">
                No requests yet
              </p>
              <p className="mt-3 font-sans text-[0.9rem] text-white/50">
                Create your first request to start sending personalized outreach.
              </p>
              <div className="mt-7">
                <Link
                  href="/requests/new"
                  className="inline-flex rounded-full border border-white/36 bg-white/18 px-8 py-3 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white"
                >
                  Send a new request
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {requestRows.map((request) => (
                <div
                  key={request.id}
                  className="min-h-[18.8rem] rounded-[1.9rem] border border-white/42 bg-white/22 px-6 py-8"
                >
                  <p className="font-sans text-[2.15rem] font-medium leading-[0.96] text-styloire-champagneLight">
                    {request.talent_name}
                  </p>
                  <p className="mt-6 font-serif text-[2.9rem] leading-none text-styloire-champagneLight">
                    {request.sent_count}
                  </p>
                  <p className="mt-1 font-sans text-[1.08rem] text-white/76">Emails sent</p>
                  <p className="mt-2 font-sans text-[0.92rem] text-white/60">
                    {request.event_name}
                  </p>
                  <p className="mt-1 font-sans text-[0.78rem] text-white/42">
                    {formatDate(request.created_at)}
                  </p>
                  <div className="mt-4 h-px w-full bg-white/35" />
                  <div className="mt-4">
                    <Link
                      href={`/requests/${request.id}`}
                      className="font-sans text-[1rem] font-medium text-styloire-champagneLight hover:text-white"
                    >
                      View request &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="pt-2 text-center">
          <h1 className="font-serif text-[clamp(4.2rem,8.5vw,7.5rem)] font-semibold uppercase leading-[0.88] tracking-[-0.035em] text-styloire-champagneLight">
            {heading}
          </h1>
          <div className="mx-auto mt-8 flex max-w-[22rem] flex-col gap-5">
            <Link
              href="/requests/new"
              className="rounded-full border border-white/38 bg-white/20 px-8 py-4 font-sans text-[0.82rem] font-medium uppercase tracking-[0.2em] text-white/88"
            >
              Send a new request
            </Link>
            <Link
              href="/dashboard?view=requests"
              className="rounded-full border border-white/38 bg-white/20 px-8 py-4 font-sans text-[0.82rem] font-medium uppercase tracking-[0.2em] text-white/88"
            >
              Existing requests
            </Link>
            <Link
              href="/roster"
              className="rounded-full border border-white/38 bg-white/20 px-8 py-4 font-sans text-[0.82rem] font-medium uppercase tracking-[0.2em] text-white/88"
            >
              Client profiles
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
