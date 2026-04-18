import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type StyloireButtonVariant = "outline" | "solid";

export type StyloireButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: StyloireButtonVariant;
  href?: string;
};

const base =
  "inline-flex items-center justify-center rounded-full border px-7 py-2.5 font-sans text-styloire-caption font-medium uppercase tracking-styloireNav transition-[color,background-color,border-color,opacity] duration-styloire ease-styloire focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-styloire-ink/50 disabled:pointer-events-none disabled:opacity-35";

const variants: Record<StyloireButtonVariant, string> = {
  outline:
    "border-styloire-line bg-transparent text-styloire-ink hover:border-styloire-ink hover:bg-styloire-ink/[0.06]",
  solid:
    "border-transparent bg-styloire-sand text-styloire-sandFg hover:bg-styloire-ink hover:text-styloire-canvas"
};

export function StyloireButton({
  variant = "outline",
  className = "",
  type = "button",
  href,
  children,
  ...rest
}: StyloireButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`.trim();
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
