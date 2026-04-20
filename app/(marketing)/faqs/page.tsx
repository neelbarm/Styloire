import {
  StyloireButton,
  StyloireHeading,
  StyloireHero,
  StyloireImageSection,
  StyloireSection
} from "@/components/styloire";
import { FaqPageContent } from "@/components/marketing/faq-content";

const IMG_HEADER = "url('/images/mesh-fabric.jpeg')";

export default function FaqsPage() {
  return (
    <>
      {/* ─── HEADER IMAGE BAND ─────────────────────────────────────── */}
      <StyloireImageSection
        imageUrl={IMG_HEADER}
        overlay="heavy"
        position="center 45%"
        className="min-h-[min(52vh,28rem)] pt-28"
      >
        <StyloireHero className="max-w-[44rem] gap-4">
          <h1 className="font-serif text-[clamp(3.4rem,7vw,5.8rem)] font-semibold uppercase leading-none tracking-[0.04em] text-white">
            FAQs
          </h1>
          <p className="font-sans text-[clamp(0.95rem,1.8vw,1.15rem)] font-light leading-relaxed text-white/80">
            Everything you need to know before you get started.
          </p>
        </StyloireHero>
      </StyloireImageSection>

      {/* ─── FAQ ACCORDION ─────────────────────────────────────────── */}
      <StyloireSection tone="solid" className="py-[clamp(5rem,10vw,8rem)]">
        <FaqPageContent />
      </StyloireSection>

      {/* ─── BOTTOM CTA ────────────────────────────────────────────── */}
      <StyloireSection tone="deep" className="py-[clamp(4rem,8vw,6rem)]">
        <StyloireHero className="max-w-[38rem] gap-6">
          <StyloireHeading level="title" className="text-styloire-champagneLight">
            Still have questions?
          </StyloireHeading>
          <p className="font-sans text-[clamp(0.88rem,1.5vw,1rem)] font-light leading-relaxed text-styloire-inkSoft">
            We&apos;re happy to help.
          </p>
          <StyloireButton href="/contact" variant="outline" className="px-10">
            Contact Us
          </StyloireButton>
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
