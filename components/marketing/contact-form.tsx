"use client";

import { FormEvent, useState } from "react";
import { StyloireButton } from "@/components/styloire/button";

const CONTACT_REQUEST_TIMEOUT_MS = 15_000;

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
    const rawName = String(form.get("firstName") ?? "").trim();
    const nameParts = rawName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || firstName;
    const payload = {
      firstName,
      lastName,
      email: String(form.get("email") ?? ""),
      role: String(form.get("role") ?? "") as "stylist" | "assistant",
      message: String(form.get("message") ?? "")
    };
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), CONTACT_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      event.currentTarget.reset();
      setSent(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("The message request timed out. Please try again in a moment.");
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto grid w-full max-w-[32rem] gap-5 text-left"
    >
      <div className="grid gap-5">
        <label className="space-y-2">
          <input
            required
            name="firstName"
            placeholder="NAME"
            className="w-full border border-white/34 bg-transparent px-4 py-3 text-center font-sans text-[1rem] uppercase tracking-[0.18em] text-styloire-champagneLight placeholder:text-styloire-champagneLight/85 focus:border-white/50 focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <input
            type="hidden"
            name="lastName"
            defaultValue=""
          />
          <input
            required
            type="email"
            name="email"
            placeholder="YOUR EMAIL ADDRESS"
            className="w-full border border-white/34 bg-transparent px-4 py-3 text-center font-sans text-[1rem] uppercase tracking-[0.18em] text-styloire-champagneLight placeholder:text-styloire-champagneLight/85 focus:border-white/50 focus:outline-none"
          />
        </label>
      </div>
      <label className="space-y-2">
        <select
          required
          name="role"
          className="sr-only"
          defaultValue="stylist"
        >
          <option value="stylist">Stylist</option>
          <option value="assistant">Assistant</option>
        </select>
      </label>
      <label className="space-y-2">
        <textarea
          required
          name="message"
          rows={8}
          placeholder="MESSAGE"
          className="w-full resize-y border border-white/34 bg-transparent px-4 py-5 text-center font-sans text-[1rem] uppercase tracking-[0.18em] text-styloire-champagneLight placeholder:text-styloire-champagneLight/85 focus:border-white/50 focus:outline-none"
        />
      </label>
      <div className="flex flex-col items-center gap-4 text-center">
        <StyloireButton
          type="submit"
          variant="outline"
          disabled={loading}
          className="min-w-[15rem] border-white/34 bg-white/18 px-8 py-3 text-[0.72rem] tracking-[0.18em] text-white hover:bg-white/24"
        >
          Send message
        </StyloireButton>
        {error ? (
          <p className="font-sans text-xs text-red-300">{error}</p>
        ) : sent ? (
          <p className="font-sans text-xs text-styloire-inkSoft">
            Thank you. If you need us sooner, write{" "}
            <a
              href="mailto:hello@styloire.co"
              className="text-styloire-champagneLight underline-offset-4 hover:underline"
            >
              hello@styloire.co
            </a>
            .
          </p>
        ) : null}
      </div>
    </form>
  );
}
