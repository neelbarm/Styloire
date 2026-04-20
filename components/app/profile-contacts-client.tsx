"use client";

import { ChangeEvent, useRef, useState } from "react";
import type { BrandContact } from "@/lib/styloire/types";
import { parseBrandContactsFileDetailed } from "@/lib/styloire/parse-contacts";

// ─── Style tokens (matches wizard + roster) ──────────────────────────────────
const labelCls =
  "font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/48";
const inputCls =
  "w-full rounded-[0.55rem] border border-white/16 bg-black/12 px-3 py-2 font-sans text-[0.85rem] text-styloire-champagneLight placeholder:text-white/32 focus:border-white/30 focus:outline-none transition-colors duration-styloire";
const thCls =
  "px-4 py-3 text-left font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/42";
const tdCls = "px-4 py-3 font-sans text-[0.85rem] text-white/78 align-middle";
const smBtn =
  "rounded-full border border-white/20 bg-white/8 px-3 py-1 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white/70 transition-colors hover:border-white/36 hover:bg-white/14 hover:text-white/92 disabled:opacity-40";
const dangerBtn =
  "rounded-full border border-white/14 bg-transparent px-3 py-1 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white/44 transition-colors hover:border-red-400/28 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40";
const solidBtn =
  "rounded-full border border-styloire-champagne/40 bg-styloire-champagne/90 px-3 py-1 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-styloire-champagneFg transition-colors hover:bg-styloire-champagneLight disabled:opacity-40";

type EditForm = { brand_name: string; contact_name: string; email: string };

type Props = {
  profileId: string;
  initialContacts: BrandContact[];
};

