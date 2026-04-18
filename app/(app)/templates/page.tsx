import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import { DYNAMIC_FIELD_HELP } from "@/lib/styloire/default-templates";
import { listTemplates } from "@/lib/styloire/mock-data";

export default function TemplatesPage() {
  const templates = listTemplates();

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <StyloireAppPageHeader
          title="Templates"
          description="House defaults first; yours follow. Merge fields stay visible while you edit."
        />
        <StyloireButton type="button" variant="solid" disabled>
          Create template
        </StyloireButton>
      </div>

      <StyloirePanel className="mb-10">
        <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
          Dynamic fields
        </p>
        <p className="mt-3 font-sans text-sm font-light text-styloire-inkSoft">
          Insert any of the following merge tokens inside your copy:
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {DYNAMIC_FIELD_HELP.map((field) => (
            <code
              key={field}
              className="rounded-sm border border-styloire-line px-3 py-1 font-mono text-xs text-styloire-ink"
            >
              {field}
            </code>
          ))}
        </div>
      </StyloirePanel>

      <div className="space-y-6">
        {templates.map((tpl) => (
          <StyloirePanel key={tpl.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-serif text-2xl text-styloire-champagne">{tpl.name}</p>
                <p className="mt-1 font-sans text-xs uppercase tracking-wide text-styloire-inkMuted">
                  {tpl.user_id ? "Your template" : "Styloire default"}
                </p>
              </div>
              {tpl.user_id ? (
                <div className="flex gap-2">
                  <StyloireButton type="button" variant="outline" disabled>
                    Edit
                  </StyloireButton>
                  <StyloireButton type="button" variant="outline" disabled>
                    Delete
                  </StyloireButton>
                </div>
              ) : null}
            </div>
            <pre className="mt-6 max-h-64 overflow-auto whitespace-pre-wrap border border-styloire-lineSubtle bg-styloire-canvas/60 p-4 font-sans text-xs font-light leading-relaxed text-styloire-inkSoft">
              {tpl.body}
            </pre>
          </StyloirePanel>
        ))}
      </div>
    </>
  );
}
