import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-styloire-lineSubtle bg-styloire-canvasDeep px-6 py-12 text-center md:px-10">
      <p className="font-sans text-styloire-caption font-medium uppercase tracking-styloireNav text-styloire-inkMuted">
        Styloire · styloire.co · $20/month when we launch
      </p>
      <p className="mx-auto mt-3 max-w-md font-sans text-xs font-light text-styloire-inkSoft">
        hello@styloire.co · @styloire.co on Instagram
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-styloire-caption uppercase tracking-styloireNav text-styloire-inkSoft">
        <Link href="/dashboard" className="underline-offset-4 hover:text-styloire-ink hover:underline">
          App preview
        </Link>
        <span className="text-styloire-inkMuted" aria-hidden>
          ·
        </span>
        <Link href="/demo" className="underline-offset-4 hover:text-styloire-ink hover:underline">
          CSV parsing demo
        </Link>
      </div>
    </footer>
  );
}
