import Link from "next/link";

const centerLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" }
];

export function StyloireMarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-styloire-lineSubtle bg-styloire-canvas/90 px-6 py-5 backdrop-blur-md md:px-10">
      <div className="mx-auto flex max-w-styloire flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-6 md:justify-start">
          <Link
            href="/"
            className="font-sans text-styloire-caption font-medium uppercase tracking-[0.42em] text-styloire-champagne"
          >
            Styloire
          </Link>
          <Link
            href="/dashboard"
            className="rounded-sm border border-styloire-champagne/40 bg-gradient-to-b from-styloire-champagneLight to-styloire-champagne px-5 py-2 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav text-styloire-champagneFg shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] transition-[color,background-color,border-color,transform] duration-styloire ease-styloire hover:-translate-y-[1px] hover:border-styloire-champagneLight hover:from-styloire-champagneLight hover:to-styloire-champagneLight md:hidden"
          >
            Get started
          </Link>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-2 md:flex-1 md:gap-3"
          aria-label="Marketing"
        >
          {centerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm border border-styloire-line px-4 py-1.5 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav text-styloire-ink transition-[color,background-color,border-color] duration-styloire ease-styloire hover:border-styloire-champagne/45 hover:bg-styloire-champagne/[0.06]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden justify-end md:flex">
          <Link
            href="/dashboard"
            className="rounded-sm border border-styloire-champagne/40 bg-gradient-to-b from-styloire-champagneLight to-styloire-champagne px-6 py-2 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav text-styloire-champagneFg shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] transition-[color,background-color,border-color,transform] duration-styloire ease-styloire hover:-translate-y-[1px] hover:border-styloire-champagneLight hover:from-styloire-champagneLight hover:to-styloire-champagneLight"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
