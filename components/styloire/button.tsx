import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type StyloireButtonVariant = "outline" | "solid";

export type StyloireButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: StyloireButtonVariant;
  href?: string;
};

const base =
  "inline-flex items-center justify-center rounded-sm border px-8 py-2.5 font-sans text-styloire-caption font-medium uppercase tracking-[0.18em] transition-[color,background-color,border-color,opacity,transform] duration-styloire ease-styloire focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-styloire-champagne/55 disabled:pointer-events-none disabled:opacity-35";

const variants: Record<StyloireButtonVariant, string> = {
  outline:
    "border-styloire-line bg-transparent text-styloire-ink hover:border-styloire-champagne/55 hover:bg-styloire-champagne/[0.07] hover:-translate-y-[1px]",
  solid:
    "border-styloire-champagne/45 bg-gradient-to-b from-styloire-champagneLight to-styloire-champagne text-styloire-champagneFg shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] hover:border-styloire-champagneLight hover:from-styloire-champagneLight hover:to-styloire-champagneLight hover:text-styloire-champagneFg hover:-translate-y-[1px]"
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
