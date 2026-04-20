"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { StyloireAppShell } from "@/components/styloire/app-shell";

const topNav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/dashboard", label: "My portal" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Account" }
];

const portalNav = [
  { href: "/requests/new", label: "Send a new request" },
  { href: "/dashboard?view=requests", label: "Existing requests" },
  { href: "/roster", label: "Client profiles" },
  { href: "/templates", label: "Templates" },
  { href: "/dashboard", label: "account" }
];

function pillClass(active: boolean) {
  return [
    "rounded-full border px-5 py-1.5 font-sans text-[0.84rem] font-medium normal-case tracking-[0.01em] transition-[color,background-color,border-color] duration-styloire ease-styloire",
    active
      ? "border-white/58 bg-white/24 text-white"
      : "border-white/46 bg-white/20 text-white/88 hover:border-white/65 hover:bg-white/26"
  ].join(" ");
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const view = search.get("view");
  const showPortalRow = pathname !== "/dashboard" || view === "requests";

  return (
    <StyloireAppShell
      sidebar={null}
      topBar={
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/32 pb-5">
            <Link
              href="/"
              className="font-sans text-[1.06rem] font-semibold uppercase tracking-[0.18em] text-styloire-champagneLight"
            >
              Styloire
            </Link>
            <div className="flex flex-wrap justify-end gap-2.5">
              {topNav.map((item) => {
                const active = item.href === "/dashboard" ? pathname.startsWith("/dashboard") : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={pillClass(active)}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          {showPortalRow ? (
            <div className="flex flex-wrap gap-2.5 md:gap-3">
              {portalNav.map((item) => {
                const active = item.href.startsWith("/dashboard")
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={pillClass(active)}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      }
    >
      {children}
    </StyloireAppShell>
  );
}
