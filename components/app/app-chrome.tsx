"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { StyloireAppShell } from "@/components/styloire/app-shell";

const topNav = [
  { href: "/how-it-works", label: "How it works", match: "prefix" },
  { href: "/dashboard", label: "My portal", match: "exact" },
  { href: "/faqs", label: "FAQs", match: "prefix" },
  { href: "/contact", label: "Contact", match: "prefix" },
  { href: "/settings", label: "Account", match: "prefix" }
];

const portalNav = [
  { href: "/requests/new", label: "Send a new request", match: "prefix" },
  { href: "/dashboard?view=requests", label: "Existing requests", match: "search" },
  { href: "/roster", label: "Client profiles", match: "prefix" },
  { href: "/templates", label: "Templates", match: "prefix" },
  { href: "/settings", label: "Account", match: "prefix" }
];

function pillClass(active: boolean) {
  return [
    "rounded-full border px-5 py-1.5 font-sans text-[0.84rem] font-medium normal-case tracking-[0.01em] transition-[color,background-color,border-color] duration-styloire ease-styloire",
    active
      ? "border-white/58 bg-white/24 text-white"
      : "border-white/46 bg-white/20 text-white/88 hover:border-white/65 hover:bg-white/26"
  ].join(" ");
}

function isNavActive(
  item: { href: string; match: string },
  pathname: string,
  view: string | null
): boolean {
  if (item.match === "exact") return pathname === item.href;
  if (item.match === "search") {
    const [base, qs] = item.href.split("?");
    const param = new URLSearchParams(qs ?? "");
    return pathname === base && view === param.get("view");
  }
  return pathname.startsWith(item.href);
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
              {topNav.map((item) => (
                <Link
                  key={`top-${item.label}`}
                  href={item.href}
                  className={pillClass(isNavActive(item, pathname, view))}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {showPortalRow ? (
            <div className="flex flex-wrap gap-2.5 md:gap-3">
              {portalNav.map((item) => (
                <Link
                  key={`portal-${item.label}`}
                  href={item.href}
                  className={pillClass(isNavActive(item, pathname, view))}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      }
    >
      {children}
    </StyloireAppShell>
  );
}
