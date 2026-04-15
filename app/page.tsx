"use client";

import { ArrowRight, CheckCircle, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type Contact = {
  email: string;
  firstName: string;
};

type GroupedContacts = Record<string, Contact[]>;

const demoCsv = `brand_name,email,first_name
PRADA,sally@prada.com,Sally
PRADA,katie@prada.com,Katie
PRADA,grace@prada.com,Grace
CHANEL,sophie@chanel.com,Sophie`;

function parseCsv(csvText: string): GroupedContacts {
  const normalizedCsv = csvText.replace(/^\uFEFF/, "");
  const rows = normalizedCsv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 3 && cells.some((cell) => cell));

  if (rows.length < 2) return {};

  const [header, ...dataRows] = rows;
  const normalizedHeader = header.map((column) => column.toLowerCase());
  const brandIndex = normalizedHeader.indexOf("brand_name");
  const emailIndex = normalizedHeader.indexOf("email");
  const firstNameIndex = normalizedHeader.indexOf("first_name");

  if (brandIndex === -1 || emailIndex === -1 || firstNameIndex === -1) {
    return {};
  }

  return dataRows.reduce<GroupedContacts>((acc, row) => {
    const brand = row[brandIndex]?.toUpperCase();
    const email = row[emailIndex];
    const firstName = row[firstNameIndex];

    if (!brand || !email || !firstName) return acc;
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push({ email, firstName });
    return acc;
  }, {});
}

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [csvText, setCsvText] = useState("");
  const [groups, setGroups] = useState<GroupedContacts>({});
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [talent, setTalent] = useState("Bella");
  const [eventName, setEventName] = useState("Grammys");

  const brands = useMemo(() => Object.keys(groups).sort(), [groups]);

  const previewSubjects = useMemo(() => {
    return selectedBrands.map(
      (brand) => `${talent} / ${eventName} / ${brand} - Styling Request`
    );
  }, [selectedBrands, talent, eventName]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    const parsed = parseCsv(text);
    setGroups(parsed);
    const allBrands = Object.keys(parsed).sort();
    setSelectedBrands(allBrands.slice(0, 1));
    setStep(2);
    event.currentTarget.value = "";
  };

  const handleUseDemoCsv = () => {
    setCsvText(demoCsv);
    const parsed = parseCsv(demoCsv);
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

  const baseCardClass =
    "rounded-3xl border border-stone-100 bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 px-4 py-6 md:px-8 md:py-10">
      <div className="pointer-events-none absolute -left-16 top-16 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-stone-200/40 blur-3xl" />

      <section className="relative mx-auto w-full max-w-7xl rounded-3xl border border-stone-100 bg-white/80 p-8 shadow-2xl backdrop-blur-xl md:p-12">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-600">
              Styloire
            </p>
            <h1 className="text-4xl font-black leading-tight text-stone-800 md:text-6xl">
              Fashion Stylist Request Demo
            </h1>
            <p className="max-w-3xl text-sm font-bold text-stone-600 md:text-base">
              Luxury outreach workflow in 3 steps. Upload your PR sheet, auto-group
              brand contacts, and generate polished request previews instantly.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-3xl border border-amber-200 bg-amber-50 px-6 py-3 text-xs font-bold uppercase tracking-wide text-amber-700 shadow-xl">
            <CheckCircle className="h-4 w-4" />
            Step {step} of 3
          </span>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {["Upload CSV", "Brand Grouping", "Create Request"].map(
            (label, index) => {
              const itemStep = index + 1;
              const isActive = step === itemStep;
              const isComplete = step > itemStep;
              return (
                <div
                  key={label}
                  className={`group rounded-3xl border px-6 py-6 text-sm font-bold transition-all duration-300 hover:scale-[1.02] ${
                    isActive
                      ? "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 text-stone-800 shadow-xl"
                      : isComplete
                        ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-stone-800 shadow-xl"
                        : "border-stone-200 bg-stone-50 text-stone-600"
                  }`}
                >
                  <p className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-xs shadow">
                      {itemStep}
                    </span>
                    {label}
                    {(isActive || isComplete) && (
                      <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </p>
                </div>
              );
            }
          )}
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className={baseCardClass}>
              <h2 className="mb-3 text-2xl font-bold text-stone-800">
                1) Upload CSV
              </h2>
              <p className="mb-6 text-sm font-bold text-stone-600">
                Required columns: <code>brand_name,email,first_name</code>
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
                  <Upload className="h-4 w-4" />
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleUseDemoCsv}
                  className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
                >
                  Use Demo CSV
                </button>
              </div>
              {csvText ? (
                <p className="mt-4 text-xs font-bold text-stone-600">
                  CSV loaded ({csvText.split(/\r?\n/).length - 1} contacts)
                </p>
              ) : null}
            </div>

            <div className={`${baseCardClass} relative overflow-hidden`}>
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-100/70 blur-2xl" />
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-stone-800">
                  2) Brand Contact Groups
                </h2>
                <button
                  type="button"
                  disabled={!brands.length}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-stone-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wide text-stone-700 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Focus table
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="hidden md:block">
                <table className="w-full table-fixed text-sm">
                  <thead>
                    <tr className="rounded-3xl border-b border-stone-200 bg-stone-50 text-left text-xs font-bold uppercase tracking-wide text-stone-700">
                      <th className="w-20 px-3 py-4">Select</th>
                      <th className="w-36 px-3 py-4">Brand</th>
                      <th className="w-28 px-3 py-4"># Contacts</th>
                      <th className="px-3 py-4">Email list</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.length ? (
                      brands.map((brand) => (
                        <tr
                          key={brand}
                          className="border-b border-stone-100 align-top transition-colors duration-300 hover:bg-stone-50"
                        >
                          <td className="px-3 py-4">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => toggleBrand(brand)}
                              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                            />
                          </td>
                          <td className="truncate px-3 py-4 font-bold text-stone-800">
                            {brand}
                          </td>
                          <td className="px-3 py-4 font-bold text-stone-600">
                            {groups[brand].length}
                          </td>
                          <td className="break-words px-3 py-4 font-semibold text-stone-600">
                            {groups[brand].map((contact) => contact.email).join(", ")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-8 text-center font-bold text-stone-500"
                        >
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
                      className="rounded-3xl border border-stone-200 bg-stone-50 p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-lg font-bold text-stone-800">{brand}</p>
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="h-5 w-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                        />
                      </div>
                      <p className="mb-2 text-sm font-bold text-stone-600">
                        {groups[brand].length} contacts
                      </p>
                      <p className="break-words text-sm font-semibold text-stone-600">
                        {groups[brand].map((contact) => contact.email).join(", ")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-3xl border border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm font-bold text-stone-500">
                    Upload a CSV to auto-group contacts by brand.
                  </p>
                )}
              </div>
            </div>

            <form
              onSubmit={submitRequest}
              className={`${baseCardClass} relative overflow-hidden`}
            >
              <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-emerald-100/60 blur-3xl" />
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-stone-800">3) Create Request</h2>
                <button
                  type="submit"
                  disabled={!selectedBrands.length}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create Request
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-2 block font-bold text-stone-700">Talent</span>
                  <input
                    value={talent}
                    onChange={(e) => setTalent(e.target.value)}
                    className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 font-bold text-stone-800 outline-none ring-amber-300 transition-all duration-300 focus:ring"
                    placeholder="Bella"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-2 block font-bold text-stone-700">Event</span>
                  <input
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 font-bold text-stone-800 outline-none ring-amber-300 transition-all duration-300 focus:ring"
                    placeholder="Grammys"
                  />
                </label>
              </div>
            </form>
          </div>

          <aside className={`${baseCardClass} h-fit border-stone-200 bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50`}>
            <h3 className="mb-4 text-2xl font-bold text-stone-800">Request Preview</h3>
            <p className="mb-6 text-sm font-bold text-stone-600">
              Subject line samples for selected brands:
            </p>
            {previewSubjects.length ? (
              <ul className="space-y-4">
                {previewSubjects.map((subject) => (
                  <li
                    key={subject}
                    className="rounded-3xl border border-stone-200 bg-white/90 px-5 py-4 text-sm font-bold text-stone-700 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
                  >
                    <span className="inline-flex items-start gap-3 break-words">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {subject}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-bold text-stone-500">
                Select at least one brand to preview subjects.
              </p>
            )}

            {step === 3 ? (
              <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-sm font-bold text-emerald-700 shadow-xl">
                Request drafted for {talent || "Talent"} / {eventName || "Event"} /
                {" "}
                {selectedBrands.join(", ")}.
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
