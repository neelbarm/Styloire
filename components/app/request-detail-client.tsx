"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import type { RequestSummary } from "@/lib/styloire/types";
import type { RequestContactDetail } from "@/lib/styloire/mock-data";

type Props = {
  request: RequestSummary;
  rows: RequestContactDetail[];
};

function contactStatus(row: RequestContactDetail) {
  if (!row.selected) return "Not selected";
  if (row.send_error) return "Send failed";
  if (!row.email_sent) return "Queued";
  if (row.responded) return "Responded";
  if (row.opened) return "Opened";
  return "No response";
}

export function RequestDetailClient({ request, rows }: Props) {
  const router = useRouter();
  const [requestState, setRequestState] = useState<RequestSummary>(request);
  const [contactRows, setContactRows] = useState<RequestContactDetail[]>(rows);
  const [busy, setBusy] = useState(false);
  const [followupDate, setFollowupDate] = useState(request.followup_date ?? "");
  const [note, setNote] = useState("");

  const stats = useMemo(() => {
    const sent = contactRows.filter((row) => row.email_sent).length;
    const opened = contactRows.filter((row) => row.opened).length;
    const responded = contactRows.filter((row) => row.responded).length;
    return { sent, opened, responded, noResponse: Math.max(0, sent - responded) };
  }, [contactRows]);

  const hasPendingSends = useMemo(
    () =>
      contactRows.some((row) => row.selected && !row.email_sent),
    [contactRows],
  );

  async function sendPendingOutreach() {
    setBusy(true);
    setNote("");
    const response = await fetch(`/api/requests/${requestState.id}/send`, {
      method: "POST",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      sent?: number;
      failed?: number;
    };
    setBusy(false);
    if (response.status === 400) {
      setNote(payload.error ?? "Could not send. Check Settings → connected account.");
      return;
    }
    if (response.status === 207) {
      setNote(
        payload.error ??
          `Partial send: ${payload.sent ?? 0} sent, ${payload.failed ?? 0} failed.`,
      );
      router.refresh();
      return;
    }
    if (!response.ok) {
      setNote(payload.error ?? "Send failed.");
      return;
    }
    setNote("Outreach send completed.");
    router.refresh();
  }

  async function archiveRequest() {
    setBusy(true);
    const response = await fetch(`/api/requests/${requestState.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" })
    });
    setBusy(false);
    if (!response.ok) {
      setNote("Could not archive this request.");
      return;
    }
    setRequestState((prev) => ({ ...prev, status: "archived" }));
    setNote("Request archived.");
  }

  async function toggleResponded(id: string, value: boolean) {
    setContactRows((prev) => prev.map((row) => (row.id === id ? { ...row, responded: value } : row)));
    const response = await fetch(`/api/request-contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responded: value })
    });
    if (!response.ok) {
      setNote("Could not update contact status.");
    }
  }

  async function saveFollowupDate(nextDate: string | null) {
    setBusy(true);
    const response = await fetch(`/api/requests/${requestState.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followupDate: nextDate })
    });
    setBusy(false);
    if (!response.ok) {
      setNote("Could not update follow-up date.");
      return;
    }
    setRequestState((prev) => ({ ...prev, followup_date: nextDate }));
    setNote(nextDate ? "Follow-up date updated." : "Follow-up date canceled.");
  }

  async function sendFollowup() {
    setBusy(true);
    const response = await fetch(`/api/requests/${requestState.id}/follow-up`, { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as { sentCount?: number };
    setBusy(false);
    if (!response.ok) {
      setNote("Could not send follow-ups.");
      return;
    }
    setNote(`Follow-up processed for ${data.sentCount ?? 0} contacts.`);
  }

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <StyloireAppPageHeader
          title={`${requestState.talent_name} / ${requestState.event_name}`}
          description="Request performance, contact status, and follow-up controls."
        />
        <div className="flex flex-wrap gap-3">
          {requestState.status === "draft" && hasPendingSends ? (
            <StyloireButton
              type="button"
              variant="solid"
              disabled={busy}
              onClick={sendPendingOutreach}
            >
              Hit send
            </StyloireButton>
          ) : null}
          <StyloireButton type="button" variant="outline" disabled={busy} onClick={archiveRequest}>
            Mark archived
          </StyloireButton>
          <StyloireButton type="button" variant="solid" disabled={busy} onClick={sendFollowup}>
            Send follow up
          </StyloireButton>
        </div>
      </div>

      <StyloirePanel className="mb-10">
        <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
          Stats
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            ["Emails sent", String(stats.sent)],
            ["Opened", String(stats.opened)],
            ["Responded", String(stats.responded)],
            ["No response", String(stats.noResponse)]
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-serif text-3xl text-styloire-champagneLight">{value}</p>
              <p className="mt-1 font-sans text-xs uppercase tracking-wide text-styloire-inkMuted">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-end gap-3">
          <label className="space-y-2">
            <span className="font-sans text-xs uppercase tracking-styloireWide text-styloire-inkMuted">
              Follow-up date
            </span>
            <input
              type="date"
              value={followupDate}
              onChange={(event) => setFollowupDate(event.target.value)}
              className="border border-styloire-lineSubtle bg-transparent px-3 py-2 font-sans text-sm text-styloire-ink focus:border-styloire-champagne/60 focus:outline-none"
            />
          </label>
          <StyloireButton
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => saveFollowupDate(followupDate || null)}
          >
            Save date
          </StyloireButton>
          <StyloireButton
            type="button"
            variant="outline"
            disabled={busy || !requestState.followup_date}
            onClick={() => {
              setFollowupDate("");
              void saveFollowupDate(null);
            }}
          >
            Cancel date
          </StyloireButton>
        </div>
        {note ? <p className="mt-4 font-sans text-xs text-styloire-inkSoft">{note}</p> : null}
      </StyloirePanel>

      <StyloirePanel>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-xl text-styloire-champagne">Contacts</h2>
          <Link
            href="/dashboard"
            className="font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-inkSoft underline-offset-4 hover:text-styloire-ink hover:underline"
          >
            Back to existing requests
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-styloire-lineSubtle font-sans text-[0.65rem] uppercase tracking-styloireWide text-styloire-inkMuted">
                <th className="pb-3 pr-4">Brand</th>
                <th className="pb-3 pr-4">Contact</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Responded</th>
              </tr>
            </thead>
            <tbody className="font-sans font-light text-styloire-inkSoft">
              {contactRows.map((row) => (
                <tr key={row.id} className="border-b border-styloire-lineSubtle">
                  <td className="py-4 pr-4 text-styloire-ink">{row.brand_name}</td>
                  <td className="py-4 pr-4">{row.contact_name ?? "—"}</td>
                  <td className="py-4 pr-4">{row.email}</td>
                  <td className="py-4 pr-4">{contactStatus(row)}</td>
                  <td className="py-4 text-right">
                    <input
                      type="checkbox"
                      checked={row.responded}
                      onChange={(event) => toggleResponded(row.id, event.target.checked)}
                      className="h-4 w-4"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StyloirePanel>
    </>
  );
}
