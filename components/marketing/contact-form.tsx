"use client";

import { FormEvent, useState } from "react";
import { StyloireButton } from "@/components/styloire/button";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSent(false);

    const form = new FormData(event.currentTarget);
    const payload = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? ""),
      role: String(form.get("role") ?? "") as "stylist" | "assistant",
      message: String(form.get("message") ?? "")
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    event.currentTarget.reset();
    setSent(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto grid w-full max-w-xl gap-6 text-left"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
            First name
          </span>
          <input
            required
            name="firstName"
            className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
            Last name
          </span>
          <input
            required
            name="lastName"
            className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne focus:outline-none"
          />
        </label>
      </div>
      <label className="space-y-2">
        <span className="font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
          Email
        </span>
        <input
          required
          type="email"
          name="email"
            className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne focus:outline-none"
          />
      </label>
      <label className="space-y-2">
        <span className="font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
          Are you a stylist or assistant?
        </span>
        <select
          required
          name="role"
          className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne focus:outline-none"
          defaultValue=""
        >
          <option value="" disabled>
            Select one
          </option>
          <option value="stylist">Stylist</option>
          <option value="assistant">Assistant</option>
        </select>
      </label>
      <label className="space-y-2">
        <span className="font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
          Message
        </span>
        <textarea
          required
          name="message"
          rows={5}
          className="w-full resize-y border border-styloire-lineSubtle bg-styloire-canvas/40 px-4 py-3 font-sans text-sm font-light text-styloire-ink focus:border-styloire-champagne/70 focus:outline-none"
        />
      </label>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <StyloireButton type="submit" variant="solid" disabled={loading}>
          Send message
        </StyloireButton>
        {error ? (
          <p className="font-sans text-xs text-red-300">{error}</p>
        ) : sent ? (
          <p className="font-sans text-xs text-styloire-inkSoft">
            Thank you. If you need us sooner, write{" "}
            <a href="mailto:hello@styloire.co" className="text-styloire-ink underline-offset-4 hover:underline">
              hello@styloire.co
            </a>
            .
          </p>
        ) : (
          <p className="font-sans text-xs text-styloire-inkMuted">We reply within 24–48 hours.</p>
        )}
      </div>
    </form>
  );
}
