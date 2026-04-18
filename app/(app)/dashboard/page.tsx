import Link from "next/link";
import { DataSourceBanner } from "@/components/app/data-source-banner";
import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import { listDashboardRequestSummaries } from "@/lib/data/request-queries";
import { showDataSourceBanner } from "@/lib/site";
import type { RequestStatus } from "@/lib/styloire/types";

const filters: Array<{ label: string; value: RequestStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" }
];

function statusStyles(status: RequestStatus) {
  switch (status) {
    case "active":
      return "border-styloire-champagne/55 text-styloire-champagneLight bg-styloire-champagne/[0.08]";
    case "draft":
      return "border-styloire-line text-styloire-inkSoft bg-transparent";
    default:
      return "border-styloire-lineSubtle text-styloire-inkMuted bg-transparent";
  }
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams?.status;
  const filter: RequestStatus | "all" =
    typeof raw === "string" && ["active", "draft", "archived", "all"].includes(raw)
      ? (raw as RequestStatus | "all")
      : "all";

  const { source, rows, notice } = await listDashboardRequestSummaries(filter);
  const showBanner = showDataSourceBanner();

  return (
    <>
      <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <StyloireAppPageHeader
          title="Dashboard"
          description="Requests in reverse chronological order. Filter by state when the list grows long."
        />
        <StyloireButton href="/requests/new" variant="solid">
          New request
        </StyloireButton>
      </div>

      {showBanner ? <DataSourceBanner source={source} notice={notice} /> : null}

      <div className="mb-10 flex flex-wrap gap-2">
        {filters.map((item) => {
          const active = filter === item.value;
          const href =
            item.value === "all" ? "/dashboard" : `/dashboard?status=${item.value}`;
          return (
            <Link
              key={item.value}
              href={href}
              className={`rounded-sm border px-4 py-1.5 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav transition-[color,background-color,border-color] duration-styloire ease-styloire ${
                active
                  ? "border-styloire-champagne/55 bg-styloire-champagne/[0.08] text-styloire-champagneLight"
                  : "border-styloire-line text-styloire-inkMuted hover:border-styloire-champagne/40 hover:text-styloire-champagneLight"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <StyloirePanel className="py-20 text-center">
          <p className="font-serif text-2xl font-light text-styloire-champagne">Nothing here yet.</p>
          <p className="mx-auto mt-4 max-w-sm font-sans text-sm font-light text-styloire-inkMuted">
            Open a request when you are ready — it will appear at the top of this list.
          </p>
          <div className="mt-10 flex justify-center">
            <StyloireButton href="/requests/new" variant="outline">
              New request
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : (
        <div className="grid gap-5">
          {rows.map((request) => (
            <Link key={request.id} href={`/requests/${request.id}`}>
              <StyloirePanel className="transition-[border-color] duration-styloire ease-styloire hover:border-styloire-champagne/25">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-serif text-2xl font-light text-styloire-champagne md:text-[1.65rem]">
                      {request.talent_name}{" "}
                      <span className="text-styloire-inkMuted">/</span> {request.event_name}
                    </p>
                    <p className="mt-3 font-sans text-[0.65rem] uppercase tracking-styloireWide text-styloire-inkMuted">
                      {request.selected_count} selected · {request.sent_count} sent ·{" "}
                      {request.responded_count} replied
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`rounded-sm border px-3 py-1 font-sans text-[0.65rem] uppercase tracking-wide ${statusStyles(request.status)}`}
                    >
                      {request.status}
                    </span>
                    {request.followup_date ? (
                      <p className="font-sans text-xs text-styloire-inkMuted">
                        Follow up {request.followup_date}
                      </p>
                    ) : null}
                  </div>
                </div>
              </StyloirePanel>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
