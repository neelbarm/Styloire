export type StyloireStepItem = {
  /** e.g. "01" */
  index: string;
  title: string;
  body: string;
};

export type StyloireStepsProps = {
  steps: StyloireStepItem[];
  className?: string;
};

/** Editorial numbered list — large serif index, light sans body */
export function StyloireSteps({ steps, className = "" }: StyloireStepsProps) {
  return (
    <ol
      className={`mx-auto flex max-w-styloire-narrow list-none flex-col gap-14 text-left ${className}`.trim()}
    >
      {steps.map((step) => (
        <li key={step.index} className="grid grid-cols-[minmax(0,4.5rem)_1fr] gap-8 md:gap-12">
          <span
            className="font-serif text-4xl font-light text-styloire-champagne md:text-5xl"
            aria-hidden
          >
            {step.index}
          </span>
          <div className="space-y-3">
            <p className="font-sans text-[0.7rem] font-medium uppercase tracking-styloireNav text-styloire-champagneLight">
              {step.title}
            </p>
            <p className="font-sans text-styloire-body font-light text-styloire-inkSoft">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
