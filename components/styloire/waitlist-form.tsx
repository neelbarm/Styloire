"use client";

import type { FormEvent } from "react";
import { StyloireButton } from "./button";
import { StyloireUnderlineField } from "./field";

export function StyloireWaitlistForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col items-center gap-10"
    >
      <StyloireUnderlineField
        label="Your email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
      />
      <StyloireButton variant="solid" type="submit">
        Join the waitlist
      </StyloireButton>
    </form>
  );
}
