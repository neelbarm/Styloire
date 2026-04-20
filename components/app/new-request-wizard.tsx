"use client";

import { ArrowRight, Check, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
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
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [requestType, setRequestType] = useState<"new" | "existing">("new");
  const [profileId, setProfileId] = useState("");
  const [talent, setTalent] = useState("");
  const [eventName, setEventName] = useState("");
  const [groups, setGroups] = useState<GroupedContacts>({});
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [parseError, setParseError] = useState("");
  const [emailBody, setEmailBody] = useState<string>(DEFAULT_TEMPLATE_STANDARD_PULL.body);
  const [ccRecipients, setCcRecipients] = useState<string[]>(["User's assistant email"]);
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "error" | "success">("idle");
  const [submitError, setSubmitError] = useState("");
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const profiles = listProfiles();

  const matchedProfile = useMemo(() => {
    const target = talent.trim().toLowerCase();
    if (!target) return null;
    return (
      profiles.find((profile) => profile.talent_name.trim().toLowerCase() === target) ??
      profiles.find((profile) => profile.talent_name.trim().toLowerCase().includes(target)) ??
      null
    );
  }, [profiles, talent]);

  useEffect(() => {
    if (matchedProfile) {
      setRequestType("existing");
      setProfileId(matchedProfile.id);
      return;
    }
    setRequestType("new");
    setProfileId("");
  }, [matchedProfile]);

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
      setSubmittedRequestId(data.id);
      setSubmitState("success");
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

  const wizardTabs = [
    ["1 Details", 1],
    ["2 Contacts", 2],
    ["3 Email", 3],
    ["4 Review", 4],
    ["5 Send", 5]
  ] as const;

  return (
    <div className="space-y-7">
      <div className="inline-flex overflow-hidden rounded-[0.58rem] border border-white/16 bg-black/22">
        {wizardTabs.map(([label, n], index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(n)}
            className={`px-4 py-2 font-sans text-[0.87rem] font-semibold tracking-[-0.005em] transition-colors ${
              step === n
                ? "bg-stone-100 text-stone-900"
                : "bg-transparent text-white/66 hover:text-white/85"
            } ${index > 0 ? "border-l border-white/14" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <StyloirePanel className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(59,59,57,0.46),rgba(43,43,42,0.46))] p-0">
          <div className="p-6 md:p-7">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="font-sans text-[1.8rem] font-semibold tracking-[-0.01em] text-styloire-champagneLight">
                  Talent name
                </span>
                <input
                  value={talent}
                  onChange={(e) => setTalent(e.target.value)}
                  className="w-full rounded-[0.55rem] border border-white/14 bg-black/10 px-4 py-2.5 font-sans text-[1.03rem] text-styloire-champagneLight focus:border-white/32 focus:outline-none"
                  placeholder=""
                />
              </label>
              <label className="space-y-2">
                <span className="font-sans text-[1.8rem] font-semibold tracking-[-0.01em] text-styloire-champagneLight">
                  Event or publication
                </span>
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full rounded-[0.55rem] border border-white/14 bg-black/10 px-4 py-2.5 font-sans text-[1.03rem] text-styloire-champagneLight focus:border-white/32 focus:outline-none"
                  placeholder=""
                />
              </label>
            </div>
            <p className="mt-2 font-sans text-[1.02rem] font-medium text-white/58">
              {matchedProfile
                ? "Existing roster profile found — you can use saved contacts in step 2."
                : "No saved roster profile found yet — you can upload contacts in step 2."}
            </p>
            <div className="mt-5">
              <p className="font-sans text-[1.85rem] font-semibold tracking-[-0.01em] text-styloire-champagneLight">
                Subject line preview
              </p>
            </div>
            <div className="mt-2 space-y-2">
              <div className="w-full rounded-[0.55rem] bg-black/24 px-3 py-2.5 font-sans text-[0.83rem] text-white/58">
                Client&apos;s Name <span className="mx-4 text-white/75">/</span> Event{" "}
                <span className="mx-4 text-white/75">/</span> Brand Name
              </div>
              <div className="w-full rounded-[0.55rem] bg-black/24 px-3 py-2.5 font-sans text-[0.83rem] text-white/58">
                Client&apos;s Name <span className="mx-4 text-white/75">/</span> Event{" "}
                <span className="mx-4 text-white/75">/</span> Brand Name
              </div>
            </div>
            <p className="mt-2 font-sans text-[0.98rem] font-medium text-white/58">
              Auto-generated per brand. Updates live as you type above.
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/12 px-6 py-4 md:px-7">
            <p className="font-sans text-[1.02rem] font-semibold text-white/58">Step 1 of 5</p>
            <StyloireButton
              type="button"
              variant="outline"
              disabled={!isStepOneReady}
              onClick={() => setStep(2)}
              className="border-white/24 bg-transparent px-6 py-2.5 text-[0.72rem] tracking-[0.05em] text-white/90 hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {step === 2 ? (
        <StyloirePanel className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(59,59,57,0.46),rgba(43,43,42,0.46))] p-0">
          <div className="p-6 md:p-7">
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  if (matchedProfile) {
                    setRequestType("existing");
                    setProfileId(matchedProfile.id);
                    loadProfileContacts(matchedProfile.id);
                  } else {
                    loadPreviousContacts();
                  }
                }}
                className={`rounded-[0.6rem] border px-4 py-3 text-left transition-colors ${
                  requestType === "existing"
                    ? "border-white/42 bg-white/10"
                    : "border-white/16 bg-black/10 hover:border-white/28"
                }`}
              >
                <p className="font-sans text-[1.45rem] font-semibold tracking-[-0.01em] text-styloire-champagneLight">
                  Use existing profile
                </p>
                <p className="mt-1 font-sans text-[1rem] font-medium text-white/62">
                  {matchedProfile
                    ? `${matchedProfile.talent_name} — ${Object.keys(groups).length || 148} saved contacts`
                    : "Client Name — saved contacts"}
                </p>
              </button>

              <label className="cursor-pointer rounded-[0.6rem] border border-white/16 bg-black/10 px-4 py-3 text-left transition-colors hover:border-white/28">
                <p className="font-sans text-[1.45rem] font-semibold tracking-[-0.01em] text-styloire-champagneLight">
                  Upload new list
                </p>
                <p className="mt-1 font-sans text-[1rem] font-medium text-white/62">
                  Upload a .csv or .xlsx file
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleFile}
                  onClick={() => {
                    setRequestType("new");
                    setProfileId("");
                  }}
                />
              </label>
            </div>

            <div className="mt-5 overflow-hidden rounded-[0.6rem] border border-white/14 bg-black/10">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="font-sans text-[1.25rem] font-semibold text-styloire-champagneLight">
                  Select contacts
                </p>
                <p className="font-sans text-[1rem] font-semibold text-white/72">
                  {selectedCount} of {brands.length || 148} selected
                </p>
              </div>

              <div className="px-4 py-3">
                <input
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search brands..."
                  className="w-full rounded-[0.5rem] border border-white/10 bg-black/12 px-3 py-2.5 font-sans text-[1rem] text-styloire-champagneLight placeholder:text-white/45"
                />
              </div>

              <div className="border-t border-white/10 px-4 py-2.5">
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 font-sans text-[0.95rem] font-semibold text-white/50">
                  <span>Brand Name</span>
                  <span className="justify-self-end"># of Contacts</span>
                  <span className="w-8" />
                </div>
              </div>

              <ul className="divide-y divide-white/10">
                {(filteredBrands.length ? filteredBrands : brands).slice(0, 2).map((brand) => (
                  <li key={brand} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3.5">
                    <span className="font-sans text-[1.02rem] text-white/72">{brand || "Brand Name"}</span>
                    <span className="justify-self-end font-sans text-[0.98rem] text-white/55">
                      {groups[brand]?.length ?? "# of Contacts"}
                    </span>
                    <label className="inline-flex w-8 cursor-pointer justify-end">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="h-5 w-5 appearance-none rounded-full border border-white/30 bg-white/12 checked:border-emerald-400 checked:bg-emerald-400"
                      />
                    </label>
                  </li>
                ))}
              </ul>

              <p className="px-4 py-2.5 font-sans text-[1rem] font-semibold italic text-white/62">
                + {Math.max(0, (brands.length || 148) - 2)} more contacts
              </p>
            </div>

            {parseError ? <p className="mt-3 font-sans text-xs text-red-300">{parseError}</p> : null}
          </div>

          <div className="flex items-center justify-between border-t border-white/12 px-6 py-4 md:px-7">
            <StyloireButton
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="border-white/24 bg-transparent px-5 py-2.5 text-[0.72rem] tracking-[0.05em] text-white/90 hover:bg-white/10"
            >
              Back
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="outline"
              disabled={!brands.length || !selectedCount}
              onClick={() => setStep(3)}
              className="border-white/24 bg-transparent px-5 py-2.5 text-[0.72rem] tracking-[0.05em] text-white/90 hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                Continue with {selectedCount} contacts
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {step === 3 ? (
        <StyloirePanel className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(59,59,57,0.46),rgba(43,43,42,0.46))] p-0">
          <div className="space-y-5 p-6 md:p-7">
            <label className="block space-y-2">
              <span className="font-sans text-[1.28rem] font-semibold tracking-[-0.01em] text-styloire-champagneLight">
                Email body
              </span>
              <textarea
                rows={6}
                value={emailBody}
                onChange={(event) => setEmailBody(event.target.value)}
                placeholder="Text"
                className="w-full resize-y rounded-[0.55rem] border border-white/14 bg-black/10 px-3 py-2.5 font-sans text-[1rem] text-styloire-champagneLight placeholder:text-white/42 focus:border-white/30 focus:outline-none"
              />
            </label>

            <div className="space-y-2">
              <p className="font-sans text-[1.2rem] font-semibold tracking-[-0.01em] text-styloire-champagneLight">
                Sending from
              </p>
              <div className="flex flex-wrap items-center gap-4 rounded-[0.55rem] border border-white/14 bg-black/10 px-3 py-2.5">
                <span className="font-sans text-[1rem] text-white/62">User&apos;s email</span>
                <span className="font-sans text-[0.95rem] font-semibold text-emerald-400">
                  Connected via Gmail
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-sans text-[1.2rem] font-semibold tracking-[-0.01em] text-styloire-champagneLight">
                CC recipients
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {ccRecipients.map((recipient, index) => (
                  <input
                    key={`cc-${index}`}
                    value={recipient}
                    onChange={(event) => {
                      const next = [...ccRecipients];
                      next[index] = event.target.value;
                      setCcRecipients(next);
                    }}
                    className="rounded-[0.55rem] border border-white/14 bg-black/10 px-3 py-2 font-sans text-[0.96rem] text-white/72 focus:border-white/30 focus:outline-none"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setCcRecipients((prev) => [...prev, ""])}
                  className="font-sans text-[0.96rem] font-semibold text-white/62 transition-colors hover:text-white/85"
                >
                  + Add another
                </button>
              </div>
              <p className="font-sans text-[0.9rem] text-white/52">
                These addresses will be copied on every email sent in this request.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/12 px-6 py-4 md:px-7">
            <StyloireButton
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="border-white/24 bg-transparent px-5 py-2.5 text-[0.72rem] tracking-[0.05em] text-white/90 hover:bg-white/10"
            >
              Back
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="outline"
              onClick={() => setStep(4)}
              className="border-white/24 bg-transparent px-5 py-2.5 text-[0.72rem] tracking-[0.05em] text-white/90 hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {step === 4 ? (
        <StyloirePanel className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(59,59,57,0.46),rgba(43,43,42,0.46))] p-0">
          <div className="space-y-4 p-6 md:p-7">
            <div className="max-w-[26rem] rounded-[0.55rem] border border-white/14 bg-black/10 px-3 py-3">
              <p className="font-sans text-[1.06rem] font-semibold uppercase tracking-[0.02em] text-styloire-champagneLight">
                Request details
              </p>
              <p className="mt-2 font-sans text-[0.95rem] text-white/62">
                {talent || "Client's Name"} <span className="mx-3 text-white/72">/</span>{" "}
                {eventName || "Event"}
              </p>
              <p className="mt-1 font-sans text-[1.35rem] font-semibold text-styloire-champagneLight">
                {selectedCount} contacts selected
              </p>
              <p className="mt-1 font-sans text-[0.95rem] text-white/62">
                <span className="font-semibold text-white/78">Sending from:</span> User&apos;s email
              </p>
            </div>

            <div className="rounded-[0.55rem] border border-white/14 bg-black/10 px-3 py-3">
              <p className="font-sans text-[1.06rem] font-semibold uppercase tracking-[0.02em] text-styloire-champagneLight">
                Email preview
              </p>
              <p className="mt-2 font-sans text-[0.92rem] text-white/62">
                <span className="font-semibold text-white/76">Subject:</span> Client&apos;s Name{" "}
                <span className="mx-3 text-white/72">/</span> Event{" "}
                <span className="mx-3 text-white/72">/</span> Brand
              </p>
              <p className="mt-1 font-sans text-[0.92rem] text-white/62">
                <span className="font-semibold text-white/76">From:</span> User&apos;s email{" "}
                <span className="mx-6 text-white/72">CC:</span>{" "}
                {ccRecipients.filter((v) => v.trim()).join(", ") || "User's assistant's email"}
              </p>
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="whitespace-pre-wrap font-sans text-[0.95rem] text-white/72">
                  {emailBody || "Text"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/12 px-6 py-4 md:px-7">
            <StyloireButton
              type="button"
              variant="outline"
              onClick={() => setStep(3)}
              className="border-white/24 bg-transparent px-5 py-2.5 text-[0.72rem] tracking-[0.05em] text-white/90 hover:bg-white/10"
            >
              Back
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="outline"
              disabled={submitState === "saving" || !selectedCount}
              onClick={submitRequest}
              className="border-white/24 bg-transparent px-5 py-2.5 text-[0.72rem] tracking-[0.05em] text-white/90 hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                Send {selectedCount} emails
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </StyloireButton>
          </div>
        </StyloirePanel>
      ) : null}

      {step === 5 ? (
        <StyloirePanel className="bg-[rgb(44,44,42)]/85">
          {submitState === "success" ? (
            <div className="mx-auto flex max-w-xl flex-col items-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200/45 bg-emerald-100/90">
                <Check className="h-6 w-6 text-emerald-900" />
              </div>
              <p className="mt-4 font-sans text-[1.35rem] font-semibold text-styloire-champagneLight">
                {selectedCount} emails sent
              </p>
              <p className="mt-1 font-sans text-[0.98rem] text-white/64">
                {talent || "Client&apos;s Name"} <span className="mx-3 text-white/70">/</span>{" "}
                {eventName || "Event"}
              </p>
              <p className="mt-1 font-sans text-[0.98rem] text-white/64">
                <span className="font-semibold text-white/78">Sending from</span> User&apos;s email
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <StyloireButton
                  href={submittedRequestId ? `/requests/${submittedRequestId}` : "/dashboard"}
                  variant="outline"
                  className="border-white/24 bg-transparent px-5 py-2.5 text-[0.72rem] tracking-[0.05em] text-white/90 hover:bg-white/10"
                >
                  View request
                </StyloireButton>
                <StyloireButton
                  href="/requests/new"
                  variant="outline"
                  className="border-white/24 bg-transparent px-5 py-2.5 text-[0.72rem] tracking-[0.05em] text-white/90 hover:bg-white/10"
                >
                  + New Request
                </StyloireButton>
              </div>
            </div>
          ) : (
            <>
              <StyloireEyebrow className="mb-4">Step 5</StyloireEyebrow>
              <h2 className="font-serif text-2xl text-styloire-champagne">Hit send</h2>
              <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
                Review and send the request immediately.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <StyloireButton type="button" variant="outline" onClick={() => setStep(4)}>
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
            </>
          )}
        </StyloirePanel>
      ) : null}
    </div>
  );
}
