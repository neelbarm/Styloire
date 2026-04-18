import type { HTMLAttributes, ReactNode } from "react";

type HeadingLevel = "display" | "title" | "section" | "editorial";

const headingClasses: Record<HeadingLevel, string> = {
  /** Hero — sentence case, light weight, no shouty caps */
  display:
    "font-serif text-styloire-display font-light normal-case tracking-tight text-styloire-ink",
  /** Short section labels */
  title:
    "font-serif text-styloire-title font-normal uppercase tracking-[0.12em] text-styloire-champagne",
  section:
    "font-serif text-2xl font-light uppercase tracking-[0.16em] text-styloire-champagne md:text-3xl",
  /** Longer headlines — mixed case, editorial rhythm */
  editorial:
    "mx-auto max-w-styloire-narrow font-serif text-[clamp(1.65rem,3.2vw,2.35rem)] font-light leading-[1.2] tracking-[0.01em] text-styloire-ink"
};

export type StyloireHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
  level?: HeadingLevel;
  children: ReactNode;
};

export function StyloireHeading({
  as = "h2",
  level = "title",
  className = "",
  children,
  ...rest
}: StyloireHeadingProps) {
  const Tag = as;
  return (
    <Tag className={`${headingClasses[level]} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

export type StyloireLeadProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

export function StyloireLead({ className = "", children, ...rest }: StyloireLeadProps) {
  return (
    <p
      className={`font-serif text-lg font-light italic leading-relaxed text-styloire-champagneLight md:text-xl ${className}`.trim()}
      {...rest}
    >
      {children}
    </p>
  );
}

export type StyloireBodyProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  narrow?: boolean;
};

export function StyloireBody({
  narrow = false,
  className = "",
  children,
  ...rest
}: StyloireBodyProps) {
  return (
    <p
      className={`mx-auto max-w-styloire-prose font-sans text-styloire-body font-light text-styloire-inkSoft ${narrow ? "max-w-styloire-narrow" : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </p>
  );
}

export type StyloireEyebrowProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

export function StyloireEyebrow({ className = "", children, ...rest }: StyloireEyebrowProps) {
  return (
    <p
      className={`font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-champagneMuted ${className}`.trim()}
      {...rest}
    >
      {children}
    </p>
  );
}

export type StyloireListProps = HTMLAttributes<HTMLUListElement> & {
  items: string[];
};

export function StyloireList({ items, className = "", ...rest }: StyloireListProps) {
  return (
    <ul
      className={`mx-auto max-w-styloire-narrow list-none space-y-5 font-sans text-styloire-body font-light text-styloire-inkSoft ${className}`.trim()}
      {...rest}
    >
      {items.map((item) => (
        <li key={item} className="flex justify-center gap-4">
          <span className="select-none pt-0.5 font-serif text-styloire-champagne/80" aria-hidden>
            —
          </span>
          <span className="max-w-md text-center leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
