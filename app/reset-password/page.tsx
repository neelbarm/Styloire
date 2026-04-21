"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StyloireButton, StyloireSection } from "@/components/styloire";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setHasSession(Boolean(data.user));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password.trim()) {
      setNote("Enter a new password.");
      return;
    }
    if (password.length < 8) {
      setNote("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setNote("Passwords do not match.");
      return;
    }

    setBusy(true);
    setNote("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setNote(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <StyloireSection tone="deep" className="min-h-screen">
      <div className="mx-auto w-full max-w-lg border border-styloire-lineSubtle bg-styloire-canvas/60 px-8 py-10 text-center ring-1 ring-styloire-champagne/[0.08]">
        <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-champagneMuted">
          Styloire access
        </p>
        <h1 className="mt-4 font-serif text-4xl text-styloire-champagne">
          Reset password
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-sm font-light text-styloire-inkSoft">
          Choose a new password for your account.
        </p>

        {!ready ? (
          <p className="mt-8 font-sans text-sm text-styloire-inkSoft">
            Loading secure reset session...
          </p>
        ) : !hasSession ? (
          <div className="mt-8 space-y-5">
            <p className="font-sans text-sm text-red-300">
              Your reset link is missing or expired. Request a new one from login.
            </p>
            <div className="flex justify-center">
              <StyloireButton href="/login" variant="outline">
                Back to login
              </StyloireButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 text-left">
            <label className="block">
              <span className="mb-2 block font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                New password
              </span>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Confirm password
              </span>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne focus:outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <StyloireButton type="submit" variant="solid" disabled={busy}>
                Save new password
              </StyloireButton>
              <StyloireButton type="button" variant="outline" onClick={() => router.push("/login")} disabled={busy}>
                Cancel
              </StyloireButton>
            </div>
          </form>
        )}

        {note ? <p className="mt-5 font-sans text-xs text-styloire-inkSoft">{note}</p> : null}
        <p className="mt-6 font-sans text-xs text-styloire-inkMuted">
          Need help?{" "}
          <Link href="/contact" className="text-styloire-ink underline-offset-4 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </StyloireSection>
  );
}
