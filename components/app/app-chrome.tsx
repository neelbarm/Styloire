"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { StyloireAppShell } from "@/components/styloire/app-shell";

const topNav = [
  { href: "/how-it-works", label: "how it works", match: "prefix" },
  { href: "/dashboard", label: "my portal", match: "exact" },
  { href: "/faqs", label: "FAQs", match: "prefix" },
  { href: "/contact", label: "contact", match: "prefix" },
  { href: "/settings", label: "account", match: "prefix" }
];

const portalNav = [
  { href: "/requests/new", label: "send a new request", match: "prefix" },
  { href: "/dashboard?view=requests", label: "existing requests", match: "search" },
  { href: "/roster", label: "client profiles", match: "prefix" }
];

function pillClass(active: boolean) {
  return [
    "rounded-full border px-5 py-2 font-sans text-[0.75rem] font-medium normal-case tracking-[0.01em] transition-[color,background-color,border-color] duration-styloire ease-styloire",
    active
      ? "border-white/55 bg-white/28 text-white"
      : "border-white/38 bg-white/18 text-white/86 hover:border-white/55 hover:bg-white/24"
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

  return (
    <StyloireAppShell
      sidebar={null}
      topBar={
        <div className="mx-auto w-full max-w-[72rem] space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/28 pb-5">
            <Link
              href="/"
              className="font-sans text-[0.95rem] font-semibold uppercase tracking-[0.24em] text-styloire-champagneLight"
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
          <div className="flex flex-wrap justify-center gap-3">
            {portalNav.map((item) => (
              <Link
                key={`portal-${item.label}`}
                href={item.href}
                className={`min-w-[11rem] text-center ${pillClass(isNavActive(item, pathname, view))}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      }
    >
      {children}
    </StyloireAppShell>
  );
}
