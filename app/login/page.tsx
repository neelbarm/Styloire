"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StyloireButton, StyloireSection } from "@/components/styloire";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "magic">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const error = search.get("error");
  const next = search.get("next") ?? "/dashboard";
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  function formatEmailDeliveryError(message: string) {
    const normalized = message.toLowerCase();
    if (normalized.includes("rate limit")) {
      return "Email delivery is temporarily throttled. Use password sign-in if you already have an account, or wait a minute and try again.";
    }
    return message;
  }

  async function ensureUserRow() {
    await fetch("/api/auth/ensure-user", { method: "POST" });
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
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
      setNote(formatEmailDeliveryError(otpError.message));
      return;
    }
    setNote("Check your email for the secure sign-in link.");
  }

  async function handlePasswordReset() {
    if (!email.trim()) {
      setNote("Enter your email first, then use reset password.");
      return;
    }
    setBusy(true);
    setNote("");
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
      },
    );
    setBusy(false);
    if (resetError) {
      setNote(formatEmailDeliveryError(resetError.message));
      return;
    }
    setNote("Check your email for the password reset link.");
  }

  async function handlePasswordAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNote("");

    if (!email.trim() || !password.trim()) {
      setBusy(false);
      setNote("Enter your email and password.");
      return;
    }

    if (authMode === "signup") {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setBusy(false);
        setNote(payload.error ?? "Could not create your account.");
        return;
      }

      const { error: signInAfterSignupError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      setBusy(false);
      if (signInAfterSignupError) {
        setNote(signInAfterSignupError.message);
        return;
      }

      await ensureUserRow();
      router.push("/dashboard");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setBusy(false);
    if (signInError) {
      setNote(signInError.message);
      return;
    }

    await ensureUserRow();
    router.push(next);
  }

  return (
    <StyloireSection tone="deep" className="min-h-screen">
      <div className="mx-auto w-full max-w-lg border border-styloire-lineSubtle bg-styloire-canvas/60 px-8 py-10 text-center ring-1 ring-styloire-champagne/[0.08]">
        <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-champagneMuted">
          Styloire access
        </p>
        <h1 className="mt-4 font-serif text-4xl text-styloire-champagne">Sign in</h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-sm font-light text-styloire-inkSoft">
          Sign in with a password, create your account, or use a secure magic link.
        </p>
        <div className="mt-8 inline-flex overflow-hidden rounded-full border border-styloire-lineSubtle bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setAuthMode("signin")}
            className={`rounded-full px-4 py-2 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] ${
              authMode === "signin"
                ? "bg-styloire-champagneLight text-styloire-champagneFg"
                : "text-styloire-inkMuted"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("magic")}
            className={`rounded-full px-4 py-2 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] ${
              authMode === "magic"
                ? "bg-styloire-champagneLight text-styloire-champagneFg"
                : "text-styloire-inkMuted"
            }`}
          >
            Magic link
          </button>
        </div>

        {authMode === "magic" ? (
          <form onSubmit={handleMagicLink} className="mt-8 space-y-6 text-left">
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
            <div className="flex flex-wrap justify-center gap-3">
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
        ) : (
          <form onSubmit={handlePasswordAuth} className="mt-8 space-y-6 text-left">
            <div className="flex items-center justify-between gap-3">
              <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                {authMode === "signup" ? "Create account" : "Sign in with password"}
              </p>
              <button
                type="button"
                onClick={() => setAuthMode((current) => (current === "signup" ? "signin" : "signup"))}
                className="font-sans text-[0.7rem] uppercase tracking-[0.12em] text-styloire-champagneMuted hover:text-styloire-champagneLight"
              >
                {authMode === "signup" ? "Have an account?" : "Create account"}
              </button>
            </div>
            {authMode === "signup" ? (
              <label className="block">
                <span className="mb-2 block font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                  Full name
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne focus:outline-none"
                />
              </label>
            ) : null}
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
            <label className="block">
              <span className="mb-2 block font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Password
              </span>
              <input
                required
                type="password"
                autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne focus:outline-none"
              />
            </label>
            {authMode === "signin" ? (
              <div className="-mt-2 text-right">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={busy}
                  className="font-sans text-[0.72rem] uppercase tracking-[0.12em] text-styloire-champagneMuted hover:text-styloire-champagneLight disabled:opacity-40"
                >
                  Forgot password?
                </button>
              </div>
            ) : null}
            <div className="flex flex-wrap justify-center gap-3">
              <StyloireButton type="submit" variant="solid" disabled={busy}>
                {authMode === "signup" ? "Create account" : "Sign in"}
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
        )}
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
