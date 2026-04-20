"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StyloireButton, StyloireSection } from "@/components/styloire";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const error = search.get("error");
  const next = search.get("next") ?? "/dashboard";
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNote("");
    const origin = window.location.origin;
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (otpError) {
      setNote(otpError.message);
      return;
    }
    setNote("Check your email for the secure sign-in link.");
  }

  return (
    <StyloireSection tone="deep" className="min-h-screen">
      <div className="mx-auto w-full max-w-lg border border-styloire-lineSubtle bg-styloire-canvas/60 px-8 py-10 text-center ring-1 ring-styloire-champagne/[0.08]">
        <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-champagneMuted">
          Styloire access
        </p>
        <h1 className="mt-4 font-serif text-4xl text-styloire-champagne">Sign in</h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-sm font-light text-styloire-inkSoft">
          Enter your email and we will send a secure magic link.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 text-left">
          <label className="block">
            <span className="mb-2 block font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
              Email
            </span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <StyloireButton type="submit" variant="solid" disabled={busy}>
              Send magic link
            </StyloireButton>
            <StyloireButton
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              disabled={busy}
            >
              Back to site
            </StyloireButton>
          </div>
        </form>
        {error ? (
          <p className="mt-5 font-sans text-xs text-red-300">
            {error === "session" ? "Please sign in to continue." : "Sign-in failed. Try again."}
          </p>
        ) : null}
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
