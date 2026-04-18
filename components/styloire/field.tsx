import type { InputHTMLAttributes } from "react";

export type StyloireUnderlineFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

/** Minimal underline field — short forms and account email */
export function StyloireUnderlineField({
  label,
  id,
  className = "",
  ...props
}: StyloireUnderlineFieldProps) {
  const fieldId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className={`w-full max-w-md ${className}`.trim()}>
      <label htmlFor={fieldId} className="block text-left">
        <span className="mb-2 block font-sans text-styloire-caption font-medium uppercase tracking-styloireWide text-styloire-inkMuted">
          {label}
        </span>
        <input
          id={fieldId}
          className="w-full border-0 border-b border-styloire-line bg-transparent py-2 font-sans text-sm font-light text-styloire-ink placeholder:text-styloire-inkMuted placeholder:uppercase placeholder:tracking-styloireWide focus:border-styloire-champagne focus:outline-none focus:ring-0"
          {...props}
        />
      </label>
    </div>
  );
}
