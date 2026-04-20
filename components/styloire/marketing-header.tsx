import Link from "next/link";

const centerLinks = [
  { href: "/how-it-works", label: "how it works" },
  { href: "/dashboard", label: "my portal" },
  { href: "/faqs", label: "FAQ's" },
  { href: "/contact", label: "contact" },
  { href: "/dashboard", label: "account" }
];

export function StyloireMarketingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 px-5 py-5 md:px-10 md:py-7">
      <div className="mx-auto flex max-w-[76rem] items-center justify-between gap-4">
        <div className="shrink-0">
          <Link
            href="/"
            className="font-sans text-[0.56rem] font-medium uppercase tracking-[0.34em] text-white/85 md:text-[0.62rem]"
          >
            Styloire
          </Link>
        </div>

        <nav
          className="flex flex-wrap items-center justify-end gap-1.5 md:gap-2"
          aria-label="Marketing"
        >
          {centerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/28 bg-white/12 px-3.5 py-1.5 text-center font-sans text-[0.5rem] font-medium uppercase tracking-[0.18em] text-white/88 backdrop-blur-sm transition-[color,background-color,border-color] duration-styloire ease-styloire hover:border-white/40 hover:bg-white/18 md:min-w-[5.3rem] md:px-[1.125rem] md:text-[0.56rem]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
