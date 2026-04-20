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
    "rounded-full border px-5 py-1.5 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.12em] transition-[color,background-color,border-color] duration-styloire ease-styloire",
    active
      ? "border-white/70 bg-white/22 text-white"
      : "border-white/42 bg-white/9 text-white/90 hover:border-white/65 hover:bg-white/17"
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
        <div className="flex h-full flex-col border-r border-white/14 bg-black/18 p-5">
          <p className="mb-4 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/60">
            My portal
          </p>
          <nav className="space-y-2.5" aria-label="Portal">
            {portalNav.map((item) => {
              const active = item.href.startsWith("/dashboard")
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`${pillClass(active)} w-full justify-center`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      }
      topBar={
        <div>
          <div className="flex flex-wrap items-center justify-between gap-5">
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
        </div>
      }
    >
      {children}
    </StyloireAppShell>
  );
}
