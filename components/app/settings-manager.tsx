"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StyloireButton } from "@/components/styloire/button";
import type { ConnectedAccount } from "@/lib/styloire/types";

// ─── Shared style tokens (matches wizard + roster) ───────────────────────────
const labelCls =
  "font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/48";
const inputCls =
  "w-full rounded-[0.55rem] border border-white/16 bg-black/12 px-3.5 py-2.5 font-sans text-[0.88rem] text-styloire-champagneLight placeholder:text-white/32 focus:border-white/30 focus:outline-none transition-colors duration-styloire";
const cardCls =
  "overflow-hidden rounded-[0.55rem] border border-white/12 bg-black/8";
const rowCls = "border-t border-white/8 px-5 py-4";
const smActionBtn =
  "rounded-full border border-white/20 bg-white/8 px-4 py-1.5 font-sans text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-white/72 transition-colors hover:border-white/34 hover:bg-white/14 hover:text-white/92 disabled:pointer-events-none disabled:opacity-35";
const smDangerBtn =
  "rounded-full border border-white/14 bg-transparent px-4 py-1.5 font-sans text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-white/44 transition-colors hover:border-red-400/28 hover:bg-red-500/10 hover:text-red-300 disabled:pointer-events-none disabled:opacity-35";
const smSolidBtn =
  "rounded-full border border-styloire-champagne/40 bg-styloire-champagne/90 px-4 py-1.5 font-sans text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-styloire-champagneFg transition-colors hover:bg-styloire-champagneLight disabled:pointer-events-none disabled:opacity-35";

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

