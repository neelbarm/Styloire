import type { HTMLAttributes, ReactNode } from "react";

export type StyloireAppShellProps = HTMLAttributes<HTMLDivElement> & {
  sidebar?: ReactNode;
  children: ReactNode;
  /** Optional top bar inside shell (breadcrumbs, page tools) */
  topBar?: ReactNode;
};

/**
 * Authenticated app chrome: dark rails, serif page title zone, content well.
 * Pair inner pages with `StyloireHeading` + `StyloireBody` for continuity with marketing.
 */
export function StyloireAppShell({
  sidebar,
  topBar,
  children,
  className = "",
  ...rest
}: StyloireAppShellProps) {
  return (
    <div
      className={`flex min-h-screen bg-styloire-canvasDeep text-styloire-ink ${className}`.trim()}
      {...rest}
    >
      {sidebar ? (
        <aside className="hidden w-72 shrink-0 border-r border-styloire-lineSubtle bg-[linear-gradient(180deg,rgba(29,31,38,0.92),rgba(18,20,25,0.98))] md:block">
          {sidebar}
        </aside>
      ) : null}
      <div className="flex min-h-screen flex-1 flex-col">
        {topBar ? (
          <div className="border-b border-white/10 bg-[#2a2a2b] px-6 py-7 md:px-10">
            {topBar}
          </div>
        ) : null}
        <main className="flex-1 bg-[#2a2a2b] px-6 py-10 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}

export type StyloireAppPageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
};

export function StyloireAppPageHeader({
  title,
  description,
  className = "",
  ...rest
}: StyloireAppPageHeaderProps) {
  return (
    <div className={`mb-10 max-w-2xl space-y-4 ${className}`.trim()} {...rest}>
      <h1 className="font-serif text-[clamp(2rem,3.6vw,2.9rem)] font-normal tracking-wide text-styloire-champagneLight">
        {title}
      </h1>
      {description ? (
        <p className="font-sans text-styloire-body font-light text-styloire-inkSoft">{description}</p>
      ) : null}
    </div>
  );
}
