import Link from "next/link";
import { StyloireButton } from "@/components/styloire/button";
import { listDashboardRequestSummaries } from "@/lib/data/request-queries";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const view = typeof searchParams?.view === "string" ? searchParams.view : "";
  const showRequests = view === "requests";
  const requestData = showRequests ? await listDashboardRequestSummaries("all") : null;
  const requestRows = requestData?.rows ?? [];

  if (showRequests) {
    return (
      <div className="mx-auto max-w-6xl pb-10 pt-6">
        <h1 className="text-center font-serif text-[clamp(3.8rem,8.3vw,6.1rem)] font-semibold uppercase leading-[0.9] tracking-[-0.014em] text-styloire-champagneLight">
          Existing requests
        </h1>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {requestRows.map((request) => (
            <Link
              key={request.id}
              href={`/requests/${request.id}`}
              className="min-h-[18.8rem] rounded-[1.9rem] border border-white/45 bg-white/26 px-6 py-8 transition-[border-color,background-color] duration-styloire ease-styloire hover:border-white/60 hover:bg-white/30"
            >
              <p className="font-sans text-[2.8rem] font-medium leading-[0.96] text-styloire-champagneLight">
                {request.talent_name}
              </p>
              <p className="mt-6 font-serif text-[3.15rem] leading-none text-styloire-champagneLight">
                {request.selected_count}
              </p>
              <p className="mt-1 font-sans text-[1.18rem] text-white/76">Contacts</p>
              <div className="mt-3 h-px w-full bg-white/35" />
              <p className="mt-4 font-sans text-[1.08rem] font-medium text-styloire-champagneLight">
                Open request &rarr;
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-12 pt-10">
      <h1 className="text-center font-serif text-[clamp(4.1rem,9vw,6.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.014em] text-styloire-champagneLight">
        My portal
      </h1>

      <div className="mx-auto mt-4 flex max-w-[21.5rem] flex-col items-center gap-4">
        <StyloireButton
          href="/requests/new"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Send a new request
        </StyloireButton>
        <StyloireButton
          href="/dashboard?view=requests"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Existing requests
        </StyloireButton>
        <StyloireButton
          href="/roster"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Client profiles
        </StyloireButton>
        <StyloireButton
          href="/templates"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Templates
        </StyloireButton>
        <StyloireButton
          href="/settings"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Account
        </StyloireButton>
      </div>
    </div>
  );
}
