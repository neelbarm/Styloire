import { notFound } from "next/navigation";
import { DataSourceBanner } from "@/components/app/data-source-banner";
import { RequestDetailClient } from "@/components/app/request-detail-client";
import { getRequestDetailResolved } from "@/lib/data/request-queries";
import { showDataSourceBanner } from "@/lib/site";

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const detail = await getRequestDetailResolved(params.id);
  if (!detail) notFound();
  const { request, rows, source, notice } = detail;

  return (
    <>
      {showDataSourceBanner() ? <DataSourceBanner source={source} notice={notice} /> : null}
      <RequestDetailClient request={request} rows={rows} />
    </>
  );
}
