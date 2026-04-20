import Link from "next/link";

const centerLinks = [
  { href: "/how-it-works", label: "How it Works" },
  { href: "/dashboard", label: "My Portal" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
  { href: "/settings", label: "Account" }
];

export function StyloireMarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/28 bg-black/12 px-8 py-5 backdrop-blur-[2px] md:px-14">
      <div className="mx-auto flex max-w-[76rem] flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-6 md:justify-start">
          <Link
            href="/"
            className="font-sans text-[0.82rem] font-semibold uppercase tracking-[0.3em] text-white/90"
          >
            Styloire
          </Link>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-2 md:justify-end md:gap-3"
          aria-label="Marketing"
        >
          {centerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/42 bg-white/9 px-6 py-2 font-sans text-[0.63rem] font-semibold uppercase tracking-[0.13em] text-white/90 transition-[color,background-color,border-color] duration-styloire ease-styloire hover:border-white/65 hover:bg-white/17"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