export function ProfileContactsClient({ profileId, initialContacts }: Props) {
  // ── Contact list — all mutations are local state ─────────────────────────
  const [contacts, setContacts] = useState<BrandContact[]>(initialContacts);

  // ── Search ──────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const filtered = contacts.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.brand_name.toLowerCase().includes(q) ||
      (c.contact_name ?? "").toLowerCase().includes(q)
    );
  });

  // ── Inline edit ──────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ brand_name: "", contact_name: "", email: "" });

  function startEdit(c: BrandContact) {
    setConfirmDeleteId(null);
    setEditingId(c.id);
    setEditForm({ brand_name: c.brand_name, contact_name: c.contact_name ?? "", email: c.email });
  }

  function saveEdit() {
    if (!editingId) return;
    setContacts((prev) =>
      prev.map((c) =>
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
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  // ── Delete confirmation ──────────────────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function confirmDelete(id: string) {
    setEditingId(null);
    setConfirmDeleteId(id);
  }

  function executeDelete(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
  }

  // ── Add contact ──────────────────────────────────────────────────────────
  const [newBrand, setNewBrand] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");

  function addContact() {
    const brand = newBrand.trim().toUpperCase();
    const email = newEmail.trim().toLowerCase();
    if (!brand || !email) { setAddError("Brand name and email are required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAddError("Invalid email address."); return; }
    if (contacts.some((c) => c.email === email)) { setAddError("This email already exists."); return; }
    setContacts((prev) => [
      ...prev,
      {
        id: `bc_new_${Date.now()}`,
        client_profile_id: profileId,
        brand_name: brand,
        contact_name: newContact.trim() || null,
        email,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
    setNewBrand("");
    setNewContact("");
    setNewEmail("");
    setAddError("");
  }

  // ── CSV / XLSX upload ────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadNote, setUploadNote] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadNote(null);

    const result = await parseBrandContactsFileDetailed(file);
    e.currentTarget.value = "";
    setUploading(false);

    if (result.errors.length > 0 && result.contacts.length === 0) {
      setUploadNote({ type: "err", text: result.errors[0] });
      return;
    }

    // Deduplicate against existing contacts by email
    const existingEmails = new Set(contacts.map((c) => c.email.toLowerCase()));
    const toAdd: BrandContact[] = result.contacts
      .filter((c) => !existingEmails.has(c.email.toLowerCase()))
      .map((c) => ({
        id: `bc_csv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        client_profile_id: profileId,
        brand_name: c.brand_name,
        contact_name: c.contact_name || null,
        email: c.email,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

    const skipped = result.contacts.length - toAdd.length;
    setContacts((prev) => [...prev, ...toAdd]);

    const parts: string[] = [];
    if (toAdd.length > 0) parts.push(`${toAdd.length} contact${toAdd.length !== 1 ? "s" : ""} added`);
    if (skipped > 0) parts.push(`${skipped} duplicate${skipped !== 1 ? "s" : ""} skipped`);
    if (result.errors.length > 0) parts.push(`${result.errors.length} row error${result.errors.length !== 1 ? "s" : ""}`);
    setUploadNote({
      type: result.errors.length > 0 && toAdd.length === 0 ? "err" : "ok",
      text: parts.join(" · ")
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="mt-5 space-y-5">

      {/* ── TOOLBAR: Search + Upload ──────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brand or contact name..."
          className={inputCls + " flex-1"}
        />
        <label className={`${smBtn} cursor-pointer whitespace-nowrap ${uploading ? "opacity-40 pointer-events-none" : ""}`}>
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

      {/* Upload feedback */}
      {uploadNote ? (
        <div className={`rounded-[0.45rem] border px-3.5 py-2.5 font-sans text-[0.78rem] ${
          uploadNote.type === "ok"
            ? "border-emerald-400/28 bg-emerald-500/10 text-emerald-300"
            : "border-red-400/28 bg-red-500/10 text-red-300"
        }`}>
          {uploadNote.text}
          <button
            type="button"
            onClick={() => setUploadNote(null)}
            className="ml-3 font-semibold opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ) : null}

      {/* ── CONTACTS TABLE ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[0.55rem] border border-white/12 bg-black/8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-white/10 bg-black/12">
                <th className={thCls}>Brand</th>
                <th className={thCls}>PR Contact</th>
                <th className={thCls}>Email</th>
                <th className={thCls + " text-right"} />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {filtered.map((c) => {
                const isEditing = editingId === c.id;
                const isConfirmingDelete = confirmDeleteId === c.id;

                if (isEditing) {
                  return (
                    <tr key={c.id} className="bg-white/[0.03]">
                      <td className={tdCls}>
                        <input
                          value={editForm.brand_name}
                          onChange={(e) => setEditForm((f) => ({ ...f, brand_name: e.target.value }))}
                          className={inputCls}
                          autoFocus
                        />
                      </td>
                      <td className={tdCls}>
                        <input
                          value={editForm.contact_name}
                          onChange={(e) => setEditForm((f) => ({ ...f, contact_name: e.target.value }))}
                          placeholder="Optional"
                          className={inputCls}
                        />
                      </td>
                      <td className={tdCls}>
                        <input
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          type="email"
                          className={inputCls}
                        />
                      </td>
                      <td className={tdCls + " text-right"}>
                        <div className="inline-flex gap-1.5">
                          <button type="button" onClick={saveEdit} className={solidBtn}>
                            Save
                          </button>
                          <button type="button" onClick={cancelEdit} className={smBtn}>
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (isConfirmingDelete) {
                  return (
                    <tr key={c.id} className="bg-red-500/[0.04]">
                      <td colSpan={3} className={tdCls + " text-white/60"}>
                        Delete{" "}
                        <span className="font-semibold text-white/80">{c.brand_name}</span>?
                        {" "}This cannot be undone.
                      </td>
                      <td className={tdCls + " text-right"}>
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => executeDelete(c.id)}
                            className={dangerBtn + " border-red-400/30 bg-red-500/12 text-red-300 hover:bg-red-500/22"}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className={smBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={c.id} className="transition-colors duration-100 hover:bg-white/[0.025]">
                    <td className={tdCls + " font-medium uppercase tracking-[0.03em]"}>
                      {c.brand_name}
                    </td>
                    <td className={tdCls + " text-white/55"}>
                      {c.contact_name ?? <span className="text-white/24">—</span>}
                    </td>
                    <td className={tdCls + " text-white/55"}>{c.email}</td>
                    <td className={tdCls + " text-right"}>
                      <div className="inline-flex gap-1.5">
                        <button type="button" onClick={() => startEdit(c)} className={smBtn}>
                          Edit
                        </button>
                        <button type="button" onClick={() => confirmDelete(c.id)} className={dangerBtn}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center font-sans text-[0.82rem] text-white/30">
                    {query ? `No contacts matching "${query}".` : "No contacts yet — add one below."}
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
        <p className={labelCls + " mb-2"}>Add a contact</p>
        <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_1fr_auto]">
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
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addContact(); } }}
            className={inputCls}
          />
          <button
            type="button"
            onClick={addContact}
            className="rounded-full border border-white/22 bg-white/8 px-6 py-2 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-styloire-champagneLight transition-colors hover:border-white/36 hover:bg-white/14"
          >
            Add
          </button>
        </div>
        {addError ? (
          <p className="mt-1.5 font-sans text-[0.75rem] text-red-300">{addError}</p>
        ) : null}
        <p className="mt-1.5 font-sans text-[0.72rem] text-white/28">
          Expected columns for CSV upload: <code className="text-white/42">brand_name, email, first_name</code>
        </p>
      </div>

    </div>
  );
}
