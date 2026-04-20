import type { HTMLAttributes, ReactNode } from "react";

export type StyloireSectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** Solid charcoal band */
  tone?: "solid" | "deep";
};

const tones: Record<NonNullable<StyloireSectionProps["tone"]>, string> = {
  solid: "bg-styloire-canvas",
  deep: "bg-[radial-gradient(circle_at_18%_0%,rgba(201,170,110,0.09),transparent_45%),radial-gradient(circle_at_82%_100%,rgba(90,72,48,0.2),transparent_48%),rgb(6,5,4)]"
};

/**
 * Centered editorial column with generous vertical rhythm.
 * Use for alternating solid bands between image sections.
 */
export function StyloireSection({
  tone = "solid",
  className = "",
  children,
  ...rest
}: StyloireSectionProps) {
  return (
    <section
      className={`relative ${tones[tone]} py-styloire-section ${className}`.trim()}
      {...rest}
    >
      <div className="pointer-events-none absolute inset-0 bg-styloire-noise opacity-40" />
      <div className="relative mx-auto w-full max-w-styloire px-6 md:px-10">{children}</div>
    </section>
  );
}

export type StyloireImageSectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** CSS background-image value, e.g. url(...) */
  imageUrl: string;
  /** Tailwind overlay opacity token — default matches editorial legibility */
  overlay?: "default" | "heavy";
  position?: string;
};

const overlays: Record<NonNullable<StyloireImageSectionProps["overlay"]>, string> = {
  default: "from-black/30 to-black/30",
  heavy: "from-black/65 to-black/65"
};

/**
 * Full-bleed photography with matte overlay; stacks content above.
 */
export function StyloireImageSection({
  imageUrl,
  overlay = "default",
  position = "center",
  className = "",
  children,
  style,
  ...rest
}: StyloireImageSectionProps) {
  return (
    <section
      className={`relative min-h-[min(100vh,52rem)] overflow-hidden py-styloire-section ${className}`.trim()}
      style={{
        backgroundImage: imageUrl,
        backgroundSize: "cover",
        backgroundPosition: position,
        ...style
      }}
      {...rest}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-b ${overlays[overlay]}`}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-styloire-noise mix-blend-overlay opacity-30" />
      <div className="relative z-10 mx-auto flex min-h-[min(100vh,52rem)] w-full max-w-styloire flex-col items-center justify-center px-6 text-center md:px-10">
        {children}
      </div>
    </section>
  );
}

export type StyloireHeroProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

/** Centered hero stack inside solid or image sections */
export function StyloireHero({ className = "", children, ...rest }: StyloireHeroProps) {
  return (
    <div
      className={`mx-auto flex max-w-styloire-narrow flex-col items-center gap-10 text-center ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
