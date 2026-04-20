import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type StyloireButtonVariant = "outline" | "solid";

export type StyloireButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: StyloireButtonVariant;
  href?: string;
};

const base =
  "inline-flex items-center justify-center rounded-full border px-8 py-2.5 font-sans text-styloire-caption font-medium uppercase tracking-[0.18em] transition-[color,background-color,border-color,opacity,transform] duration-styloire ease-styloire focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-styloire-champagne/55 disabled:pointer-events-none disabled:opacity-35";

const variants: Record<StyloireButtonVariant, string> = {
  outline:
    "border-white/45 bg-white/10 text-white/92 hover:border-white/70 hover:bg-white/18 hover:-translate-y-[1px]",
  solid:
    "border-styloire-champagne/50 bg-styloire-champagne text-styloire-champagneFg shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] hover:border-styloire-champagneLight hover:bg-styloire-champagneLight hover:text-styloire-champagneFg hover:-translate-y-[1px]"
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
