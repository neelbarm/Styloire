import type { HTMLAttributes, ReactNode } from "react";

export type StyloirePanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function StyloirePanel({ className = "", children, ...rest }: StyloirePanelProps) {
  return (
    <div
      className={`rounded-sm border border-styloire-lineSubtle bg-styloire-canvasDeep/55 p-6 shadow-[0_16px_44px_rgba(0,0,0,0.32)] ring-1 ring-styloire-champagne/[0.06] backdrop-blur-[2px] md:p-8 ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
