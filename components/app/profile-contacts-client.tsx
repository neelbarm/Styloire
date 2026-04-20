"use client";

import { ChangeEvent, useRef, useState } from "react";
import type { BrandContact } from "@/lib/styloire/types";
import { parseBrandContactsFileDetailed } from "@/lib/styloire/parse-contacts";
import type { ImportResult } from "@/app/api/brand-contacts/import/route";

// ─── Style tokens ─────────────────────────────────────────────────────────────
const labelCls =
  "font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/48";
// Full-size input for the add-contact form and toolbar
const inputCls =
  "w-full rounded-full border border-white/28 bg-white/10 px-5 py-3 font-sans text-[0.95rem] text-styloire-champagneLight placeholder:text-white/42 focus:border-white/42 focus:outline-none transition-colors duration-styloire";
// Compact input for inside table edit rows — keeps row height stable
const cellInputCls =
  "w-full rounded-[0.35rem] border border-white/18 bg-black/10 px-2.5 py-2 font-sans text-[0.82rem] text-styloire-champagneLight placeholder:text-white/32 focus:border-white/30 focus:outline-none transition-colors duration-styloire";
const thCls =
  "px-5 py-4 text-left font-sans text-[0.8rem] font-medium text-white/78";
const tdCls = "px-5 py-4 font-sans text-[0.92rem] text-white/78 align-middle";
const smBtn =
  "rounded-full border border-white/28 bg-white/16 px-4 py-1.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white/78 transition-colors hover:border-white/40 hover:bg-white/20 hover:text-white disabled:opacity-40";
const dangerBtn =
  "rounded-full border border-white/20 bg-transparent px-4 py-1.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white/52 transition-colors hover:border-red-400/28 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40";
const solidBtn =
  "rounded-full border border-white/32 bg-white/20 px-4 py-1.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/28 disabled:opacity-40";

type EditForm = { brand_name: string; contact_name: string; email: string };

type Props = {
  profileId: string;
  initialContacts: BrandContact[];
};

