"use client";

import { ArrowRight, Check, Upload } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyloireButton, StyloirePanel } from "@/components/styloire";
import type { BrandContact, ClientProfileSummary, ConnectedAccount } from "@/lib/styloire/types";
import {
  type GroupedContacts,
  parseBrandContactsFileDetailed
} from "@/lib/styloire/parse-contacts";
import { renderTemplate } from "@/lib/styloire/template-render";

// ─── Shared style tokens ──────────────────────────────────────────────────────
const labelCls =
  "font-sans text-[0.82rem] font-medium text-white/78";
const inputCls =
  "w-full rounded-[0.35rem] border border-white/12 bg-black/10 px-3.5 py-3 font-sans text-[0.95rem] text-styloire-champagneLight placeholder:text-white/30 focus:border-white/28 focus:outline-none transition-colors duration-styloire";
const panelGrad =
  "overflow-hidden rounded-[0.2rem] border border-white/12 bg-[#323230]";
const footerCls =
  "flex items-center justify-between border-t border-white/10 px-6 py-4 md:px-7";
const ghostBtn =
  "border-white/26 bg-transparent px-5 py-2 text-[0.78rem] tracking-[0.01em] text-white/84 hover:bg-white/8";
const filledBtn =
  "border-white/30 bg-white/10 px-6 py-2 text-[0.82rem] tracking-[0.01em] text-white/92 hover:bg-white/16";

type Props = {
  initialProfiles: ClientProfileSummary[];
  initialProfileId?: string;
};

type AccountResponse = {
  accounts?: ConnectedAccount[];
  error?: string;
};

type CcResponse = {
  emails?: string[];
  error?: string;
};

function groupContacts(contacts: BrandContact[]): GroupedContacts {
  return contacts.reduce<GroupedContacts>((acc, row) => {
    const key = row.brand_name.trim().toUpperCase();
    const list = acc[key] ?? [];
    list.push({ brand_name: key, email: row.email, contact_name: row.contact_name ?? "" });
    acc[key] = list;
    return acc;
  }, {});
}

