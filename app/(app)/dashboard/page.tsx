import Link from "next/link";
import { DataSourceBanner } from "@/components/app/data-source-banner";
import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import { listDashboardRequestSummaries } from "@/lib/data/request-queries";
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
      return "border-emerald-500/40 text-emerald-200";
    case "draft":
      return "border-amber-400/40 text-amber-100";
    default:
      return "border-styloire-line text-styloire-inkMuted";
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

  return (
    <>
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <StyloireAppPageHeader
          title="Dashboard"
          description="Every pull request campaign in one view — sorted by most recent, filtered by status, ready for follow-ups."
        />
        <StyloireButton href="/requests/new" variant="solid">
          New request
        </StyloireButton>
      </div>

      <DataSourceBanner source={source} notice={notice} />

      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((item) => {
          const active = filter === item.value;
          const href =
            item.value === "all" ? "/dashboard" : `/dashboard?status=${item.value}`;
          return (
            <Link
              key={item.value}
              href={href}
              className={`rounded-full border px-4 py-1.5 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav transition-colors ${
                active
                  ? "border-styloire-ink bg-styloire-ink/10 text-styloire-ink"
                  : "border-styloire-line text-styloire-inkMuted hover:border-styloire-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6">
        {rows.map((request) => (
          <Link key={request.id} href={`/requests/${request.id}`}>
            <StyloirePanel className="transition-colors hover:border-styloire-line">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-serif text-2xl text-styloire-ink">
                    {request.talent_name}{" "}
                    <span className="text-styloire-inkMuted">/</span> {request.event_name}
                  </p>
                  <p className="mt-2 font-sans text-xs uppercase tracking-styloireWide text-styloire-inkMuted">
                    {request.selected_count} contacts selected · {request.sent_count} sent ·{" "}
                    {request.responded_count} responded
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <span
                    className={`rounded-full border px-3 py-1 font-sans text-[0.65rem] uppercase tracking-wide ${statusStyles(request.status)}`}
                  >
                    {request.status}
                  </span>
                  {request.followup_date ? (
                    <p className="font-sans text-xs text-styloire-inkSoft">
                      Follow up {request.followup_date}
                    </p>
                  ) : null}
                </div>
              </div>
            </StyloirePanel>
          </Link>
        ))}
      </div>
    </>
  );
}
