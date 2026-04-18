"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import type { ConnectedAccount } from "@/lib/styloire/types";

type Props = {
  defaultName: string;
  defaultEmail: string;
  connected: string | null;
  emailError: string | null;
};

type SmtpForm = {
  host: string;
  port: string;
  username: string;
  password: string;
  fromEmail: string;
  displayName: string;
  secure: boolean;
};

const emptySmtp: SmtpForm = {
  host: "",
  port: "587",
  username: "",
  password: "",
  fromEmail: "",
  displayName: "",
  secure: false,
};

export function SettingsManager({
  defaultName,
  defaultEmail,
  connected,
  emailError,
}: Props) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [ccInput, setCcInput] = useState("");
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [smtpOpen, setSmtpOpen] = useState(false);
  const [smtp, setSmtp] = useState<SmtpForm>({
    ...emptySmtp,
    fromEmail: defaultEmail,
    displayName: defaultName,
  });
  const [note, setNote] = useState("");

  const activeAccount = useMemo(
    () => accounts.find((a) => a.is_sending_active) ?? null,
    [accounts],
  );

  async function loadAll() {
    const [accRes, ccRes] = await Promise.all([
      fetch("/api/email/accounts"),
      fetch("/api/settings/cc-emails"),
    ]);
    const accData = (await accRes.json().catch(() => ({}))) as {
      accounts?: ConnectedAccount[];
      error?: string;
    };
    const ccData = (await ccRes.json().catch(() => ({}))) as {
      emails?: string[];
      error?: string;
    };
    if (accRes.ok) setAccounts(accData.accounts ?? []);
    if (ccRes.ok) setCcEmails(ccData.emails ?? []);
    if (!accRes.ok) setNote(accData.error ?? "Could not load connected accounts.");
    if (!ccRes.ok) setNote(ccData.error ?? "Could not load CC addresses.");
  }

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (connected) {
      setNote(`Connected ${connected} account. Run test send before setting active.`);
    } else if (emailError) {
      setNote(`Connection error: ${emailError}`);
    }
  }, [connected, emailError]);

  async function saveCc() {
    setBusy(true);
    setNote("");
    const response = await fetch("/api/settings/cc-emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: ccEmails }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setNote(data.error ?? "Could not save CC emails.");
      return;
    }
    setNote("CC emails saved.");
  }

  function addCcEmail() {
    const next = ccInput.trim().toLowerCase();
    if (!next || !next.includes("@")) return;
    if (ccEmails.includes(next)) {
      setCcInput("");
      return;
    }
    setCcEmails((prev) => [...prev, next]);
    setCcInput("");
  }

  async function connectSmtp() {
    setBusy(true);
    setNote("");
    const response = await fetch("/api/email/connect/smtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: smtp.host.trim(),
        port: Number(smtp.port),
        username: smtp.username.trim(),
        password: smtp.password,
        fromEmail: smtp.fromEmail.trim().toLowerCase(),
        displayName: smtp.displayName.trim() || null,
        secure: smtp.secure,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      error?: string;
    };
    setBusy(false);
    if (!response.ok || !data.id) {
      setNote(data.error ?? "Could not add SMTP account.");
      return;
    }
    setNote("SMTP account saved. Run test send before marking active.");
    setSmtpOpen(false);
    setSmtp((prev) => ({ ...emptySmtp, fromEmail: prev.fromEmail, displayName: prev.displayName }));
    await loadAll();
  }

  async function testConnection(accountId: string) {
    setBusy(true);
    setNote("");
    const response = await fetch("/api/email/test-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setNote(data.error ?? "Connection test failed.");
      return;
    }
    setNote("Test send succeeded. You can now set this account active.");
    await loadAll();
  }

  async function setActive(accountId: string) {
    setBusy(true);
    setNote("");
    const response = await fetch("/api/email/set-active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setNote(data.error ?? "Could not set active account.");
      return;
    }
    setNote("Active sending account updated.");
    await loadAll();
  }

  async function disconnect(accountId: string) {
    setBusy(true);
    setNote("");
    const response = await fetch("/api/email/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setNote(data.error ?? "Could not disconnect account.");
      return;
    }
    setNote("Account disconnected.");
    await loadAll();
  }

  return (
    <div className="grid gap-8">
      <StyloirePanel>
        <h2 className="font-serif text-xl text-styloire-champagne">Profile</h2>
        <dl className="mt-6 space-y-4 font-sans text-sm font-light text-styloire-inkSoft">
          <div>
            <dt className="text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
              Name
            </dt>
            <dd className="mt-1 text-styloire-ink">{defaultName}</dd>
          </div>
          <div>
            <dt className="text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
              Email
            </dt>
            <dd className="mt-1 text-styloire-ink">{defaultEmail}</dd>
          </div>
        </dl>
      </StyloirePanel>

      <StyloirePanel>
        <h2 className="font-serif text-xl text-styloire-champagne">Connected email account</h2>
        <p className="mt-4 font-sans text-sm font-light text-styloire-inkSoft">
          Sending account status:{" "}
          <span className="text-styloire-ink">
            {activeAccount
              ? `Connected (${activeAccount.provider})`
              : "Disconnected"}
          </span>
        </p>
        {activeAccount ? (
          <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
            From address: <span className="text-styloire-ink">{activeAccount.email}</span>
          </p>
        ) : null}
        <p className="mt-2 font-sans text-sm font-light text-styloire-inkSoft">
          Connect Gmail, Outlook, or SMTP before sending any request.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <StyloireButton
            type="button"
            variant="solid"
            disabled={busy}
            onClick={() => {
              window.location.href = "/api/email/connect/google";
            }}
          >
            Connect Gmail
          </StyloireButton>
          <StyloireButton
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => {
              window.location.href = "/api/email/connect/microsoft";
            }}
          >
            Connect Outlook
          </StyloireButton>
          <StyloireButton
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => setSmtpOpen((v) => !v)}
          >
            Configure SMTP
          </StyloireButton>
        </div>

        {smtpOpen ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <input
              value={smtp.host}
              onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))}
              placeholder="SMTP host"
              className="w-full border border-styloire-lineSubtle bg-transparent px-4 py-2 font-sans text-sm text-styloire-ink"
            />
            <input
              value={smtp.port}
              onChange={(e) => setSmtp((s) => ({ ...s, port: e.target.value }))}
              placeholder="Port (587 or 465)"
              className="w-full border border-styloire-lineSubtle bg-transparent px-4 py-2 font-sans text-sm text-styloire-ink"
            />
            <input
              value={smtp.username}
              onChange={(e) => setSmtp((s) => ({ ...s, username: e.target.value }))}
              placeholder="SMTP username"
              className="w-full border border-styloire-lineSubtle bg-transparent px-4 py-2 font-sans text-sm text-styloire-ink"
            />
            <input
              type="password"
              value={smtp.password}
              onChange={(e) => setSmtp((s) => ({ ...s, password: e.target.value }))}
              placeholder="SMTP password"
              className="w-full border border-styloire-lineSubtle bg-transparent px-4 py-2 font-sans text-sm text-styloire-ink"
            />
            <input
              value={smtp.fromEmail}
              onChange={(e) => setSmtp((s) => ({ ...s, fromEmail: e.target.value }))}
              placeholder="From email"
              className="w-full border border-styloire-lineSubtle bg-transparent px-4 py-2 font-sans text-sm text-styloire-ink"
            />
            <input
              value={smtp.displayName}
              onChange={(e) => setSmtp((s) => ({ ...s, displayName: e.target.value }))}
              placeholder="Display name (optional)"
              className="w-full border border-styloire-lineSubtle bg-transparent px-4 py-2 font-sans text-sm text-styloire-ink"
            />
            <label className="col-span-2 inline-flex items-center gap-2 font-sans text-sm text-styloire-inkSoft">
              <input
                type="checkbox"
                checked={smtp.secure}
                onChange={(e) => setSmtp((s) => ({ ...s, secure: e.target.checked }))}
              />
              Use SSL/TLS (`secure`)
            </label>
            <div className="col-span-2">
              <StyloireButton type="button" variant="solid" disabled={busy} onClick={connectSmtp}>
                Save SMTP account
              </StyloireButton>
            </div>
          </div>
        ) : null}

        <div className="mt-8 space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-sm border border-styloire-lineSubtle px-4 py-4"
            >
              <p className="font-sans text-sm text-styloire-ink">
                {account.provider.toUpperCase()} — {account.email}
              </p>
              <p className="mt-1 font-sans text-xs text-styloire-inkMuted">
                Status: {account.status}
                {account.is_sending_active ? " • Active sender" : ""}
                {account.last_error_message ? ` • ${account.last_error_message}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StyloireButton
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => testConnection(account.id)}
                >
                  Test send
                </StyloireButton>
                <StyloireButton
                  type="button"
                  variant="solid"
                  disabled={busy}
                  onClick={() => setActive(account.id)}
                >
                  Set active
                </StyloireButton>
                <StyloireButton
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => disconnect(account.id)}
                >
                  Disconnect
                </StyloireButton>
              </div>
            </div>
          ))}
        </div>
      </StyloirePanel>

      <StyloirePanel>
        <h2 className="font-serif text-xl text-styloire-champagne">CC email addresses</h2>
        <p className="mt-4 font-sans text-sm font-light text-styloire-inkSoft">
          These addresses are copied on every outbound email.
        </p>
        <div className="mt-6 space-y-3">
          {ccEmails.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between gap-3 border border-styloire-lineSubtle px-4 py-2"
            >
              <span className="font-sans text-sm text-styloire-ink">{email}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => setCcEmails((prev) => prev.filter((x) => x !== email))}
                className="font-sans text-xs uppercase tracking-wide text-styloire-inkMuted hover:text-styloire-ink"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-3">
            <input
              value={ccInput}
              onChange={(e) => setCcInput(e.target.value)}
              placeholder="Add another CC email"
              className="w-full border border-styloire-lineSubtle bg-transparent px-4 py-2 font-sans text-sm text-styloire-ink"
            />
            <StyloireButton type="button" variant="outline" disabled={busy} onClick={addCcEmail}>
              Add
            </StyloireButton>
          </div>
        </div>
        <StyloireButton type="button" variant="outline" className="mt-6" disabled={busy} onClick={saveCc}>
          Save CC list
        </StyloireButton>
      </StyloirePanel>

      <StyloirePanel>
        <h2 className="font-serif text-xl text-styloire-champagne">Subscription</h2>
        <p className="mt-4 font-sans text-sm font-light text-styloire-inkSoft">
          Plan: <span className="text-styloire-ink">Styloire Pro — $20/month</span>
          <br />
          Status: <span className="uppercase tracking-wide text-styloire-ink">ACTIVE</span>
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <StyloireButton type="button" variant="solid" disabled>
            Open billing portal
          </StyloireButton>
          <StyloireButton type="button" variant="outline" disabled>
            Cancel subscription
          </StyloireButton>
        </div>
      </StyloirePanel>

      {note ? (
        <p className="font-sans text-xs text-styloire-inkSoft">{note}</p>
      ) : null}
    </div>
  );
}
