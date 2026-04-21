"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ConnectedAccount } from "@/lib/styloire/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

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
  subscriptionStatus: string;
  hasStripeCustomer: boolean;
  checkoutSuccessPath?: string;
  checkoutCancelPath?: string;
  emailReturnPath?: string;
  onboardingMode?: boolean;
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
  secure: false
};

export function SettingsManager({
  defaultName,
  defaultEmail,
  connected,
  emailError,
  subscriptionStatus,
  hasStripeCustomer,
  checkoutSuccessPath = "/settings?checkout=success",
  checkoutCancelPath = "/settings?checkout=cancelled",
  emailReturnPath = "/settings",
  onboardingMode = false
}: Props) {
  const router = useRouter();

  // ── Data state ────────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [ccInput, setCcInput] = useState("");
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [smtpOpen, setSmtpOpen] = useState(false);
  const [smtp, setSmtp] = useState<SmtpForm>({
    ...emptySmtp,
    fromEmail: defaultEmail,
    displayName: defaultName
  });
  const [note, setNote] = useState("");

  // ── Per-action busy flags ─────────────────────────────────────────────────
  const [busy, setBusy] = useState(false);          // general email/CC actions
  const [pwBusy, setPwBusy] = useState(false);      // password reset
  const [checkoutBusy, setCheckoutBusy] = useState(false); // subscription checkout
  const [portalBusy, setPortalBusy] = useState(false);     // billing portal
  const [cancelBusy, setCancelBusy] = useState(false);     // cancel subscription
  const [cancelConfirm, setCancelConfirm] = useState(false); // confirm step

  // ── Profile editing ───────────────────────────────────────────────────────
  const [editingProfile, setEditingProfile] = useState<"name" | "email" | null>(null);
  const [nameInput, setNameInput] = useState(defaultName);
  const [emailInput, setEmailInput] = useState(defaultEmail);
  const [profileSaving, setProfileSaving] = useState(false);

  const activeAccount = useMemo(
    () => accounts.find((a) => a.is_sending_active) ?? null,
    [accounts]
  );

  const isActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  // ── Data loading ──────────────────────────────────────────────────────────
  async function loadAll() {
    const [accRes, ccRes] = await Promise.all([
      fetch("/api/email/accounts"),
      fetch("/api/settings/cc-emails")
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

  // ── CC helpers ────────────────────────────────────────────────────────────
  async function saveCc() {
    setBusy(true);
    setNote("");
    const response = await fetch("/api/settings/cc-emails", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: ccEmails })
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
    if (ccEmails.includes(next)) { setCcInput(""); return; }
    setCcEmails((prev) => [...prev, next]);
    setCcInput("");
  }

  // ── Email account helpers ─────────────────────────────────────────────────
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
        secure: smtp.secure
      })
    });
    const data = (await response.json().catch(() => ({}))) as { id?: string; error?: string };
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
      body: JSON.stringify({ accountId })
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
      body: JSON.stringify({ accountId })
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
      body: JSON.stringify({ accountId })
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

  // ── Password / magic-link reset ───────────────────────────────────────────
  async function sendLoginLink() {
    if (!defaultEmail) return;
    setPwBusy(true);
    setNote("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: defaultEmail,
        options: {
          shouldCreateUser: false
        }
      });
      if (error) {
        setNote(`Could not send login link: ${error.message}`);
      } else {
        setNote(`Login link sent to ${defaultEmail}. Check your inbox.`);
      }
    } catch {
      setNote("Could not send login link. Please try again.");
    } finally {
      setPwBusy(false);
    }
  }

  // ── Profile save: name ───────────────────────────────────────────────────
  async function saveProfileName() {
    const name = nameInput.trim();
    if (!name) { setNote("Name cannot be empty."); return; }
    setProfileSaving(true);
    setNote("");
    try {
      const supabase = createBrowserSupabaseClient();
      // 1. Update Supabase auth user_metadata (what the server component reads)
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (authErr) { setNote(`Error: ${authErr.message}`); return; }

      // 2. Sync to the public users table
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setNote(d.error ?? "Profile update failed.");
        return;
      }
      setNote("Display name updated.");
      setEditingProfile(null);
      router.refresh(); // re-run server component so header reflects new name
    } catch {
      setNote("Network error — please try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Profile save: email ───────────────────────────────────────────────────
  async function saveProfileEmail() {
    const email = emailInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNote("Enter a valid email address.");
      return;
    }
    if (email === defaultEmail.toLowerCase()) {
      setEditingProfile(null);
      return;
    }
    setProfileSaving(true);
    setNote("");
    try {
      const supabase = createBrowserSupabaseClient();
      // Supabase sends a confirmation link to both old and new addresses.
      // The email is NOT changed until both addresses confirm.
      const { error } = await supabase.auth.updateUser({ email });
      if (error) { setNote(`Error: ${error.message}`); return; }
      setNote(
        `Confirmation emails sent to ${defaultEmail} and ${email}. ` +
        "Your email will only change after both links are clicked."
      );
      setEditingProfile(null);
    } catch {
      setNote("Network error — please try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Stripe checkout ────────────────────────────────────────────────────────
  async function startCheckout() {
    setCheckoutBusy(true);
    setNote("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          successPath: checkoutSuccessPath,
          cancelPath: checkoutCancelPath
        })
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setNote(data.error ?? "Could not start subscription checkout.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setNote("Network error — could not start subscription checkout.");
    } finally {
      setCheckoutBusy(false);
    }
  }

  // ── Billing portal ────────────────────────────────────────────────────────
  async function openBillingPortal(flow?: "cancel") {
    const setter = flow === "cancel" ? setCancelBusy : setPortalBusy;
    setter(true);
    setNote("");
    setCancelConfirm(false);

    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow: flow ?? null })
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setNote(data.error ?? "Could not open billing portal.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setNote("Network error — could not open billing portal.");
    } finally {
      setter(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[44rem] space-y-5">

      {/* ── STATUS NOTE ─────────────────────────────────────────────────── */}
      {note ? (
        <div
          className={`flex items-start gap-3 rounded-[0.55rem] border px-4 py-3 font-sans text-[0.8rem] leading-relaxed ${
            note.toLowerCase().includes("error") ||
            note.toLowerCase().includes("fail") ||
            note.toLowerCase().includes("could not") ||
            note.toLowerCase().includes("invalid")
              ? "border-red-400/28 bg-red-500/10 text-red-300"
              : "border-emerald-400/28 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          <span className="flex-1">{note}</span>
          <button
            type="button"
            onClick={() => setNote("")}
            className="shrink-0 font-semibold leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ) : null}

      {/* ══ PROFILE ═════════════════════════════════════════════════════ */}
      <div className={cardCls}>
        <div className="px-5 py-4">
          <p className={labelCls}>Profile</p>
        </div>
        {/* Name row */}
        <div className={rowCls}>
          {editingProfile === "name" ? (
            <div>
              <p className={labelCls + " mb-2"}>Name</p>
              <div className="flex items-center gap-2.5">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void saveProfileName(); } if (e.key === "Escape") setEditingProfile(null); }}
                  autoFocus
                  className={inputCls}
                />
                <button type="button" disabled={profileSaving} onClick={saveProfileName} className={smSolidBtn + " shrink-0"}>
                  {profileSaving ? "Saving…" : "Save"}
                </button>
                <button type="button" disabled={profileSaving} onClick={() => { setNameInput(defaultName); setEditingProfile(null); }} className={smActionBtn + " shrink-0"}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={labelCls + " mb-1"}>Name</p>
                <p className="font-sans text-[0.9rem] text-styloire-champagneLight">{defaultName}</p>
              </div>
              <button type="button" onClick={() => { setNameInput(defaultName); setEditingProfile("name"); }} className={smActionBtn + " shrink-0"}>
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Email row */}
        <div className={rowCls}>
          {editingProfile === "email" ? (
            <div>
              <p className={labelCls + " mb-2"}>Email</p>
              <div className="flex items-center gap-2.5">
                <input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void saveProfileEmail(); } if (e.key === "Escape") setEditingProfile(null); }}
                  type="email"
                  autoFocus
                  className={inputCls}
                />
                <button type="button" disabled={profileSaving} onClick={saveProfileEmail} className={smSolidBtn + " shrink-0"}>
                  {profileSaving ? "Sending…" : "Update"}
                </button>
                <button type="button" disabled={profileSaving} onClick={() => { setEmailInput(defaultEmail); setEditingProfile(null); }} className={smActionBtn + " shrink-0"}>
                  Cancel
                </button>
              </div>
              <p className="mt-2 font-sans text-[0.72rem] text-white/38">
                A confirmation link is sent to both addresses. Your email only changes after both are clicked.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={labelCls + " mb-1"}>Email</p>
                <p className="font-sans text-[0.9rem] text-styloire-champagneLight">{defaultEmail}</p>
              </div>
              <button type="button" onClick={() => { setEmailInput(defaultEmail); setEditingProfile("email"); }} className={smActionBtn + " shrink-0"}>
                Edit
              </button>
            </div>
          )}
        </div>
        <div className={rowCls}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={labelCls + " mb-1"}>Login link</p>
              <p className="font-sans text-[0.8rem] text-white/42">
                Send a one-time login link to your email whenever you need to re-authenticate.
              </p>
            </div>
            <button
              type="button"
              onClick={sendLoginLink}
              disabled={pwBusy}
              className={smActionBtn + " shrink-0"}
            >
              {pwBusy ? "Sending…" : "Send link"}
            </button>
          </div>
        </div>
        <div className={rowCls}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={labelCls + " mb-1"}>Sign out</p>
              <p className="font-sans text-[0.8rem] text-white/42">
                End your current session and return to the login screen.
              </p>
            </div>
            <form action="/auth/logout" method="post">
              <button type="submit" className={smDangerBtn + " shrink-0"}>
                Sign out
              </button>
            </form>
          </div>
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
              onClick={() => { window.location.href = `/api/email/connect/google?next=${encodeURIComponent(emailReturnPath)}`; }}
              className={smSolidBtn}
            >
              Connect Gmail
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => { window.location.href = `/api/email/connect/microsoft?next=${encodeURIComponent(emailReturnPath)}`; }}
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
                  {busy ? "Saving…" : "Save SMTP account"}
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
                      {account.is_sending_active ? " · Active sender" : ` · ${account.status}`}
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
          <div className="flex items-center gap-2.5">
            <input
              value={ccInput}
              onChange={(e) => setCcInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCcEmail();
                }
              }}
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

        <div className={rowCls}>
          <button type="button" disabled={busy} onClick={saveCc} className={smSolidBtn}>
            {busy ? "Saving…" : "Save CC list"}
          </button>
        </div>
      </div>

      {/* ══ SUBSCRIPTION ════════════════════════════════════════════════ */}
      <div className={cardCls}>
        <div className="flex items-center justify-between px-5 py-4">
          <p className={labelCls}>Subscription</p>
          <span
            className={`rounded-full border px-2.5 py-0.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
              isActive
                ? "border-emerald-400/38 bg-emerald-500/12 text-emerald-300"
                : "border-white/18 bg-white/6 text-white/40"
            }`}
          >
            {isActive ? subscriptionStatus : subscriptionStatus === "unknown" ? "—" : subscriptionStatus}
          </span>
        </div>
        <div className={rowCls}>
          <p className={labelCls + " mb-1"}>Plan</p>
          <p className="font-sans text-[0.9rem] text-styloire-champagneLight">
            Styloire — $30/month
          </p>
          <p className="mt-0.5 font-sans text-[0.75rem] text-white/40">
            No tiers, no usage limits. Cancel anytime.
          </p>
        </div>

        {/* Cancel confirmation inline */}
        {cancelConfirm ? (
          <div className="border-t border-red-400/18 bg-red-500/[0.04] px-5 py-4">
            <p className="mb-3 font-sans text-[0.82rem] text-white/60">
              This will open the Stripe billing portal where you can confirm cancellation. Your
              access continues until the end of your current billing period.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={cancelBusy}
                onClick={() => openBillingPortal("cancel")}
                className={smDangerBtn + " border-red-400/30 bg-red-500/12 text-red-300 hover:bg-red-500/22"}
              >
                {cancelBusy ? "Redirecting…" : "Yes, continue to cancel"}
              </button>
              <button
                type="button"
                onClick={() => setCancelConfirm(false)}
                className={smActionBtn}
              >
                Keep subscription
              </button>
            </div>
          </div>
        ) : null}

        <div className={rowCls + " flex flex-wrap gap-2"}>
          {!isActive ? (
            <button
              type="button"
              disabled={checkoutBusy}
              onClick={startCheckout}
              className={smSolidBtn}
            >
              {checkoutBusy ? "Redirecting…" : onboardingMode ? "Start subscription" : "Subscribe now"}
            </button>
          ) : null}
          <button
            type="button"
            disabled={portalBusy || !hasStripeCustomer}
            onClick={() => openBillingPortal()}
            className={smActionBtn}
            title={!hasStripeCustomer ? "No billing account linked to this user." : undefined}
          >
            {portalBusy ? "Redirecting…" : "Open billing portal"}
          </button>
          <button
            type="button"
            disabled={cancelBusy || !hasStripeCustomer || cancelConfirm}
            onClick={() => setCancelConfirm(true)}
            className={smDangerBtn}
            title={!hasStripeCustomer ? "No billing account linked to this user." : undefined}
          >
            Cancel subscription
          </button>
        </div>
      </div>

    </div>
  );
}
