import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import { getAuthedServiceRoleClient } from "@/lib/supabase/server";

const BUCKET = "email-attachments";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per file

// Block executable / script types (defense-in-depth; email providers also reject these).
const BLOCKED_EXTENSIONS = new Set([
  "exe", "bat", "cmd", "com", "msi", "scr", "pif", "cpl", "jar",
  "js", "jse", "vbs", "vbe", "ws", "wsf", "wsh", "ps1", "sh", "app",
  "dmg", "deb", "rpm", "dll", "gadget", "hta", "lnk", "reg", "msc", "vb",
]);
const BLOCKED_CONTENT_TYPES = new Set([
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/x-sh",
  "application/x-bat",
  "application/vnd.microsoft.portable-executable",
]);

function sanitizeFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base || "file";
}

/** Lower-cased extension from a filename, or "" if none. */
function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return "";
  return name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function POST(request: Request) {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "File storage is not configured." },
      { status: 503 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const ext = fileExtension(file.name);
  if (
    (ext && BLOCKED_EXTENSIONS.has(ext)) ||
    (file.type && BLOCKED_CONTENT_TYPES.has(file.type.toLowerCase()))
  ) {
    return NextResponse.json(
      { error: "That file type isn't allowed for security reasons." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Maximum size is 5 MB." },
      { status: 400 },
    );
  }

  const contentType = file.type || "application/octet-stream";
  const storagePath = `${authed.userId}/${randomUUID()}${ext ? `.${ext}` : ""}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await authed.client.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    path: storagePath,
    filename: sanitizeFilename(file.name),
    contentType,
    size: file.size,
  });
}

export async function DELETE(request: Request) {
  const authed = await getAuthedServiceRoleClient();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const { path } = (await request.json().catch(() => ({}))) as { path?: string };
  if (!path) {
    return NextResponse.json({ error: "No path provided." }, { status: 400 });
  }
  // Only allow deleting files under the caller's own prefix.
  if (!path.startsWith(`${authed.userId}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await authed.client.storage.from(BUCKET).remove([path]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
