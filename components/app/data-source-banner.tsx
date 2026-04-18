export function DataSourceBanner({
  source,
  notice
}: {
  source: "mock" | "supabase";
  notice?: string;
}) {
  return (
    <div className="mb-8 space-y-3 border border-styloire-lineSubtle bg-styloire-canvas/40 px-5 py-4 font-sans text-xs font-light text-styloire-inkSoft">
      <p>
        <span className="font-medium uppercase tracking-styloireNav text-styloire-inkMuted">
          Data source
        </span>
        {": "}
        {source === "supabase"
          ? "Supabase (service role on the server — swap for user JWT + RLS when auth ships)."
          : "Bundled mock fixtures (set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to query Postgres)."}
      </p>
      {notice ? <p className="text-amber-100/90">{notice}</p> : null}
    </div>
  );
}
