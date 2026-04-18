import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-styloire-lineSubtle bg-styloire-canvasDeep px-6 py-14 text-center md:px-10">
      <p className="font-sans text-styloire-caption font-medium uppercase tracking-styloireNav text-styloire-inkMuted">
        Styloire
      </p>
      <p className="mx-auto mt-4 max-w-sm font-sans text-xs font-light leading-relaxed text-styloire-inkSoft">
        hello@styloire.co · Instagram @styloire.co
      </p>
      <p className="mt-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-styloire-inkMuted">
        Twenty dollars a month · styloire.co
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-inkMuted">
        <Link
          href="/dashboard"
          className="underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-ink hover:underline"
        >
          Workspace
        </Link>
        <span className="text-styloire-line" aria-hidden>
          |
        </span>
        <Link
          href="/demo"
          className="underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-ink hover:underline"
        >
          Import demo
        </Link>
      </div>
    </footer>
  );
}
