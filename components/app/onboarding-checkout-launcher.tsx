"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  subscriptionStatus: string;
  checkoutStatus?: string;
  checkoutSuccessPath: string;
  checkoutCancelPath: string;
};

function isPaidStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}

export function OnboardingCheckoutLauncher({
  subscriptionStatus,
  checkoutStatus,
  checkoutSuccessPath,
  checkoutCancelPath,
}: Props) {
  const [note, setNote] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const started = useRef(false);

  const isPaid = isPaidStatus(subscriptionStatus);
  const skipAuto =
    isPaid || checkoutStatus === "success" || checkoutStatus === "cancelled";

  useEffect(() => {
    if (skipAuto) return;
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    void (async () => {
      setRedirecting(true);
      setNote(null);
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            successPath: checkoutSuccessPath,
            cancelPath: checkoutCancelPath,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.url) {
          setNote(data.error ?? "Could not start subscription checkout.");
          setRedirecting(false);
          return;
        }
        window.location.href = data.url;
      } catch {
        if (!cancelled) {
          setNote("Network error — could not start subscription checkout.");
          setRedirecting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [skipAuto, checkoutSuccessPath, checkoutCancelPath]);

  if (isPaid) return null;

  if (!redirecting && !note) return null;

  return (
    <div
      className="mb-6 rounded-[0.55rem] border border-white/14 bg-white/[0.06] px-4 py-3 text-center"
      role="status"
      aria-live="polite"
    >
      {redirecting ? (
        <p className="font-sans text-[0.82rem] text-white/72">
          Redirecting you to secure checkout…
        </p>
      ) : null}
      {note ? (
        <p className="font-sans text-[0.82rem] text-red-300">{note}</p>
      ) : null}
    </div>
  );
}
