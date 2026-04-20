import {
  StyloireBody,
  StyloireEyebrow,
  StyloireHeading,
  StyloireHero,
  StyloireImageSection,
  StyloireSection
} from "@/components/styloire";
import { ContactForm } from "@/components/marketing/contact-form";

const IMG_HEADER = "url('/images/pearl-necklace.jpeg')";

export default function ContactPage() {
  return (
    <>
      {/* ─── HEADER IMAGE BAND ─────────────────────────────────────── */}
      <StyloireImageSection
        imageUrl={IMG_HEADER}
        overlay="heavy"
        position="center 30%"
        className="min-h-[min(52vh,28rem)] pt-28"
      >
        <StyloireHero className="max-w-[44rem] gap-5">
          <StyloireEyebrow className="text-white/55">Styloire studio</StyloireEyebrow>
          <h1 className="font-serif text-[clamp(3.4rem,7vw,5.8rem)] font-semibold uppercase leading-none tracking-[-0.02em] text-white">
            Get in touch
          </h1>
          <StyloireBody className="max-w-[36rem] text-[clamp(0.88rem,1.5vw,1rem)] text-white/70">
            Have a question, a suggestion, or just want to say hi? We&apos;d
            love to hear from you.
          </StyloireBody>
        </StyloireHero>
      </StyloireImageSection>

      {/* ─── CONTACT FORM ──────────────────────────────────────────── */}
      <StyloireSection tone="deep" className="py-[clamp(5rem,10vw,8rem)]">
        <ContactForm />

        {/* ─── DIRECT CONTACT DETAILS ──────────────────────────────── */}
        <div className="mx-auto mt-14 max-w-xl border-t border-styloire-lineSubtle pt-10 text-center">
          <StyloireHeading level="section" className="mb-4">
            Prefer to reach us directly?
          </StyloireHeading>
          <p className="font-sans text-[clamp(0.85rem,1.4vw,0.95rem)] font-light text-styloire-inkSoft">
            Email us at{" "}
            <a
              href="mailto:hello@styloire.co"
              className="text-styloire-champagneLight underline-offset-4 transition-colors duration-styloire ease-styloire hover:text-styloire-ink hover:underline"
            >
              hello@styloire.co
            </a>
          </p>
          <p className="mt-3 font-sans text-[clamp(0.85rem,1.4vw,0.95rem)] font-light text-styloire-inkSoft">
            Follow along on Instagram{" "}
            <a
              href="https://instagram.com/styloire.co"
              target="_blank"
              rel="noreferrer"
              className="text-styloire-champagneLight underline-offset-4 transition-colors duration-styloire ease-styloire hover:text-styloire-ink hover:underline"
            >
              @styloire.co
            </a>
          </p>
          <p className="mt-5 font-sans text-[0.78rem] font-light text-styloire-inkMuted">
            We reply within 24–48 hours.
          </p>
        </div>
      </StyloireSection>
    </>
  );
}
