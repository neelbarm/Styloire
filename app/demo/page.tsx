"use client";

import { ArrowRight, CheckCircle, Upload } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { StyloireButton, StyloireEyebrow, StyloireMarketingHeader, StyloirePanel } from "@/components/styloire";
import {
  type GroupedContacts,
  parseBrandContactsCsv
} from "@/lib/styloire/parse-contacts";

const demoCsv = `brand_name,email,first_name
PRADA,sally@prada.com,Sally
PRADA,katie@prada.com,Katie
PRADA,grace@prada.com,Grace
CHANEL,sophie@chanel.com,Sophie`;

const pillOutline =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-styloire-line bg-transparent px-7 py-2.5 font-sans text-styloire-caption font-medium uppercase tracking-styloireNav text-styloire-ink transition-colors hover:border-styloire-ink hover:bg-styloire-ink/5";

const fieldLabel =
  "mb-2 block font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted";

const fieldInput =
  "w-full border-0 border-b border-styloire-line bg-transparent py-3 font-sans text-sm font-light text-styloire-ink placeholder:text-styloire-inkMuted focus:border-styloire-ink focus:outline-none";

export default function DemoPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [csvText, setCsvText] = useState("");
  const [groups, setGroups] = useState<GroupedContacts>({});
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [talent, setTalent] = useState("Bella");
  const [eventName, setEventName] = useState("Grammys");

  const brands = useMemo(() => Object.keys(groups).sort(), [groups]);
  const previewSubjects = useMemo(
    () =>
      selectedBrands.map(
        (brand) => `${talent} / ${eventName} / ${brand} - Styling Request`
      ),
    [selectedBrands, talent, eventName]
  );

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    const parsed = parseBrandContactsCsv(text);
    setGroups(parsed);
    setSelectedBrands(Object.keys(parsed).sort().slice(0, 1));
    setStep(2);
    event.currentTarget.value = "";
  };

  const handleUseDemoCsv = () => {
    setCsvText(demoCsv);
    const parsed = parseBrandContactsCsv(demoCsv);
    setGroups(parsed);
    setSelectedBrands(Object.keys(parsed).sort().slice(0, 1));
    setStep(2);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand)
        ? current.filter((name) => name !== brand)
        : [...current, brand]
    );
  };

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-styloire-canvas text-styloire-ink">
      <StyloireMarketingHeader />
      <div className="border-b border-styloire-lineSubtle px-6 py-4 md:px-10">
        <Link
          href="/"
          className="font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-inkMuted underline-offset-4 hover:text-styloire-ink hover:underline"
        >
          ← Marketing site
        </Link>
      </div>

      <main className="relative mx-auto max-w-styloire px-6 py-10 md:px-10 md:py-14">
        <div className="pointer-events-none absolute inset-0 bg-styloire-noise opacity-30" aria-hidden />

        <div className="relative mb-12 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-4">
            <StyloireEyebrow>Live import flow</StyloireEyebrow>
            <h1 className="font-serif text-3xl font-normal uppercase tracking-[0.08em] text-styloire-ink md:text-4xl md:leading-tight">
              Fashion stylist request demo
            </h1>
            <p className="font-sans text-styloire-body font-light leading-relaxed text-styloire-inkSoft">
              Upload a PR sheet, auto-group by house, and preview subject lines — the same
              rhythm as the workspace, in one place.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-styloire-line px-5 py-2 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav text-styloire-ink">
            <CheckCircle className="h-3.5 w-3.5 text-styloire-inkMuted" aria-hidden />
            Step {step} of 3
          </span>
        </div>

        <div className="relative mb-12 grid gap-3 md:grid-cols-3">
          {["Upload CSV", "Brand grouping", "Create request"].map((label, index) => {
            const itemStep = index + 1;
            const isActive = step === itemStep;
            const isComplete = step > itemStep;
            return (
              <div
                key={label}
                className={`rounded-full border px-5 py-3 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav transition-colors ${
                  isActive
                    ? "border-styloire-ink bg-styloire-ink/10 text-styloire-ink"
                    : isComplete
                      ? "border-styloire-line text-styloire-inkSoft"
                      : "border-styloire-lineSubtle text-styloire-inkMuted"
                }`}
              >
                <p className="flex items-center gap-2">
                  <span className="font-serif text-base not-italic text-styloire-inkMuted">
                    {String(itemStep).padStart(2, "0")}
                  </span>
                  {label}
                  {(isActive || isComplete) && (
                    <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-styloire-inkMuted" />
                  )}
                </p>
              </div>
            );
          })}
        </div>

        <div className="relative grid gap-10 xl:grid-cols-[1.2fr_0.85fr]">
          <div className="space-y-10">
            <StyloirePanel>
              <h2 className="font-serif text-xl font-normal text-styloire-ink md:text-2xl">
                1) Upload CSV
              </h2>
              <p className="mt-3 font-sans text-sm font-light text-styloire-inkSoft">
                Required columns:{" "}
                <code className="border border-styloire-lineSubtle px-2 py-0.5 font-mono text-xs text-styloire-ink">
                  brand_name, email, first_name
                </code>
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <label className={pillOutline}>
                  <Upload className="h-4 w-4" aria-hidden />
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <StyloireButton type="button" variant="solid" onClick={handleUseDemoCsv}>
                  Use demo CSV
                </StyloireButton>
              </div>
              {csvText ? (
                <p className="mt-6 font-sans text-xs uppercase tracking-styloireWide text-styloire-inkMuted">
                  CSV loaded ({csvText.split(/\r?\n/).length - 1} rows)
                </p>
              ) : null}
            </StyloirePanel>

            <StyloirePanel>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-serif text-xl font-normal text-styloire-ink md:text-2xl">
                  2) Brand contact groups
                </h2>
                <StyloireButton
                  type="button"
                  variant="outline"
                  disabled={!brands.length}
                  onClick={() => setStep(2)}
                >
                  Focus table
                  <ArrowRight className="ml-1 inline h-3 w-3" />
                </StyloireButton>
              </div>

              <div className="hidden md:block">
                <table className="w-full table-fixed text-sm">
                  <thead>
                    <tr className="border-b border-styloire-lineSubtle text-left font-sans text-[0.65rem] font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
                      <th className="w-20 px-3 py-3">Select</th>
                      <th className="w-36 px-3 py-3">Brand</th>
                      <th className="w-28 px-3 py-3">#</th>
                      <th className="px-3 py-3">Emails</th>
                    </tr>
                  </thead>
                  <tbody className="font-sans font-light text-styloire-inkSoft">
                    {brands.length ? (
                      brands.map((brand) => (
                        <tr
                          key={brand}
                          className="border-b border-styloire-lineSubtle align-top transition-colors hover:bg-styloire-ink/[0.03]"
                        >
                          <td className="px-3 py-4">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => toggleBrand(brand)}
                              className="h-4 w-4 rounded border-styloire-line bg-transparent text-styloire-ink focus:ring-styloire-ink/30"
                            />
                          </td>
                          <td className="truncate px-3 py-4 text-styloire-ink">{brand}</td>
                          <td className="px-3 py-4">{groups[brand].length}</td>
                          <td className="break-words px-3 py-4">{groups[brand].map((c) => c.email).join(", ")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-10 text-center text-sm text-styloire-inkMuted">
                          Upload a CSV to auto-group contacts by brand.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 md:hidden">
                {brands.length ? (
                  brands.map((brand) => (
                    <div
                      key={brand}
                      className="border border-styloire-lineSubtle bg-styloire-canvas/30 p-5"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="font-serif text-lg text-styloire-ink">{brand}</p>
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="h-4 w-4 rounded border-styloire-line bg-transparent text-styloire-ink focus:ring-styloire-ink/30"
                        />
                      </div>
                      <p className="mb-2 font-sans text-xs uppercase tracking-styloireWide text-styloire-inkMuted">
                        {groups[brand].length} contacts
                      </p>
                      <p className="break-words text-sm text-styloire-inkSoft">
                        {groups[brand].map((c) => c.email).join(", ")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="border border-styloire-lineSubtle px-4 py-8 text-center text-sm text-styloire-inkMuted">
                    Upload a CSV to auto-group contacts by brand.
                  </p>
                )}
              </div>
            </StyloirePanel>

            <StyloirePanel>
              <form onSubmit={submitRequest}>
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-serif text-xl font-normal text-styloire-ink md:text-2xl">
                    3) Create request
                  </h2>
                  <StyloireButton type="submit" variant="solid" disabled={!selectedBrands.length}>
                    Create request
                    <ArrowRight className="ml-1 inline h-3 w-3" />
                  </StyloireButton>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <label className="block">
                    <span className={fieldLabel}>Talent</span>
                    <input
                      value={talent}
                      onChange={(e) => setTalent(e.target.value)}
                      className={fieldInput}
                      placeholder="Bella Hadid"
                    />
                  </label>
                  <label className="block">
                    <span className={fieldLabel}>Event</span>
                    <input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className={fieldInput}
                      placeholder="Grammys"
                    />
                  </label>
                </div>
              </form>
            </StyloirePanel>
          </div>

          <aside>
            <StyloirePanel className="h-fit">
              <h3 className="font-serif text-xl text-styloire-ink">Request preview</h3>
              <p className="mt-3 font-sans text-sm font-light text-styloire-inkSoft">
                Subject line samples for selected brands:
              </p>
              {previewSubjects.length ? (
                <ul className="mt-8 space-y-3">
                  {previewSubjects.map((subject) => (
                    <li
                      key={subject}
                      className="border border-styloire-lineSubtle px-4 py-4 font-sans text-xs font-light leading-relaxed text-styloire-inkSoft"
                    >
                      <span className="inline-flex items-start gap-3 break-words">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-styloire-inkMuted" aria-hidden />
                        {subject}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-8 font-sans text-sm font-light text-styloire-inkMuted">
                  Select at least one brand to preview subjects.
                </p>
              )}

              {step === 3 ? (
                <div className="mt-8 border border-styloire-line px-5 py-6 font-sans text-sm font-light text-styloire-inkSoft">
                  Request drafted for {talent || "Talent"} / {eventName || "Event"} /{" "}
                  {selectedBrands.join(", ")}.
                </div>
              ) : null}
            </StyloirePanel>
          </aside>
        </div>
      </main>
    </div>
  );
}
