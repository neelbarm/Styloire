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
            className="font-sans text-styloire-caption font-medium uppercase tracking-[0.42em] text-styloire-ink"
          >
            Styloire
          </Link>
          <Link
            href="/contact#waitlist"
            className="rounded-full border border-transparent bg-styloire-sand px-5 py-2 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav text-styloire-sandFg transition-[color,background-color] duration-styloire ease-styloire hover:bg-styloire-ink hover:text-styloire-canvas md:hidden"
          >
            Join waitlist
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
              className="rounded-full border border-styloire-line px-4 py-1.5 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav text-styloire-ink transition-[color,background-color,border-color] duration-styloire ease-styloire hover:border-styloire-ink hover:bg-styloire-ink/[0.05]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden justify-end md:flex">
          <Link
            href="/contact#waitlist"
            className="rounded-full border border-transparent bg-styloire-sand px-6 py-2 font-sans text-[0.65rem] font-medium uppercase tracking-styloireNav text-styloire-sandFg transition-[color,background-color] duration-styloire ease-styloire hover:bg-styloire-ink hover:text-styloire-canvas"
          >
            Join the waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
