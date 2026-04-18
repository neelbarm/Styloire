"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { StyloireAppShell } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloireEyebrow } from "@/components/styloire/typography";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/requests/new", label: "New request" },
  { href: "/clients", label: "My clients" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Account" }
];

function navClass(active: boolean) {
  return [
    "rounded-full border px-4 py-2 text-center font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav transition-colors",
    active
      ? "border-styloire-ink bg-styloire-ink/10 text-styloire-ink"
      : "border-styloire-line text-styloire-ink hover:border-styloire-ink hover:bg-styloire-ink/5"
  ].join(" ");
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <StyloireAppShell
      sidebar={
        <div className="flex h-full flex-col gap-10 px-6 py-10">
          <Link
            href="/"
            className="font-sans text-styloire-caption font-medium uppercase tracking-[0.42em] text-styloire-ink"
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
                    : item.href === "/clients"
                      ? pathname.startsWith("/clients")
                      : pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={navClass(active)}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-4 border-t border-styloire-lineSubtle pt-8">
            <StyloireEyebrow className="text-left">Workspace</StyloireEyebrow>
            <p className="font-sans text-xs font-light text-styloire-inkSoft">
              Mock data — wire Supabase + SendGrid per developer spec v2.
            </p>
            <StyloireButton
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => router.push("/demo")}
            >
              Legacy CSV demo
            </StyloireButton>
          </div>
        </div>
      }
      topBar={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
            Signed in as Jordan Lee
          </p>
          <Link
            href="/"
            className="font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-inkSoft underline-offset-4 hover:text-styloire-ink hover:underline"
          >
            Marketing site
          </Link>
        </div>
      }
    >
      {children}
    </StyloireAppShell>
  );
}
