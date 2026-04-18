export function DataSourceBanner({
  source,
  notice
}: {
  source: "mock" | "supabase";
  notice?: string;
}) {
  return (
    <div className="mb-10 border border-styloire-lineSubtle bg-styloire-canvasDeep/50 px-5 py-4 font-sans text-xs font-light leading-relaxed text-styloire-inkSoft">
      <p>
        <span className="font-medium uppercase tracking-styloireNav text-styloire-inkMuted">
          Data
        </span>
        {" · "}
        {source === "supabase"
          ? "Reading from your database (server-side only)."
          : "Preview dataset — connect Supabase to replace."}
      </p>
      {notice ? <p className="mt-2 border-t border-styloire-lineSubtle pt-3 text-styloire-inkMuted">{notice}</p> : null}
    </div>
  );
}