export function ProfileContactsClient({ profileId, initialContacts }: Props) {
  // ── Contacts — local state, initially from server props ──────────────────
  const [contacts, setContacts] = useState<BrandContact[]>(initialContacts);

  // ── Search ────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const filtered = contacts.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.brand_name.toLowerCase().includes(q) ||
      (c.contact_name ?? "").toLowerCase().includes(q)
    );
  });

  // ── Inline edit ───────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    brand_name: "",
    contact_name: "",
    email: ""
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  function startEdit(c: BrandContact) {
    setConfirmDeleteId(null);
    setEditError("");
    setEditingId(c.id);
    setEditForm({
      brand_name: c.brand_name,
      contact_name: c.contact_name ?? "",
      email: c.email
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setEditSaving(true);
    setEditError("");

    // Optimistic update
    const prev = contacts;
    setContacts((cs) =>
      cs.map((c) =>
        c.id === editingId
          ? {
              ...c,
              brand_name: editForm.brand_name.trim().toUpperCase() || c.brand_name,
              contact_name: editForm.contact_name.trim() || null,
              email: editForm.email.trim().toLowerCase() || c.email,
              updated_at: new Date().toISOString()
            }
          : c
      )
    );

    try {
      const res = await fetch(`/api/brand-contacts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: editForm.brand_name,
          email: editForm.email,
          contact_name: editForm.contact_name || null
        })
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setContacts(prev); // revert
        setEditError((json as { error?: string }).error ?? "Save failed.");
        return;
      }
      setEditingId(null);
    } catch {
      setContacts(prev);
      setEditError("Network error — please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  // ── Delete confirmation ───────────────────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  function openDeleteConfirm(id: string) {
    setEditingId(null);
    setDeleteError("");
    setConfirmDeleteId(id);
  }

  async function executeDelete(id: string) {
    setDeletingId(id);
    setDeleteError("");

    // Optimistic remove
    const prev = contacts;
    setContacts((cs) => cs.filter((c) => c.id !== id));
    setConfirmDeleteId(null);

    try {
      const res = await fetch(`/api/brand-contacts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setContacts(prev); // revert
        setDeleteError((json as { error?: string }).error ?? "Delete failed.");
      }
    } catch {
      setContacts(prev);
      setDeleteError("Network error — please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Add contact ───────────────────────────────────────────────────────────
  const [newBrand, setNewBrand] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  async function addContact() {
    const brand = newBrand.trim();
    const email = newEmail.trim();
    if (!brand || !email) { setAddError("Brand name and email are required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAddError("Invalid email address."); return; }
    if (contacts.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
      setAddError("This email already exists.");
      return;
    }

    setAddSaving(true);
    setAddError("");

    try {
      const res = await fetch("/api/brand-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          brand_name: brand,
          email,
          contact_name: newContact.trim() || null
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddError((json as { error?: string }).error ?? "Failed to add contact.");
        return;
      }
      const { contact } = json as { contact: BrandContact };
      setContacts((cs) => [...cs, contact]);
      setNewBrand("");
      setNewContact("");
      setNewEmail("");
    } catch {
      setAddError("Network error — please try again.");
    } finally {
      setAddSaving(false);
    }
  }

  // ── CSV / XLSX upload ─────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadNote, setUploadNote] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadNote(null);

    // Parse on the client (handles both CSV and XLSX via the existing parser)
    const parsed = await parseBrandContactsFileDetailed(file);
    e.currentTarget.value = "";

    if (parsed.errors.length > 0 && parsed.contacts.length === 0) {
      setUploadNote({ type: "err", text: parsed.errors[0] });
      setUploading(false);
      return;
    }

    // POST parsed contacts to server for ownership verification + DB insert
    try {
      const res = await fetch("/api/brand-contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profileId, contacts: parsed.contacts })
      });
      const json = (await res.json().catch(() => ({}))) as ImportResult & { error?: string };

      if (!res.ok) {
        setUploadNote({ type: "err", text: json.error ?? "Import failed." });
        return;
      }

      // Merge newly inserted contacts into local state (already deduplicated by server)
      if (json.contacts.length > 0) {
        setContacts((cs) => [...cs, ...json.contacts]);
      }

      const parts: string[] = [];
      if (json.added > 0) parts.push(`${json.added} contact${json.added !== 1 ? "s" : ""} added`);
      if (json.skipped > 0)
        parts.push(`${json.skipped} duplicate${json.skipped !== 1 ? "s" : ""} skipped`);
      if (json.errors.length > 0)
        parts.push(`${json.errors.length} row error${json.errors.length !== 1 ? "s" : ""}`);

      const hasOnlyErrors = json.added === 0 && json.errors.length > 0;
      setUploadNote({
        type: hasOnlyErrors ? "err" : "ok",
        text: parts.join(" · ") || "Nothing to import."
      });
    } catch {
      setUploadNote({ type: "err", text: "Network error — please try again." });
    } finally {
      setUploading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mt-5 space-y-5">

      {/* ── FEEDBACK BANNERS (delete errors, edit errors, upload results) ── */}
      {(deleteError || editError) ? (
        <div className="flex items-start gap-2.5 rounded-[0.45rem] border border-red-400/28 bg-red-500/10 px-3.5 py-2.5 font-sans text-[0.78rem] text-red-300">
          <span className="flex-1">{deleteError || editError}</span>
          <button
            type="button"
            onClick={() => { setDeleteError(""); setEditError(""); }}
            className="shrink-0 font-semibold leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ) : null}

      {uploadNote ? (
        <div
          className={`flex items-start gap-2.5 rounded-[0.45rem] border px-3.5 py-2.5 font-sans text-[0.78rem] ${
            uploadNote.type === "ok"
              ? "border-emerald-400/28 bg-emerald-500/10 text-emerald-300"
              : "border-red-400/28 bg-red-500/10 text-red-300"
          }`}
        >
          <span className="flex-1">{uploadNote.text}</span>
          <button
            type="button"
            onClick={() => setUploadNote(null)}
            className="shrink-0 font-semibold leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ) : null}

      {/* ── TOOLBAR: Search + Upload ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brand or contact name..."
          className={inputCls + " flex-1"}
        />
        <label
          className={`${smBtn} inline-flex cursor-pointer items-center justify-center whitespace-nowrap ${
            uploading ? "pointer-events-none opacity-40" : ""
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? "Uploading…" : "Upload CSV / XLSX"}
        </label>
      </div>

      {/* ── CONTACTS TABLE ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[0.15rem] border border-white/24 bg-transparent">
        <div className="overflow-x-auto">
          {/* table-fixed + explicit col widths prevent column shifts on edit/delete */}
          <table className="w-full min-w-[560px] table-fixed text-left">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[22%]" />
              <col className="w-[32%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/18 bg-white/[0.02]">
                <th className={thCls}>Brand</th>
                <th className={thCls}>PR Contact</th>
                <th className={thCls}>Email</th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/14">
              {filtered.map((c) => {
                const isEditing = editingId === c.id;
                const isConfirming = confirmDeleteId === c.id;
                const isDeleting = deletingId === c.id;

                if (isEditing) {
                  return (
                    <tr key={c.id} className="bg-white/[0.03]">
                      <td className={tdCls}>
                        <input
                          value={editForm.brand_name}
                          onChange={(e) => setEditForm((f) => ({ ...f, brand_name: e.target.value }))}
                          className={cellInputCls}
                          autoFocus
                        />
                      </td>
                      <td className={tdCls}>
                        <input
                          value={editForm.contact_name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, contact_name: e.target.value }))
                          }
                          placeholder="Optional"
                          className={cellInputCls}
                        />
                      </td>
                      <td className={tdCls}>
                        <input
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          type="email"
                          className={cellInputCls}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void saveEdit(); } if (e.key === "Escape") cancelEdit(); }}
                        />
                      </td>
                      <td className={tdCls}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={editSaving}
                            className={solidBtn}
                          >
                            {editSaving ? "…" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={editSaving}
                            className={smBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (isConfirming) {
                  return (
                    <tr key={c.id} className="bg-red-500/[0.04]">
                      <td colSpan={3} className={tdCls + " text-[0.82rem] text-white/60"}>
                        Delete{" "}
                        <span className="font-semibold text-white/78">{c.brand_name}</span>?
                        {" "}This cannot be undone.
                      </td>
                      <td className={tdCls}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => executeDelete(c.id)}
                            className={dangerBtn + " border-red-400/30 bg-red-500/12 text-red-300 hover:bg-red-500/22"}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className={smBtn}
                          >
                            No
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={c.id}
                    className={`transition-colors duration-100 hover:bg-white/[0.025] ${
                      isDeleting ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                      <td className={tdCls + " font-medium uppercase tracking-[0.03em] truncate"}>
                      {c.brand_name}
                    </td>
                    <td className={tdCls + " truncate text-white/55"}>
                      {c.contact_name ?? <span className="text-white/24">—</span>}
                    </td>
                    <td className={tdCls + " truncate text-white/55"}>{c.email}</td>
                    <td className={tdCls}>
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => startEdit(c)} className={smBtn}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(c.id)}
                          className={dangerBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center font-sans text-[0.82rem] text-white/30"
                  >
                    {query
                      ? `No contacts matching "${query}".`
                      : "No contacts yet — add one below."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {contacts.length > 0 ? (
          <p className="border-t border-white/8 px-4 py-2.5 font-sans text-[0.72rem] text-white/28">
            {query
              ? `${filtered.length} of ${contacts.length} contacts`
              : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
          </p>
        ) : null}
      </div>

      {/* ── ADD CONTACT FORM ─────────────────────────────────────────── */}
      <div>
        {/* 2-col on mobile so inputs pair up; 3-col + auto button on sm+ */}
        <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:gap-3">
          <input
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="Brand Name"
            className={inputCls}
          />
          <input
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            placeholder="PR Contact (Optional)"
            className={inputCls}
          />
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email Address"
            type="email"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addContact();
              }
            }}
            className={inputCls + " col-span-2 sm:col-span-1"}
          />
          <button
            type="button"
            onClick={addContact}
            disabled={addSaving}
            className={solidBtn + " col-span-2 sm:col-span-1 justify-self-start sm:justify-self-auto"}
          >
            {addSaving ? "Adding…" : "Add"}
          </button>
        </div>
        {addError ? (
          <p className="mt-2 font-sans text-[0.75rem] text-red-300">{addError}</p>
        ) : null}
        <p className="mt-2 font-sans text-[0.72rem] text-white/28">
          CSV columns: <code className="text-white/42">Brand Name, Email Address, PR Contact Name</code>
        </p>
      </div>
    </div>
  );
}
