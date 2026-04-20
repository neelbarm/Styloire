"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { StyloireAppShell } from "@/components/styloire/app-shell";

const topNav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/dashboard", label: "My portal" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
  { href: "/settings", label: "Account" }
];

const portalNav = [
  { href: "/requests/new", label: "Send a new request" },
  { href: "/dashboard#requests", label: "Existing requests" },
  { href: "/roster", label: "Client profiles" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Account" }
];

function pillClass(active: boolean) {
  return [
    "rounded-full border px-6 py-2 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition-[color,background-color,border-color] duration-styloire ease-styloire",
    active
      ? "border-white/65 bg-white/22 text-white"
      : "border-white/45 bg-white/10 text-white/90 hover:border-white/70 hover:bg-white/20"
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
      sidebar={null}
      topBar={
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/35 pb-5">
            <Link
              href="/"
              className="font-sans text-[0.82rem] font-semibold uppercase tracking-[0.3em] text-white/90"
            >
              Styloire
            </Link>
            <div className="flex flex-wrap justify-end gap-3">
              {topNav.map((item) => {
                const active = item.href === "/dashboard" ? pathname.startsWith("/dashboard") : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={pillClass(active)}>
                    {item.label}
                  </Link>
                );
              })}
              <button type="button" onClick={() => void signOut()} className={pillClass(false)}>
                Sign out
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
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
        </div>
      }
    >
      {children}
    </StyloireAppShell>
  );
}
