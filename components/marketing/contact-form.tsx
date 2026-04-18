"use client";

import { FormEvent, useState } from "react";
import { StyloireButton } from "@/components/styloire/button";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
            className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-ink focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
            Last name
          </span>
          <input
            required
            name="lastName"
            className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-ink focus:outline-none"
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
          className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-ink focus:outline-none"
        />
      </label>
      <label className="space-y-2">
        <span className="font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
          Are you a stylist or assistant?
        </span>
        <select
          required
          name="role"
          className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink focus:border-styloire-ink focus:outline-none"
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
          className="w-full resize-y border border-styloire-lineSubtle bg-styloire-canvas/40 px-4 py-3 font-sans text-sm font-light text-styloire-ink focus:border-styloire-ink focus:outline-none"
        />
      </label>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <StyloireButton type="submit" variant="solid">
          Send message
        </StyloireButton>
        {sent ? (
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