export function SettingsManager({ defaultName, defaultEmail, connected, emailError }: Props) {
  const router = useRouter();

  // ── All state preserved exactly ──────────────────────────────────────────
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

  // ── All handlers preserved exactly ──────────────────────────────────────
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

  useEffect(() => { void loadAll(); }, []);

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
    if (!response.ok) { setNote(data.error ?? "Could not save CC emails."); return; }
    setNote("CC emails saved.");
  }

  function addCcEmail() {
    const next = ccInput.trim().toLowerCase();
    if (!next || !next.includes("@")) return;
    if (ccEmails.includes(next)) { setCcInput(""); return; }
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
    const data = (await response.json().catch(() => ({}))) as { id?: string; error?: string };
    setBusy(false);
    if (!response.ok || !data.id) { setNote(data.error ?? "Could not add SMTP account."); return; }
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
    if (!response.ok) { setNote(data.error ?? "Connection test failed."); return; }
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
    if (!response.ok) { setNote(data.error ?? "Could not set active account."); return; }
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
    if (!response.ok) { setNote(data.error ?? "Could not disconnect account."); return; }
    setNote("Account disconnected.");
    await loadAll();
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[44rem] space-y-5">

      {/* ── STATUS NOTE ─────────────────────────────────────────────────── */}
      {note ? (
        <div className={`rounded-[0.55rem] border px-4 py-3 font-sans text-[0.8rem] ${
          note.toLowerCase().includes("error") || note.toLowerCase().includes("fail")
            ? "border-red-400/28 bg-red-500/10 text-red-300"
            : "border-emerald-400/28 bg-emerald-500/10 text-emerald-300"
        }`}>
          {note}
        </div>
      ) : null}

      {/* ══ PROFILE ═════════════════════════════════════════════════════ */}
      <div className={cardCls}>
        <div className="px-5 py-4">
          <p className={labelCls}>Profile</p>
        </div>
        <div className={rowCls}>
          <p className={labelCls + " mb-1"}>Name</p>
          <p className="font-sans text-[0.9rem] text-styloire-champagneLight">{defaultName}</p>
        </div>
        <div className={rowCls}>
          <p className={labelCls + " mb-1"}>Email</p>
          <p className="font-sans text-[0.9rem] text-styloire-champagneLight">{defaultEmail}</p>
        </div>
        <div className={rowCls}>
          <p className={labelCls + " mb-1"}>Password</p>
          <p className="font-sans text-[0.82rem] text-white/40">
            Managed via your Supabase account. Use the magic link login to reset.
          </p>
        </div>
      </div>

      {/* ══ CONNECTED EMAIL ACCOUNT ═════════════════════════════════════ */}
      <div className={cardCls}>
        <div className="flex items-center justify-between px-5 py-4">
          <p className={labelCls}>Connected email account</p>
          {activeAccount ? (
            <span className="rounded-full border border-emerald-400/38 bg-emerald-500/12 px-2.5 py-0.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-emerald-300">
              Connected
            </span>
          ) : (
            <span className="rounded-full border border-white/18 bg-white/6 px-2.5 py-0.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white/40">
              Not connected
            </span>
          )}
        </div>

        {activeAccount ? (
          <div className={rowCls}>
            <p className={labelCls + " mb-1"}>Active sending account</p>
            <p className="font-sans text-[0.9rem] text-styloire-champagneLight">
              {activeAccount.email}
            </p>
            <p className="mt-0.5 font-sans text-[0.75rem] text-white/40 capitalize">
              via {activeAccount.provider}
            </p>
          </div>
        ) : (
          <div className={rowCls}>
            <p className="font-sans text-[0.82rem] text-white/45">
              Connect Gmail, Outlook, or SMTP before sending any request. Emails go out from your
              own address — not from a Styloire domain.
            </p>
          </div>
        )}

        {/* Connect buttons */}
        <div className={rowCls}>
          <p className={labelCls + " mb-3"}>Connect an account</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => { window.location.href = "/api/email/connect/google"; }}
              className={smSolidBtn}
            >
              Connect Gmail
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => { window.location.href = "/api/email/connect/microsoft"; }}
              className={smActionBtn}
            >
              Connect Outlook
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setSmtpOpen((v) => !v)}
              className={smActionBtn}
            >
              {smtpOpen ? "Cancel SMTP" : "Configure SMTP"}
            </button>
          </div>

          {/* SMTP form */}
          {smtpOpen ? (
            <div className="mt-4 grid gap-2.5 md:grid-cols-2">
              <input
                value={smtp.host}
                onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))}
                placeholder="SMTP host"
                className={inputCls}
              />
              <input
                value={smtp.port}
                onChange={(e) => setSmtp((s) => ({ ...s, port: e.target.value }))}
                placeholder="Port (587 or 465)"
                className={inputCls}
              />
              <input
                value={smtp.username}
                onChange={(e) => setSmtp((s) => ({ ...s, username: e.target.value }))}
                placeholder="SMTP username"
                className={inputCls}
              />
              <input
                type="password"
                value={smtp.password}
                onChange={(e) => setSmtp((s) => ({ ...s, password: e.target.value }))}
                placeholder="SMTP password"
                className={inputCls}
              />
              <input
                value={smtp.fromEmail}
                onChange={(e) => setSmtp((s) => ({ ...s, fromEmail: e.target.value }))}
                placeholder="From email address"
                className={inputCls}
              />
              <input
                value={smtp.displayName}
                onChange={(e) => setSmtp((s) => ({ ...s, displayName: e.target.value }))}
                placeholder="Display name (optional)"
                className={inputCls}
              />
              <label className="col-span-2 inline-flex items-center gap-2.5 font-sans text-[0.82rem] text-white/52">
                <input
                  type="checkbox"
                  checked={smtp.secure}
                  onChange={(e) => setSmtp((s) => ({ ...s, secure: e.target.checked }))}
                  className="accent-styloire-champagne"
                />
                Use SSL/TLS (port 465)
              </label>
              <div className="col-span-2 pt-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={connectSmtp}
                  className={smSolidBtn}
                >
                  Save SMTP account
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Existing accounts list */}
        {accounts.length > 0 ? (
          <div className={rowCls + " space-y-3"}>
            <p className={labelCls + " mb-1"}>All accounts</p>
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-[0.45rem] border border-white/10 bg-black/12 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-sans text-[0.88rem] font-medium text-styloire-champagneLight">
                      {account.email}
                    </p>
                    <p className="mt-0.5 font-sans text-[0.72rem] text-white/40 capitalize">
                      {account.provider}
                      {account.is_sending_active
                        ? " · Active sender"
                        : ` · ${account.status}`}
                    </p>
                    {account.last_error_message ? (
                      <p className="mt-0.5 font-sans text-[0.72rem] text-red-300/80">
                        {account.last_error_message}
                      </p>
                    ) : null}
                  </div>
                  {account.is_sending_active ? (
                    <span className="shrink-0 rounded-full border border-emerald-400/38 bg-emerald-500/12 px-2 py-0.5 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-emerald-300">
                      Active
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => testConnection(account.id)}
                    className={smActionBtn}
                  >
                    Test send
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setActive(account.id)}
                    className={smSolidBtn}
                  >
                    Set active
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => disconnect(account.id)}
                    className={smDangerBtn}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* ══ CC EMAIL ADDRESSES ══════════════════════════════════════════ */}
      <div className={cardCls}>
        <div className="px-5 py-4">
          <p className={labelCls}>CC email addresses</p>
          <p className="mt-1 font-sans text-[0.78rem] text-white/38">
            These addresses are copied on every outbound email — e.g. your styling assistant.
          </p>
        </div>

        {ccEmails.length > 0 ? (
          <div className={rowCls + " space-y-2"}>
            {ccEmails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between gap-3 rounded-[0.45rem] border border-white/10 bg-black/10 px-3.5 py-2.5"
              >
                <span className="font-sans text-[0.88rem] text-styloire-champagneLight">
                  {email}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setCcEmails((prev) => prev.filter((x) => x !== email))}
                  className={smDangerBtn}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className={rowCls}>
          <p className={labelCls + " mb-2"}>Add an address</p>
          <div className="flex gap-2.5">
            <input
              value={ccInput}
              onChange={(e) => setCcInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCcEmail(); } }}
              placeholder="colleague@example.com"
              type="email"
              className={inputCls}
            />
            <button
              type="button"
              disabled={busy}
              onClick={addCcEmail}
              className={smActionBtn + " shrink-0 px-5"}
            >
              Add
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          <button
            type="button"
            disabled={busy}
            onClick={saveCc}
            className={smSolidBtn}
          >
            Save CC list
          </button>
        </div>
      </div>

      {/* ══ SUBSCRIPTION ════════════════════════════════════════════════ */}
      <div className={cardCls}>
        <div className="flex items-center justify-between px-5 py-4">
          <p className={labelCls}>Subscription</p>
          <span className="rounded-full border border-emerald-400/38 bg-emerald-500/12 px-2.5 py-0.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-emerald-300">
            Active
          </span>
        </div>
        <div className={rowCls}>
          <p className={labelCls + " mb-1"}>Plan</p>
          <p className="font-sans text-[0.9rem] text-styloire-champagneLight">
            Styloire — $20/month
          </p>
          <p className="mt-0.5 font-sans text-[0.75rem] text-white/40">
            No tiers, no usage limits. Cancel anytime.
          </p>
        </div>
        <div className={rowCls + " flex flex-wrap gap-2"}>
          <button
            type="button"
            disabled
            className={smActionBtn}
          >
            Open billing portal
          </button>
          <button
            type="button"
            disabled
            className={smDangerBtn}
          >
            Cancel subscription
          </button>
        </div>
      </div>

    </div>
  );
}
