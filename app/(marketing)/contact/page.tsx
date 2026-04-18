import Link from "next/link";
import {
  StyloireBody,
  StyloireEyebrow,
  StyloireHeading,
  StyloireHero,
  StyloireSection,
  StyloireWaitlistForm
} from "@/components/styloire";
import { ContactForm } from "@/components/marketing/contact-form";

export default function ContactPage() {
  return (
    <>
      <StyloireSection tone="solid" className="pt-24">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireEyebrow>Styloire studio</StyloireEyebrow>
          <StyloireHeading as="h1" level="display">
            Get in touch.
          </StyloireHeading>
          <StyloireBody>
            Questions about launch timing, partnerships, or press — send a note. We respond
            within 24–48 hours.
          </StyloireBody>
        </div>
      </StyloireSection>

      <StyloireSection tone="deep">
        <ContactForm />
        <div className="mx-auto mt-12 max-w-xl border-t border-styloire-lineSubtle pt-10 text-center font-sans text-sm font-light text-styloire-inkSoft">
          <p>
            Prefer email directly?{" "}
            <a className="text-styloire-ink underline-offset-4 hover:underline" href="mailto:hello@styloire.co">
              hello@styloire.co
            </a>
          </p>
          <p className="mt-3">
            Instagram{" "}
            <a
              className="text-styloire-ink underline-offset-4 hover:underline"
              href="https://instagram.com/styloire.co"
              target="_blank"
              rel="noreferrer"
            >
              @styloire.co
            </a>
          </p>
        </div>
      </StyloireSection>

      <StyloireSection id="waitlist" tone="solid" className="scroll-mt-28 pb-24">
        <StyloireHero>
          <StyloireEyebrow>Not ready to write?</StyloireEyebrow>
          <StyloireHeading level="title">Join the waitlist</StyloireHeading>
          <StyloireBody>We will email you when invites open — same list as the homepage.</StyloireBody>
          <StyloireWaitlistForm />
          <Link
            href="/faqs"
            className="mt-4 font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-inkMuted underline-offset-4 hover:text-styloire-ink hover:underline"
          >
            Read FAQs first
          </Link>
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
