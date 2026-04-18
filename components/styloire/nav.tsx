import Link from "next/link";
import type { ReactNode } from "react";

export type StyloireNavItem = {
  href: string;
  label: string;
};

export type StyloireNavProps = {
  items: StyloireNavItem[];
  logo?: ReactNode;
  className?: string;
  /** Pin to viewport for marketing; static for embedded app chrome */
  sticky?: boolean;
};

export function StyloireNav({
  items,
  logo = (
    <span className="font-sans text-styloire-caption font-medium uppercase tracking-[0.42em] text-styloire-ink">
      Styloire
    </span>
  ),
  className = "",
  sticky = true
}: StyloireNavProps) {
  return (
    <header
      className={`z-50 w-full border-b border-styloire-lineSubtle bg-styloire-canvas/80 px-6 py-5 backdrop-blur-md md:px-10 ${sticky ? "sticky top-0" : ""} ${className}`.trim()}
    >
      <div className="mx-auto flex max-w-styloire flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="shrink-0 tracking-[0.35em]">
          {logo}
        </Link>
        <nav className="flex flex-wrap items-center justify-start gap-2 sm:justify-end" aria-label="Primary">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-styloire-line px-4 py-1.5 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav text-styloire-ink transition-colors duration-200 hover:border-styloire-ink hover:bg-styloire-ink/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
