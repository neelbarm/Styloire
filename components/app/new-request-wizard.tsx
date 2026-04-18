"use client";

import { ArrowRight, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { StyloireButton, StyloireEyebrow, StyloirePanel } from "@/components/styloire";
import { DEFAULT_TEMPLATE_STANDARD_PULL } from "@/lib/styloire/default-templates";
import { type GroupedContacts, parseBrandContactsCsv } from "@/lib/styloire/parse-contacts";
import { renderTemplate } from "@/lib/styloire/template-render";

const demoCsv = `brand_name,email,first_name
PRADA,sally@prada.com,Sally
PRADA,katie@prada.com,Katie
CHANEL,sophie@chanel.com,Sophie`;

export function NewRequestWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [talent, setTalent] = useState("");
  const [eventName, setEventName] = useState("");
  const [groups, setGroups] = useState<GroupedContacts>({});
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [followup, setFollowup] = useState("");

  const brands = useMemo(() => Object.keys(groups).sort(), [groups]);
  const previewBrand = selectedBrands[0] ?? brands[0];
  const previewContact = previewBrand ? groups[previewBrand]?.[0] : undefined;

  const mergedBody = useMemo(() => {
    if (!previewContact || !talent || !eventName) return DEFAULT_TEMPLATE_STANDARD_PULL.body;
    return renderTemplate(DEFAULT_TEMPLATE_STANDARD_PULL.body, {
      brand_name: previewBrand ?? "",
      contact_name: previewContact.contact_name,
      talent,
      event: eventName
    });
  }, [previewBrand, previewContact, talent, eventName]);

  const subjectPreview =
    talent && eventName && previewBrand
      ? `${talent} / ${eventName} / ${previewBrand}`
      : "{{talent}} / {{event}} / {{brand_name}}";

  const loadCsv = (text: string) => {
    const parsed = parseBrandContactsCsv(text);
    setGroups(parsed);
    setSelectedBrands(Object.keys(parsed).sort());
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    loadCsv(text);
    setStep(2);
    event.currentTarget.value = "";
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand)
        ? current.filter((name) => name !== brand)
        : [...current, brand]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {(
          [
            ["Talent & event", 1],
            ["Contacts", 2],
            ["Template", 3],
            ["Follow up & send", 4]
          ] as const
        ).map(([label, n]) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(n)}
            className={`rounded-full border px-4 py-1.5 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav transition-colors ${
              step === n
                ? "border-styloire-ink bg-styloire-ink/10 text-styloire-ink"
                : "border-styloire-line text-styloire-inkMuted hover:border-styloire-ink"
            }`}
          >
            {n}. {label}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <StyloirePanel>
          <StyloireEyebrow className="mb-4">Step 1</StyloireEyebrow>
          <h2 className="font-serif text-2xl text-styloire-ink">Talent &amp; event</h2>
          <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
            Required fields mirror the spec: talent name and event / publication before
            contacts upload.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Talent name
              </span>
              <input
                value={talent}
                onChange={(e) => setTalent(e.target.value)}
                className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm text-styloire-ink focus:border-styloire-ink focus:outline-none"
                placeholder="Bella Hadid"
              />
            </label>
            <label className="space-y-2">
              <span className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Event / publication
              </span>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm text-styloire-ink focus:border-styloire-ink focus:outline-none"
                placeholder="Grammys"
              />
            </label>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <StyloireButton
              type="button"
              variant="solid"
              disabled={!talent.trim() || !eventName.trim()}
              onClick={() => setStep(2)}
            >
              <span className="inline-flex items-center gap-2">
                Continue
                <ArrowRight className="h-3 w-3" />
              </span>
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {step === 2 ? (
        <StyloirePanel>
          <StyloireEyebrow className="mb-4">Step 2</StyloireEyebrow>
          <h2 className="font-serif text-2xl text-styloire-ink">Upload contacts</h2>
          <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
            CSV with columns <code className="text-styloire-ink">brand_name,email,first_name</code>.
            Production adds SheetJS for XLSX per spec.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-styloire-line px-5 py-2 font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-ink hover:border-styloire-ink">
              <Upload className="h-4 w-4" />
              Upload file
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            </label>
            <StyloireButton type="button" variant="outline" onClick={() => loadCsv(demoCsv)}>
              Load sample CSV
            </StyloireButton>
          </div>
          {brands.length ? (
            <div className="mt-10 space-y-4">
              <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Toggle brands to include
              </p>
              <ul className="divide-y divide-styloire-lineSubtle border border-styloire-lineSubtle">
                {brands.map((brand) => (
                  <li
                    key={brand}
                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 font-sans text-sm text-styloire-ink"
                  >
                    <span>{brand}</span>
                    <span className="text-styloire-inkSoft">{groups[brand].length} contacts</span>
                    <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-styloire-inkMuted">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="h-4 w-4 rounded border-styloire-line"
                      />
                      Selected
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-4">
            <StyloireButton type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="solid"
              disabled={!brands.length || !selectedBrands.length}
              onClick={() => setStep(3)}
            >
              Preview template
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {step === 3 ? (
        <StyloirePanel>
          <StyloireEyebrow className="mb-4">Step 3</StyloireEyebrow>
          <h2 className="font-serif text-2xl text-styloire-ink">Write once</h2>
          <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
            Default template from spec §6. Dynamic fields update from your first selected
            brand row.
          </p>
          <div className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Subject preview
              </span>
              <input
                readOnly
                value={subjectPreview}
                className="w-full border border-styloire-lineSubtle bg-styloire-canvas/60 px-4 py-3 font-sans text-sm text-styloire-ink"
              />
            </label>
            <label className="block space-y-2">
              <span className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Body preview
              </span>
              <textarea
                readOnly
                rows={12}
                value={mergedBody}
                className="w-full resize-y border border-styloire-lineSubtle bg-styloire-canvas/60 px-4 py-3 font-sans text-sm font-light text-styloire-inkSoft"
              />
            </label>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <StyloireButton type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </StyloireButton>
            <StyloireButton type="button" variant="solid" onClick={() => setStep(4)}>
              Scheduling
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {step === 4 ? (
        <StyloirePanel>
          <StyloireEyebrow className="mb-4">Step 4</StyloireEyebrow>
          <h2 className="font-serif text-2xl text-styloire-ink">Follow up &amp; send</h2>
          <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
            Optional follow-up date. Sending is disabled until SendGrid + Supabase are
            connected.
          </p>
          <label className="mt-8 block max-w-xs space-y-2">
            <span className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
              Follow-up date
            </span>
            <input
              type="date"
              value={followup}
              onChange={(e) => setFollowup(e.target.value)}
              className="w-full border border-styloire-lineSubtle bg-transparent px-4 py-2 font-sans text-sm text-styloire-ink"
            />
          </label>
          <div className="mt-10 flex flex-wrap gap-4">
            <StyloireButton type="button" variant="outline" onClick={() => setStep(3)}>
              Back
            </StyloireButton>
            <StyloireButton type="button" variant="solid" disabled>
              Send via SendGrid
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}
    </div>
  );
}
