import type { HTMLAttributes, ReactNode } from "react";

export type StyloirePanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function StyloirePanel({ className = "", children, ...rest }: StyloirePanelProps) {
  return (
    <div
      className={`border border-styloire-lineSubtle bg-styloire-canvasDeep/35 p-6 backdrop-blur-[2px] md:p-8 ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
