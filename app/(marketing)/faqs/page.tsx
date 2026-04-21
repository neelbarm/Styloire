import {
  StyloireButton
} from "@/components/styloire";
import { FaqPageContent } from "@/components/marketing/faq-content";

const IMG_HEADER = "url('/images/dress-motion.jpeg')";
const IMG_PRICING = "url('/images/stylist-rack.jpeg')";
const IMG_CTA = "url('/images/hero.jpeg')";

const pricingItems = [
  {
    q: "How much does Styloire cost?",
    a: "Styloire is $30 a month, flat. No tiers, no usage limits, no surprises."
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no commitments. Cancel whenever you want."
  }
];

const privacyItems = [
  {
    q: "Who can see my contact list?",
    a: "Only you. Your brand contacts are private to your account and are never shared, sold, or visible to anyone else on the platform."
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your contact lists, client profiles, and email history are stored securely and belong entirely to you."
  }
];

export default function FaqsPage() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(93,76,58,0.12), rgba(18,14,13,0.12)), ${IMG_HEADER}`,
          backgroundPosition: "center 18%",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto max-w-[58rem] px-6 pb-12 pt-28 text-center md:px-10 md:pb-16 md:pt-32">
          <h1 className="font-serif text-[clamp(3.3rem,7vw,5.6rem)] font-semibold uppercase leading-none tracking-[0.02em] text-white">
            FAQs
          </h1>
          <p className="mt-3 font-serif text-[clamp(0.98rem,1.8vw,1.25rem)] font-light text-white/88">
            Everything you need to know before you get started.
          </p>
        </div>
      </section>

      <section className="bg-[#27282a] px-6 py-14 md:px-10 md:py-16">
        <FaqPageContent />
      </section>

      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(14,13,13,0.1), rgba(14,13,13,0.1)), ${IMG_PRICING}`,
          backgroundPosition: "center 36%",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto max-w-[54rem] px-6 py-14 text-center md:px-10 md:py-16">
          <h2 className="font-serif text-[clamp(2.35rem,5vw,4rem)] font-semibold uppercase leading-none tracking-[0.02em] text-[#efe4d5]">
            Pricing &amp; Access
          </h2>
          <div className="mt-8 space-y-7">
            {pricingItems.map((item) => (
              <article key={item.q} className="space-y-2">
                <h3 className="font-serif text-[clamp(1.12rem,2vw,1.5rem)] font-light italic leading-[1.15] text-white">
                  {item.q}
                </h3>
                <p className="mx-auto max-w-[42rem] font-serif text-[clamp(0.98rem,1.55vw,1.12rem)] font-light leading-[1.18] text-white">
                  {item.a}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0f0f10] px-6 py-14 text-center md:px-10 md:py-16">
        <div className="mx-auto max-w-[54rem]">
          <h2 className="font-serif text-[clamp(2.35rem,5vw,4rem)] font-semibold uppercase leading-none tracking-[0.02em] text-[#efe4d5]">
            Privacy &amp; Security
          </h2>
          <div className="mt-8 space-y-7">
            {privacyItems.map((item) => (
              <article key={item.q} className="space-y-2">
                <h3 className="font-serif text-[clamp(1.12rem,2vw,1.5rem)] font-light italic leading-[1.15] text-[#f3eee8]">
                  {item.q}
                </h3>
                <p className="mx-auto max-w-[42rem] font-serif text-[clamp(0.98rem,1.55vw,1.12rem)] font-light leading-[1.18] text-[#f3eee8]">
                  {item.a}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(10,10,10,0.18), rgba(10,10,10,0.18)), ${IMG_CTA}`,
          backgroundPosition: "center 55%",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto max-w-[42rem] px-6 py-14 text-center md:px-10 md:py-16">
          <h2 className="font-serif text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-none tracking-[-0.02em] text-white">
            Still have questions?
          </h2>
          <p className="mt-4 font-serif text-[clamp(1rem,1.9vw,1.4rem)] font-light italic text-white/88">
            We&apos;re happy to help.
          </p>
          <StyloireButton
            href="/contact"
            variant="outline"
            className="mt-7 min-w-[11rem] border-white/28 bg-white/12 px-8 py-2 text-[0.54rem] tracking-[0.2em] text-white backdrop-blur-sm hover:border-white/42 hover:bg-white/18"
          >
            Contact Us
          </StyloireButton>
        </div>
      </section>
    </>
  );
}
