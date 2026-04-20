"use client";

import { ArrowRight, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StyloireButton, StyloireEyebrow, StyloirePanel } from "@/components/styloire";
import { getProfileWithContacts, listProfiles } from "@/lib/styloire/mock-data";
import { DEFAULT_TEMPLATE_STANDARD_PULL } from "@/lib/styloire/default-templates";
import {
  type GroupedContacts,
  parseBrandContactsFileDetailed
} from "@/lib/styloire/parse-contacts";
import { renderTemplate } from "@/lib/styloire/template-render";

export function NewRequestWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [requestType, setRequestType] = useState<"new" | "existing">("new");
  const [profileId, setProfileId] = useState("");
  const [talent, setTalent] = useState("");
  const [eventName, setEventName] = useState("");
  const [groups, setGroups] = useState<GroupedContacts>({});
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [parseError, setParseError] = useState("");
  const [emailBody, setEmailBody] = useState<string>(DEFAULT_TEMPLATE_STANDARD_PULL.body);
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const profiles = listProfiles();

  const brands = useMemo(() => Object.keys(groups).sort(), [groups]);
  const filteredBrands = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((brand) => brand.toLowerCase().includes(q));
  }, [brands, contactSearch]);
  const selectedCount = selectedBrands.length;
  const previewBrand = selectedBrands[0] ?? brands[0];
  const previewContact = previewBrand ? groups[previewBrand]?.[0] : undefined;

  const mergedBody = useMemo(() => {
    if (!previewContact || !talent || !eventName) return emailBody;
    return renderTemplate(emailBody, {
      brand_name: previewBrand ?? "",
      contact_name: previewContact.contact_name,
      talent,
      event: eventName
    });
  }, [emailBody, previewBrand, previewContact, talent, eventName]);

  const subjectPreview =
    talent && eventName && previewBrand
      ? `${talent} / ${eventName} / ${previewBrand}`
      : "{{talent}} / {{event}} / {{brand_name}}";

  const loadPreviousContacts = () => {
    const target = talent.trim().toLowerCase();
    if (!target) {
      setParseError("Enter a talent/client name first, then load previous contacts.");
      return;
    }
    const matched =
      profiles.find((profile) => profile.talent_name.trim().toLowerCase() === target) ??
      profiles.find((profile) =>
        profile.talent_name.trim().toLowerCase().includes(target),
      );
    if (!matched) {
      setParseError(`No saved profile found for "${talent.trim()}".`);
      return;
    }
    setRequestType("existing");
    setProfileId(matched.id);
    loadProfileContacts(matched.id);
    setParseError("");
  };

  const loadProfileContacts = (nextProfileId: string) => {
    const profile = getProfileWithContacts(nextProfileId);
    if (!profile) {
      setGroups({});
      setSelectedBrands([]);
      return;
    }

    const grouped = profile.contacts.reduce<GroupedContacts>((acc, row) => {
      const key = row.brand_name.trim().toUpperCase();
      const list = acc[key] ?? [];
      list.push({
        brand_name: key,
        email: row.email,
        contact_name: row.contact_name ?? ""
      });
      acc[key] = list;
      return acc;
    }, {});

    setTalent(profile.profile.talent_name);
    setGroups(grouped);
    setSelectedBrands(Object.keys(grouped).sort());
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const parsed = await parseBrandContactsFileDetailed(file);
    setGroups(parsed.groups);
    setSelectedBrands(Object.keys(parsed.groups).sort());
    setParseError(parsed.errors[0] ?? "");
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

  const isStepOneReady = Boolean(talent.trim() && eventName.trim());

  const contactsPayload = Object.values(groups).flat();

  const submitRequest = async () => {
    setSubmitState("saving");
    setSubmitError("");
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
        emailBody
      })
    });
    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      error?: string;
      source?: string;
    };
    if (!response.ok || !data.id) {
      setSubmitState("error");
      setSubmitError(data.error ?? "Could not create request.");
      return;
    }

    if (data.source === "mock" || data.id === "req_local_preview") {
      router.push(`/requests/${data.id}`);
      return;
    }

    const sendResponse = await fetch(`/api/requests/${data.id}/send`, {
      method: "POST",
    });
    const sendPayload = (await sendResponse.json().catch(() => ({}))) as {
      error?: string;
      ok?: boolean;
      sent?: number;
      failed?: number;
    };

    if (sendResponse.status === 400) {
      setSubmitState("error");
      setSubmitError(
        sendPayload.error ??
          "Could not send emails. Check your connected account in Settings.",
      );
      return;
    }

    if (sendResponse.status === 207) {
      setSubmitState("error");
      setSubmitError(
        sendPayload.error ??
          `Partial send: ${sendPayload.sent ?? 0} sent, ${sendPayload.failed ?? 0} failed. Open the request to retry.`,
      );
      router.push(`/requests/${data.id}`);
      return;
    }

    if (!sendResponse.ok) {
      setSubmitState("error");
      setSubmitError(sendPayload.error ?? "Send request failed.");
      return;
    }

    router.push(`/requests/${data.id}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-1 rounded-full border border-styloire-lineSubtle bg-black/26 p-1">
        {(
          [
            ["1 Details", 1],
            ["2 Contacts", 2],
            ["3 Email", 3],
            ["4 Send", 4]
          ] as const
        ).map(([label, n]) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(n)}
            className={`rounded-full border px-4 py-1.5 font-sans text-[0.63rem] font-semibold tracking-[0.08em] transition-colors ${
              step === n
                ? "border-white/65 bg-white/85 text-stone-900"
                : "border-transparent bg-transparent text-styloire-inkMuted hover:border-styloire-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <StyloirePanel className="bg-[rgb(44,44,42)]/85">
          <StyloireEyebrow className="mb-4">Step 1</StyloireEyebrow>
          <h2 className="font-serif text-2xl text-styloire-champagne">Create a request</h2>
          <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
            Give your project a name. Add your talent and event, then choose a new upload or an
            existing client profile.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 border border-styloire-lineSubtle bg-black/25 px-4 py-3">
              <input
                type="radio"
                name="requestType"
                checked={requestType === "new"}
                onChange={() => {
                  setRequestType("new");
                  setProfileId("");
                  setGroups({});
                  setSelectedBrands([]);
                }}
              />
              <span className="font-sans text-sm text-styloire-ink">New profile from CSV</span>
            </label>
            <label className="flex items-center gap-3 border border-styloire-lineSubtle bg-black/25 px-4 py-3">
              <input
                type="radio"
                name="requestType"
                checked={requestType === "existing"}
                onChange={() => setRequestType("existing")}
              />
              <span className="font-sans text-sm text-styloire-ink">Use existing profile</span>
            </label>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Talent name
              </span>
              <input
                value={talent}
                onChange={(e) => setTalent(e.target.value)}
                className="w-full rounded-sm border border-styloire-lineSubtle bg-black/25 px-4 py-2.5 font-sans text-sm text-styloire-ink focus:border-styloire-champagne focus:outline-none"
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
                className="w-full rounded-sm border border-styloire-lineSubtle bg-black/25 px-4 py-2.5 font-sans text-sm text-styloire-ink focus:border-styloire-champagne focus:outline-none"
                placeholder="Grammys"
              />
            </label>
          </div>
          {requestType === "existing" ? (
            <label className="mt-6 block max-w-md space-y-2">
              <span className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Profile
              </span>
              <select
                value={profileId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setProfileId(nextId);
                  loadProfileContacts(nextId);
                }}
                className="w-full rounded-sm border border-styloire-lineSubtle bg-black/25 px-4 py-2.5 font-sans text-sm text-styloire-ink"
              >
                <option value="">Select profile</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.talent_name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-4">
            <StyloireButton
              type="button"
              variant="solid"
              disabled={!isStepOneReady || (requestType === "existing" && !profileId)}
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
        <StyloirePanel className="bg-[rgb(44,44,42)]/85">
          <StyloireEyebrow className="mb-4">Step 2</StyloireEyebrow>
          <h2 className="font-serif text-2xl text-styloire-champagne">Upload your contacts</h2>
          <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
            {requestType === "new"
              ? "Upload CSV for a new profile. Expected columns: brand_name, email, first_name."
              : "Review and toggle the saved contacts for this request. All are ON by default."}
          </p>
          {requestType === "new" ? (
            <div className="mt-8 flex flex-wrap gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-styloire-line px-5 py-2 font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-ink hover:border-styloire-ink">
                <Upload className="h-4 w-4" />
                Upload file
                <input
                  type="file"
                  accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleFile}
                />
              </label>
              <StyloireButton type="button" variant="outline" onClick={loadPreviousContacts}>
                Load previous contacts
              </StyloireButton>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <input
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search by brand"
                className="min-w-[220px] flex-1 rounded-sm border border-styloire-lineSubtle bg-black/25 px-4 py-2.5 font-sans text-sm text-styloire-ink"
              />
              <StyloireButton
                type="button"
                variant="outline"
                onClick={() => setSelectedBrands(brands)}
                disabled={!brands.length}
              >
                Select all
              </StyloireButton>
              <StyloireButton
                type="button"
                variant="outline"
                onClick={() => setSelectedBrands([])}
                disabled={!brands.length}
              >
                Deselect all
              </StyloireButton>
            </div>
          )}
          {brands.length ? (
            <div className="mt-10 space-y-4">
              <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                {selectedCount} of {brands.length} contacts selected
              </p>
              <ul className="divide-y divide-styloire-lineSubtle rounded-sm border border-styloire-lineSubtle bg-black/25">
                {filteredBrands.map((brand) => (
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
          {parseError ? (
            <p className="mt-6 font-sans text-xs text-red-300">{parseError}</p>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-4">
            <StyloireButton type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="solid"
              disabled={!brands.length || !selectedCount}
              onClick={() => setStep(3)}
            >
              Continue with {selectedCount} contacts
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {step === 3 ? (
        <StyloirePanel className="bg-[rgb(44,44,42)]/85">
          <StyloireEyebrow className="mb-4">Step 3</StyloireEyebrow>
          <h2 className="font-serif text-2xl text-styloire-champagne">Write your email once</h2>
          <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
            Default pull-request copy. Placeholders fill from your first selected row.
          </p>
          <div className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Subject preview
              </span>
              <input
                readOnly
                value={subjectPreview}
                className="w-full rounded-sm border border-styloire-lineSubtle bg-black/25 px-4 py-3 font-sans text-sm text-styloire-ink"
              />
            </label>
            <label className="block space-y-2">
              <span className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Body preview
              </span>
              <textarea
                rows={12}
                value={emailBody}
                onChange={(event) => setEmailBody(event.target.value)}
                className="w-full resize-y rounded-sm border border-styloire-lineSubtle bg-black/25 px-4 py-3 font-sans text-sm font-light text-styloire-inkSoft"
              />
            </label>
            <p className="font-sans text-xs text-styloire-inkMuted">
              Live merged preview shown in step content:
            </p>
            <pre className="whitespace-pre-wrap rounded-sm border border-styloire-lineSubtle bg-black/25 px-4 py-3 font-sans text-xs text-styloire-inkSoft">
              {mergedBody}
            </pre>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <StyloireButton type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </StyloireButton>
            <StyloireButton type="button" variant="solid" onClick={() => setStep(4)}>
              Continue
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {step === 4 ? (
        <StyloirePanel className="bg-[rgb(44,44,42)]/85">
          <StyloireEyebrow className="mb-4">Step 4</StyloireEyebrow>
          <h2 className="font-serif text-2xl text-styloire-champagne">Hit send</h2>
          <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
            Review and send the request immediately.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <StyloireButton type="button" variant="outline" onClick={() => setStep(3)}>
              Back
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="solid"
              disabled={submitState === "saving" || !selectedCount}
              onClick={submitRequest}
            >
              Send outreach
            </StyloireButton>
          </div>
          {submitError ? <p className="mt-4 font-sans text-xs text-red-300">{submitError}</p> : null}
        </StyloirePanel>
      ) : null}
    </div>
  );
}
