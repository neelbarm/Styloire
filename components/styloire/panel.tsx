import type { HTMLAttributes, ReactNode } from "react";

export type StyloirePanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** Flat editorial surface for app tables and cards — no SaaS elevation */
export function StyloirePanel({ className = "", children, ...rest }: StyloirePanelProps) {
  return (
    <div
      className={`border border-styloire-lineSubtle bg-styloire-canvas/50 p-6 md:p-8 ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