export function NewRequestWizard({ initialProfiles, initialProfileId }: Props) {
  // ── All state preserved exactly ──────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [requestType, setRequestType] = useState<"new" | "existing">("new");
  const [contactSource, setContactSource] = useState<"none" | "profile" | "upload">("none");
  const [profileId, setProfileId] = useState("");
  const [talent, setTalent] = useState("");
  const [eventName, setEventName] = useState("");
  const [groups, setGroups] = useState<GroupedContacts>({});
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [parseError, setParseError] = useState("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState("{{talent}} / {{event}} / BRAND NAME");
  const [savedCcRecipients, setSavedCcRecipients] = useState<string[]>([]);
  const [accountSummary, setAccountSummary] = useState<{
    provider: ConnectedAccount["provider"];
    email: string;
  } | null>(null);
  const [accountError, setAccountError] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "error" | "success">("idle");
  const [submitMode, setSubmitMode] = useState<"sent" | "preview">("sent");
  const [submitError, setSubmitError] = useState("");
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const profiles = initialProfiles;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileLoadSeqRef = useRef(0);
  const autoSubjectRef = useRef("{{talent}} / {{event}} / BRAND NAME");

  // ── All derived state preserved exactly ─────────────────────────────────
  const matchedProfile = useMemo(() => {
    const target = talent.trim().toLowerCase();
    if (!target) return null;
    return profiles.find((p) => p.talent_name.trim().toLowerCase() === target) ?? null;
  }, [profiles, talent]);

  useEffect(() => {
    if (contactSource === "upload") {
      setRequestType("new");
      setProfileId("");
      return;
    }
    if (matchedProfile) {
      setRequestType("existing");
      setProfileId(matchedProfile.id);
      return;
    }
    setRequestType("new");
    setProfileId("");
  }, [contactSource, matchedProfile]);

  useEffect(() => {
    if (!initialProfileId) return;
    const preselected = profiles.find((profile) => profile.id === initialProfileId);
    if (!preselected) return;
    setTalent(preselected.talent_name);
    setProfileId(preselected.id);
    setContactSource("profile");
    setRequestType("existing");
  }, [initialProfileId, profiles]);

  useEffect(() => {
    let cancelled = false;

    async function loadSendingSettings() {
      try {
        const [accountsRes, ccRes] = await Promise.all([
          fetch("/api/email/accounts"),
          fetch("/api/settings/cc-emails")
        ]);

        const accountsJson = (await accountsRes.json().catch(() => ({}))) as AccountResponse;
        const ccJson = (await ccRes.json().catch(() => ({}))) as CcResponse;

        if (cancelled) return;

        if (accountsRes.ok) {
          const active = (accountsJson.accounts ?? []).find((account) => account.is_sending_active) ?? null;
          setAccountSummary(
            active
              ? {
                  provider: active.provider,
                  email: active.email
                }
              : null
          );
        } else {
          setAccountError(accountsJson.error ?? "Could not load connected account details.");
        }

        if (ccRes.ok) {
          setSavedCcRecipients(ccJson.emails ?? []);
        }
      } catch {
        if (!cancelled) {
          setAccountError("Could not load sending settings.");
        }
      }
    }

    void loadSendingSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const brands = useMemo(() => Object.keys(groups).sort(), [groups]);
  const totalContactCount = useMemo(
    () => brands.reduce((sum, brand) => sum + (groups[brand]?.length ?? 0), 0),
    [brands, groups]
  );
  const filteredBrands = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.toLowerCase().includes(q));
  }, [brands, contactSearch]);
  const selectedCount = selectedBrands.length;
  const selectedContactCount = useMemo(
    () => selectedBrands.reduce((sum, brand) => sum + (groups[brand]?.length ?? 0), 0),
    [groups, selectedBrands]
  );
  const previewBrand = selectedBrands[0] ?? brands[0];
  const previewBrandContacts = previewBrand ? groups[previewBrand] ?? [] : [];
  const previewContact = previewBrandContacts[0];
  const previewContactName =
    previewBrandContacts.length > 1
      ? "team"
      : (previewContact?.contact_name ?? "");

  const mergedBody = useMemo(() => {
    if (!previewContact || !talent || !eventName) return emailBody;
    return renderTemplate(emailBody, {
      brand_name: previewBrand ?? "",
      contact_name: previewContactName,
      talent,
      event: eventName
    });
  }, [emailBody, previewBrand, previewContact, previewContactName, talent, eventName]);

  const autoSubjectPreview = `${talent.trim() || "{{talent}}"} / ${
    eventName.trim() || "{{event}}"
  } / ${previewBrand?.toUpperCase() || "BRAND NAME"}`;
  const subjectPreview = renderTemplate(emailSubject, {
    talent: talent.trim() || "{{talent}}",
    event: eventName.trim() || "{{event}}",
    brand_name: previewBrand?.toUpperCase() || "BRAND NAME",
    contact_name: previewContactName || "{{contact_name}}"
  }).replace(/\{\{\s*brand_name\s*\}\}/gi, previewBrand?.toUpperCase() || "BRAND NAME");

  useEffect(() => {
    setEmailSubject((current) =>
      current === autoSubjectRef.current ? autoSubjectPreview : current
    );
    autoSubjectRef.current = autoSubjectPreview;
  }, [autoSubjectPreview]);

  const providerLabel = useMemo(() => {
    if (!accountSummary) return "";
    if (accountSummary.provider === "gmail") return "Gmail";
    if (accountSummary.provider === "outlook") return "Outlook";
    return "SMTP";
  }, [accountSummary]);

  // ── All handlers preserved exactly ──────────────────────────────────────
  const loadPreviousContacts = async () => {
    const target = talent.trim().toLowerCase();
    if (!target) {
      setParseError("Enter a talent/client name first, then load previous contacts.");
      return;
    }
    const matched = profiles.find((p) => p.talent_name.trim().toLowerCase() === target);
    if (!matched) {
      setParseError(`No saved profile found for "${talent.trim()}".`);
      return;
    }
    setRequestType("existing");
    setContactSource("profile");
    setProfileId(matched.id);
    await loadProfileContacts(matched.id);
    setParseError("");
  };

  const loadProfileContacts = useCallback(async (nextProfileId: string) => {
    const requestSeq = ++profileLoadSeqRef.current;
    try {
      const response = await fetch(`/api/brand-contacts?profile_id=${encodeURIComponent(nextProfileId)}`);
      const data = (await response.json().catch(() => ({}))) as {
        contacts?: BrandContact[];
        error?: string;
      };
      if (requestSeq !== profileLoadSeqRef.current) return;
      if (!response.ok) {
        setParseError(data.error ?? "Could not load saved contacts.");
        setGroups({});
        setSelectedBrands([]);
        return;
      }

      const profile = profiles.find((row) => row.id === nextProfileId);
      const contacts = data.contacts ?? [];
      if (!profile) {
        setParseError("Saved profile not found.");
        setGroups({});
        setSelectedBrands([]);
        return;
      }

      const grouped = groupContacts(contacts);
      setTalent(profile.talent_name);
      setContactSource("profile");
      setGroups(grouped);
      setSelectedBrands(Object.keys(grouped).sort());
      setParseError("");
    } catch {
      if (requestSeq !== profileLoadSeqRef.current) return;
      setParseError("Could not load saved contacts.");
      setGroups({});
      setSelectedBrands([]);
    }
  }, [profiles]);

  useEffect(() => {
    if (step !== 2 || requestType !== "existing" || !profileId || brands.length > 0) return;
    void loadProfileContacts(profileId);
  }, [step, requestType, profileId, brands.length, loadProfileContacts]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    profileLoadSeqRef.current += 1;
    const parsed = await parseBrandContactsFileDetailed(file);
    setContactSource("upload");
    setRequestType("new");
    setProfileId("");
    setGroups(parsed.groups);
    setSelectedBrands(Object.keys(parsed.groups).sort());
    setParseError(parsed.errors[0] ?? "");
    event.currentTarget.value = "";
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((n) => n !== brand) : [...current, brand]
    );
  };

  const isStepOneReady = Boolean(talent.trim() && eventName.trim());
  const contactsPayload = Object.values(groups).flat();

  const submitRequest = async () => {
    setSubmitState("saving");
    setSubmitMode("sent");
    setSubmitError("");
    setSubmittedRequestId(null);
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        talent: talent.trim(),
        eventName: eventName.trim(),
        requestType,
        profileId: profileId || undefined,
        contacts: contactsPayload,
        selectedBrands,
        emailSubject,
        emailBody
      })
    });
    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      error?: string;
      source?: string;
      previewOnly?: boolean;
      notice?: string;
    };
    if (!response.ok || !data.id) {
      if (response.ok && data.previewOnly) {
        setSubmitMode("preview");
        setSubmitError(data.notice ?? "");
        setSubmitState("success");
        return;
      }
      setSubmitState("error");
      setSubmitError(data.error ?? "Could not create request.");
      return;
    }
    if (data.source === "mock" || data.previewOnly) {
      setSubmitMode("preview");
      setSubmittedRequestId(null);
      setSubmitError(data.notice ?? "");
      setSubmitState("success");
      return;
    }
    const sendResponse = await fetch(`/api/requests/${data.id}/send`, { method: "POST" });
    const sendPayload = (await sendResponse.json().catch(() => ({}))) as {
      error?: string;
      ok?: boolean;
      sent?: number;
      failed?: number;
      remaining?: number;
    };
    if (sendResponse.status === 400) {
      setSubmitState("error");
      setSubmitError(
        sendPayload.error ?? "Could not send emails. Check your connected account in Settings."
      );
      return;
    }
    if (sendResponse.status === 207) {
      setSubmitState("error");
      setSubmitError(
        sendPayload.error ??
          `Partial send: ${sendPayload.sent ?? 0} sent, ${sendPayload.failed ?? 0} failed, ${sendPayload.remaining ?? 0} still queued. Open the request to continue.`
      );
      return;
    }
    if (!sendResponse.ok) {
      setSubmitState("error");
      setSubmitError(sendPayload.error ?? "Send request failed.");
      return;
    }
    setSubmittedRequestId(data.id);
    setSubmitState("success");
  };

  // ── Template download ────────────────────────────────────────────────────
  const downloadTemplate = async () => {
    const { utils, writeFile } = await import("xlsx");
    const ws = utils.aoa_to_sheet([
      ["Brand Name", "Email Address", "PR Contact Name"],
      ["Valentino", "press@valentino.com", "Elena"]
    ]);
    // Set column widths for readability
    ws["!cols"] = [{ wch: 28 }, { wch: 34 }, { wch: 18 }];
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Contacts");
    writeFile(wb, "styloire-contacts-template.xlsx");
  };

  // ── Tab labels ───────────────────────────────────────────────────────────
  const wizardTabs = [
    { label: "Details", n: 1 as const },
    { label: "Contacts", n: 2 as const },
    { label: "Email", n: 3 as const },
    { label: "Review", n: 4 as const },
    { label: "Send", n: 5 as const }
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── STEP TAB BAR ── always visible ─────────────────────────────── */}
      <div className="inline-flex overflow-hidden rounded-[0.2rem] border border-white/12 bg-black/10">
        {wizardTabs.map(({ label, n }, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(n)}
            className={[
              "px-4 py-2 font-sans text-[0.82rem] font-medium tracking-[0.01em] transition-colors duration-styloire",
              i > 0 ? "border-l border-white/12" : "",
              step === n
                ? "bg-white text-[#2b2a28]"
                : "bg-transparent text-white/64 hover:text-white/80"
            ].join(" ")}
          >
            {n} {label}
          </button>
        ))}
      </div>

      {/* ══ STEP 1 — DETAILS ═══════════════════════════════════════════════ */}
      {step === 1 ? (
        <StyloirePanel className={panelGrad}>
          <div className="space-y-6 p-6 md:p-7">

            {/* Talent + Event fields */}
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className={labelCls}>Talent name</span>
                <input
                  value={talent}
                  onChange={(e) => setTalent(e.target.value)}
                  placeholder="e.g. Jessica Alba"
                  className={inputCls}
                />
              </label>
              <label className="space-y-2">
                <span className={labelCls}>Event / Publication</span>
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Vogue June Cover"
                  className={inputCls}
                />
              </label>
            </div>

            {/* Profile status hint */}
            <p className="font-sans text-[0.84rem] font-medium text-white/50">
              {contactSource === "upload"
                ? "Using uploaded contacts for this request. Saved roster contacts will not be attached unless you choose the saved profile option in step 2."
                : matchedProfile
                ? `Existing profile found for ${matchedProfile.talent_name} — saved contacts load automatically in step 2.`
                : "No saved roster profile found yet — you can upload a contact file in step 2."}
            </p>

            {/* Subject line preview */}
            <div className="space-y-2">
              <span className={labelCls}>Subject line preview</span>
              <div className="rounded-[0.35rem] border border-white/8 bg-black/18 px-4 py-3">
                <p className="font-sans text-[0.88rem] text-white/70">{subjectPreview}</p>
              </div>
              <p className="font-sans text-[0.8rem] text-white/42">
                Auto-generated per brand. Updates live as you type above.
              </p>
            </div>
          </div>

          <div className={footerCls}>
            <p className="font-sans text-[0.95rem] font-medium text-white/72">Step 1 of 5</p>
            <StyloireButton
              type="button"
              variant="outline"
              disabled={!isStepOneReady}
              onClick={() => setStep(2)}
              className={filledBtn}
            >
              <span className="inline-flex items-center gap-2">
                Continue <ArrowRight className="h-3 w-3" />
              </span>
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {/* ══ STEP 2 — CONTACTS ══════════════════════════════════════════════ */}
      {step === 2 ? (
        <div className="space-y-5">
          {brands.length === 0 ? (
            /* Empty state — show source selectors */
            <div className="space-y-5">
              <div>
                <h2 className="font-sans text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-white/55">
                  Contacts
                </h2>
                <p className="mt-1 font-sans text-[0.85rem] font-light text-white/50">
                  Load a saved profile or upload a new contact file (.csv, .xls, or .xlsx).
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Saved profile card */}
                <button
                  type="button"
                  onClick={loadPreviousContacts}
                  disabled={!matchedProfile}
                  className={[
                    "rounded-[0.45rem] border p-5 text-left transition-[border-color,background-color] duration-styloire",
                    matchedProfile
                      ? "cursor-pointer border-white/38 bg-white/8 hover:border-white/54 hover:bg-white/12"
                      : "cursor-not-allowed border-white/14 bg-white/4 opacity-50"
                  ].join(" ")}
                >
                  <p className={labelCls}>Saved profile</p>
                  <p className="mt-2 font-sans text-[1.05rem] font-semibold text-styloire-champagneLight">
                    {matchedProfile ? matchedProfile.talent_name : "No match found"}
                  </p>
                  {matchedProfile ? (
                    <p className="mt-1 font-sans text-[0.82rem] text-white/55">
                      {matchedProfile.contact_count} contacts saved
                    </p>
                  ) : (
                    <p className="mt-1 font-sans text-[0.82rem] text-white/45">
                      Enter a talent name in step 1 that matches a saved profile.
                    </p>
                  )}
                </button>

                {/* Upload new file card */}
                <label className="cursor-pointer rounded-[0.45rem] border border-white/38 bg-white/8 p-5 transition-[border-color,background-color] duration-styloire hover:border-white/54 hover:bg-white/12">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    className="sr-only"
                    onChange={handleFile}
                  />
                  <p className={labelCls}>Upload contacts</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-styloire-champagneLight" />
                    <p className="font-sans text-[1.05rem] font-semibold text-styloire-champagneLight">
                      Upload .csv, .xls, or .xlsx
                    </p>
                  </div>
                  <p className="mt-1 font-sans text-[0.82rem] text-white/55">
                    Columns: Brand Name, Email Address, PR Contact Name (optional)
                  </p>
                </label>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="rounded-[0.45rem] border border-white/38 bg-white/8 p-5 text-left transition-[border-color,background-color] duration-styloire hover:border-white/54 hover:bg-white/12"
                >
                  <p className={labelCls}>Need a brand contact template?</p>
                  <p className="mt-2 font-sans text-[1.05rem] font-semibold text-styloire-champagneLight">
                    Download our xlsx sheet
                  </p>
                  <p className="mt-1 font-sans text-[0.82rem] text-white/55">
                    Fill in your contacts and upload the file here.
                  </p>
                </button>
              </div>

              {parseError ? (
                <p className="font-sans text-[0.78rem] text-red-300">{parseError}</p>
              ) : null}
            </div>
          ) : (
            /* Loaded state — show toggle list */
            <StyloirePanel className={panelGrad}>
              <div className="space-y-5 p-6 md:p-7">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-sans text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-white/55">
                    Select contacts
                  </h2>
                  <p className="mt-1 font-sans text-[0.85rem] text-white/50">
                    {selectedContactCount} of {totalContactCount} selected
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBrands([...brands])}
                    className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white/52 hover:text-white/78"
                  >
                    Select all
                  </button>
                  <span className="text-white/24">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedBrands([])}
                    className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white/52 hover:text-white/78"
                  >
                    Deselect all
                  </button>
                </div>
              </div>

              {/* Search */}
              <input
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full rounded-full border border-white/18 bg-black/14 px-5 py-2.5 font-sans text-[0.88rem] text-styloire-champagneLight placeholder:text-white/35 focus:border-white/30 focus:outline-none"
              />

              {/* Toggle list */}
              <div className="overflow-hidden rounded-[0.2rem] border border-white/12 bg-transparent">
                <ul className="divide-y divide-white/10">
                  <li className="grid grid-cols-[1.2fr_0.8fr_auto] gap-3 border-b border-white/10 px-5 py-3 font-sans text-[0.82rem] font-medium text-white/58">
                    <span>Brand Name</span>
                    <span># of Contacts</span>
                    <span />
                  </li>
                  {filteredBrands.map((brand) => (
                    <li
                      key={brand}
                      className="grid grid-cols-[1.2fr_0.8fr_auto] items-center gap-3 px-5 py-3"
                    >
                      <div>
                        <p className="font-sans text-[0.9rem] font-medium text-white/82">
                          {brand}
                        </p>
                      </div>
                      <p className="font-sans text-[0.88rem] text-white/62">
                        {groups[brand]?.length ?? 0}
                      </p>
                      <label className="inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="peer sr-only"
                        />
                        <span className="relative inline-flex h-5 w-10 items-center rounded-full border border-white/32 bg-white/18 transition-colors peer-checked:border-emerald-500/60 peer-checked:bg-emerald-500/80">
                          <span className="h-3.5 w-3.5 translate-x-0.5 rounded-full bg-white/70 shadow transition-transform peer-checked:translate-x-[1.35rem] peer-checked:bg-white" />
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                {brands.length > filteredBrands.length ? (
                  <p className="px-5 py-3 font-sans text-[0.82rem] italic text-white/42">
                    + {brands.length - filteredBrands.length} brands hidden by search
                  </p>
                ) : null}
              </div>

              {parseError ? (
                <p className="font-sans text-[0.78rem] text-red-300">{parseError}</p>
              ) : null}
              </div>
            </StyloirePanel>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <StyloireButton
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className={ghostBtn}
            >
              Back
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="outline"
              disabled={!brands.length || !selectedCount}
              onClick={() => setStep(3)}
              className={filledBtn}
            >
              <span className="inline-flex items-center gap-2">
                Continue with {selectedContactCount} contacts <ArrowRight className="h-3 w-3" />
              </span>
            </StyloireButton>
          </div>
        </div>
      ) : null}

      {/* ══ STEP 3 — EMAIL ═════════════════════════════════════════════════ */}
      {step === 3 ? (
        <StyloirePanel className={panelGrad}>
          <div className="space-y-6 p-6 md:p-7">

            {/* Subject preview */}
            <label className="block space-y-2">
              <span className={labelCls}>Subject line preview</span>
              <input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className={inputCls}
              />
              <p className="font-sans text-[0.72rem] text-white/38">
                Editable at this stage. Use BRAND NAME or {"{{brand_name}}"} to keep the
                selected brand dynamic.
              </p>
              <div className="rounded-[0.35rem] border border-white/8 bg-black/18 px-4 py-3">
                <p className="font-sans text-[0.88rem] text-white/70">{subjectPreview}</p>
              </div>
            </label>

            {/* Email body */}
            <label className="block space-y-2">
              <span className={labelCls}>Email body</span>
              <textarea
                rows={8}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your pull request email here."
                className={inputCls + " resize-y"}
              />
            </label>

            {/* Sending from */}
            <div className="space-y-2">
              <span className={labelCls}>Sending from</span>
              <div className="flex flex-wrap items-center gap-3 rounded-[0.35rem] border border-white/8 bg-black/18 px-4 py-3">
                {accountSummary ? (
                  <>
                    <span className="font-sans text-[0.88rem] text-white/78">{accountSummary.email}</span>
                    <span className="font-sans text-[0.82rem] font-medium text-emerald-300/85">
                      Connected via {providerLabel}
                    </span>
                  </>
                ) : (
                  <span className="font-sans text-[0.88rem] text-white/55">
                    No active sending account set in Settings yet.
                  </span>
                )}
              </div>
              {accountError ? (
                <p className="font-sans text-[0.72rem] text-red-300">{accountError}</p>
              ) : null}
            </div>

            {/* CC recipients */}
            <div className="space-y-2">
              <span className={labelCls}>CC recipients</span>
              <div className="flex flex-wrap items-center gap-2 rounded-[0.35rem] border border-white/8 bg-black/18 px-4 py-3">
                {savedCcRecipients.length > 0 ? (
                  savedCcRecipients.map((recipient) => (
                    <span
                      key={recipient}
                      className="rounded-full border border-white/12 bg-white/8 px-3 py-1 font-sans text-[0.8rem] text-white/72"
                    >
                      {recipient}
                    </span>
                  ))
                ) : (
                  <span className="font-sans text-[0.85rem] text-white/52">
                    No CC recipients saved in Account Settings.
                  </span>
                )}
              </div>
              <p className="font-sans text-[0.72rem] text-white/38">
                CC recipients are managed in Account Settings and apply to every sent request.
              </p>
            </div>
          </div>

          <div className={footerCls}>
            <StyloireButton
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className={ghostBtn}
            >
              Back
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="outline"
              onClick={() => setStep(4)}
              className={filledBtn}
            >
              <span className="inline-flex items-center gap-2">
                Review <ArrowRight className="h-3 w-3" />
              </span>
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {/* ══ STEP 4 — REVIEW ════════════════════════════════════════════════ */}
      {step === 4 ? (
        <StyloirePanel className={panelGrad}>
          <div className="space-y-5 p-6 md:p-7">
            <div>
              <span className={labelCls}>Review your request</span>
              <p className="mt-1 font-sans text-[0.8rem] text-white/45">
                Double-check everything before sending. One email goes out per selected brand,
                with all recipients for that brand grouped in To.
              </p>
            </div>

            {/* Request summary */}
            <div className="rounded-[0.35rem] border border-white/12 bg-black/16 divide-y divide-white/8">
              <div className="px-5 py-4">
                <p className={labelCls + " mb-2"}>Request details</p>
                <p className="font-sans text-[0.95rem] font-semibold text-styloire-champagneLight">
                  {talent || "—"}{" "}
                  <span className="mx-2 font-normal text-white/38">/</span>
                  {eventName || "—"}
                </p>
                <p className="mt-1 font-sans text-[0.82rem] text-white/52">
                  {selectedCount} brands selected · {selectedContactCount} contacts included
                </p>
              </div>
              <div className="px-5 py-4">
                <p className={labelCls + " mb-2"}>Subject line (per brand)</p>
                <p className="font-sans text-[0.88rem] text-white/65">{subjectPreview}</p>
              </div>
              <div className="px-5 py-4">
                <p className={labelCls + " mb-2"}>Sending from</p>
                <p className="font-sans text-[0.88rem] text-white/65">
                  {accountSummary ? `${accountSummary.email} via ${providerLabel}` : "Your active sending account in Settings"}
                </p>
                {savedCcRecipients.length > 0 ? (
                  <p className="mt-0.5 font-sans text-[0.82rem] text-white/45">
                    CC: {savedCcRecipients.join(", ")}
                  </p>
                ) : null}
              </div>
              <div className="px-5 py-4">
                <p className={labelCls + " mb-2"}>Email preview</p>
                <p className="whitespace-pre-wrap font-sans text-[0.85rem] leading-relaxed text-white/60 line-clamp-6">
                  {mergedBody || emailBody || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className={footerCls}>
            <StyloireButton
              type="button"
              variant="outline"
              onClick={() => setStep(3)}
              className={ghostBtn}
            >
              Back
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="outline"
              disabled={!selectedCount}
              onClick={() => setStep(5)}
              className={filledBtn}
            >
              <span className="inline-flex items-center gap-2">
                Looks good <ArrowRight className="h-3 w-3" />
              </span>
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {/* ══ STEP 5 — SEND ══════════════════════════════════════════════════ */}
      {step === 5 ? (
        <StyloirePanel className={panelGrad}>
          {submitState === "success" ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500/16">
                <Check className="h-5 w-5 text-emerald-300" />
              </div>
              <p className="mt-4 font-serif text-[1.5rem] font-semibold text-styloire-champagneLight">
                {submitMode === "preview" ? "Preview ready" : `${selectedCount} brand emails sent`}
              </p>
              <p className="mt-1 font-sans text-[0.85rem] text-white/52">
                {talent} <span className="mx-2 text-white/30">/</span> {eventName}
              </p>
              <p className="mt-0.5 font-sans text-[0.82rem] text-white/42">
                {submitMode === "preview"
                  ? submitError || "Supabase is not configured, so this request was not saved or sent."
                  : "Sent from your connected email"}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {submittedRequestId ? (
                  <StyloireButton
                    href={`/requests/${submittedRequestId}`}
                    variant="outline"
                    className={ghostBtn}
                  >
                    View request
                  </StyloireButton>
                ) : (
                  <StyloireButton href="/dashboard" variant="outline" className={ghostBtn}>
                    Back to dashboard
                  </StyloireButton>
                )}
                <StyloireButton
                  href={`/requests/new?fresh=${Date.now()}`}
                  variant="outline"
                  className={filledBtn}
                >
                  + New request
                </StyloireButton>
              </div>
            </div>
          ) : submitState === "saving" ? (
            /* ── Loading state ── */
            <div className="flex flex-col items-center py-10 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-styloire-champagneLight" />
              <p className="mt-4 font-sans text-[0.9rem] text-white/55">
                Sending {selectedCount} brand emails…
              </p>
            </div>
          ) : (
            /* ── Pre-send / error state ── */
            <div className="p-6 md:p-7">
              <span className={labelCls}>Ready to send</span>
              <p className="mt-2 max-w-[42rem] pr-4 whitespace-normal break-words font-sans text-[0.88rem] leading-relaxed text-white/55">
                {selectedCount} brand emails will go out, with all recipients for each selected
                brand grouped together in To.
              </p>

              {submitError ? (
                <div className="mt-4 rounded-[0.55rem] border border-red-400/30 bg-red-500/10 px-4 py-3">
                  <p className="font-sans text-[0.82rem] text-red-300">{submitError}</p>
                </div>
              ) : null}

              <div className={footerCls + " mt-6 border-t border-white/10 px-0 pt-5"}>
                <StyloireButton
                  type="button"
                  variant="outline"
                  onClick={() => setStep(4)}
                  className={ghostBtn}
                >
                  Back
                </StyloireButton>
                <StyloireButton
                  type="button"
                  variant="solid"
                  disabled={!selectedCount}
                  onClick={submitRequest}
                  className="px-8 py-2 text-[0.65rem] tracking-[0.1em]"
                >
                  Send {selectedCount} brand emails
                </StyloireButton>
              </div>
            </div>
          )}
        </StyloirePanel>
      ) : null}
    </div>
  );
}
