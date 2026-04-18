import { StyloireEyebrow, StyloireHeading, StyloireSection } from "@/components/styloire";
import { FaqPageContent } from "@/components/marketing/faq-content";

export default function FaqsPage() {
  return (
    <StyloireSection tone="solid" className="pt-24 pb-24">
      <div className="mx-auto mb-16 max-w-styloire-narrow text-center">
        <StyloireEyebrow>Support</StyloireEyebrow>
        <StyloireHeading as="h1" level="display">
          FAQs
        </StyloireHeading>
        <p className="mt-6 font-sans text-sm font-light text-styloire-inkSoft">
          Core answers on product use, pricing, and privacy.
        </p>
      </div>
      <FaqPageContent />
    </StyloireSection>
  );
}
