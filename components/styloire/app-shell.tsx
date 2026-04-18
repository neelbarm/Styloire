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
        <aside className="hidden w-64 shrink-0 border-r border-styloire-lineSubtle bg-[linear-gradient(180deg,rgba(42,32,22,0.55),rgba(6,5,4,0.97))] lg:block">
          {sidebar}
        </aside>
      ) : null}
      <div className="flex min-h-screen flex-1 flex-col">
        {topBar ? (
          <div className="border-b border-styloire-lineSubtle bg-styloire-canvas/95 px-6 py-4 backdrop-blur md:px-10">
            {topBar}
          </div>
        ) : null}
        <main className="flex-1 px-6 py-10 md:px-10 md:py-14">{children}</main>
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
    <div className={`mb-12 max-w-2xl space-y-4 ${className}`.trim()} {...rest}>
      <h1 className="font-serif text-3xl font-normal tracking-wide text-styloire-champagne md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="font-sans text-styloire-body font-light text-styloire-inkSoft">{description}</p>
      ) : null}
    </div>
  );
}
