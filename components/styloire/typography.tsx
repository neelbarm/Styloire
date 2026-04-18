import type { HTMLAttributes, ReactNode } from "react";

type HeadingLevel = "display" | "title" | "section";

const headingClasses: Record<HeadingLevel, string> = {
  display:
    "font-serif text-styloire-display font-normal uppercase text-styloire-ink",
  title:
    "font-serif text-styloire-title font-normal uppercase tracking-[0.12em] text-styloire-ink",
  section:
    "font-serif text-2xl md:text-3xl font-normal uppercase tracking-[0.14em] text-styloire-ink"
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

/** Italic serif emphasis — taglines, pull quotes */
export function StyloireLead({ className = "", children, ...rest }: StyloireLeadProps) {
  return (
    <p
      className={`font-serif text-lg italic text-styloire-inkSoft md:text-xl md:leading-relaxed ${className}`.trim()}
      {...rest}
    >
      {children}
    </p>
  );
}

export type StyloireBodyProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  /** Tighter measure for long editorial copy */
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

/** Small caps label — nav, field labels, section kicks */
export function StyloireEyebrow({ className = "", children, ...rest }: StyloireEyebrowProps) {
  return (
    <p
      className={`font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted ${className}`.trim()}
      {...rest}
    >
      {children}
    </p>
  );
}

export type StyloireListProps = HTMLAttributes<HTMLUListElement> & {
  items: string[];
};

/** Centered hyphen list — editorial, not bullet dots */
export function StyloireList({ items, className = "", ...rest }: StyloireListProps) {
  return (
    <ul
      className={`mx-auto max-w-styloire-narrow space-y-3 font-sans text-styloire-body font-light text-styloire-inkSoft ${className}`.trim()}
      {...rest}
    >
      {items.map((item) => (
        <li key={item} className="flex justify-center gap-3">
          <span className="select-none text-styloire-inkMuted" aria-hidden>
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
