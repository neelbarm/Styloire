"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { StyloireAppShell } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloireEyebrow } from "@/components/styloire/typography";

const nav = [
  { href: "/dashboard", label: "Existing requests" },
  { href: "/requests/new", label: "Send a new request" },
  { href: "/roster", label: "Client profiles" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Account" }
];

function navClass(active: boolean) {
  return [
    "rounded-sm border px-4 py-2 text-center font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav transition-[color,background-color,border-color,transform] duration-styloire ease-styloire",
    active
      ? "border-styloire-champagne/55 bg-styloire-champagne/[0.08] text-styloire-champagneLight"
      : "border-styloire-line text-styloire-ink hover:-translate-y-[1px] hover:border-styloire-champagne/40 hover:bg-styloire-champagne/[0.05]"
  ].join(" ");
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  async function signOut() {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <StyloireAppShell
      sidebar={
        <div className="flex h-full flex-col gap-14 px-7 py-11">
          <Link
            href="/"
            className="font-sans text-styloire-caption font-medium uppercase tracking-[0.38em] text-styloire-champagne"
          >
            Styloire
          </Link>
          <nav className="flex flex-col gap-3" aria-label="App">
            {nav.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : item.href === "/requests/new"
                    ? pathname.startsWith("/requests/new")
                    : item.href === "/roster"
                      ? pathname.startsWith("/roster")
                      : pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={navClass(active)}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-5 border-t border-styloire-lineSubtle pt-10">
            <StyloireEyebrow className="text-left">My portal</StyloireEyebrow>
            <p className="font-sans text-xs font-light leading-relaxed text-styloire-inkMuted">
              Start a fresh request or continue from your saved roster profiles.
            </p>
            <StyloireButton variant="outline" className="w-full" href="/requests/new">
              Send a new request
            </StyloireButton>
          </div>
        </div>
      }
      topBar={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
            Jordan Lee
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-inkMuted underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-ink hover:underline"
            >
              Site
            </Link>
            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              className="font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-inkMuted underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-ink hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      }
    >
      {children}
    </StyloireAppShell>
  );
}
