import Link from "next/link";
import {
  StyloireBody,
  StyloireButton,
  StyloireHeading,
  StyloireHero,
  StyloireImageSection,
  StyloireLead,
  StyloireList,
  StyloireSection
} from "@/components/styloire";

const heroImage =
  "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=82')";

const atelierImage =
  "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=82')";

const whoImage =
  "url('https://images.unsplash.com/photo-1539109140684-da3eeaafa257?auto=format&fit=crop&w=2400&q=82')";

const threeSteps = [
  {
    title: "Create your request",
    body: "Enter your talent and event. Styloire builds your subject lines automatically, in the exact format brands expect."
  },
  {
    title: "Upload your contacts",
    body: "Drop in your brand PR list and create a client profile, setup once and have it saved. Just a simple spreadsheet."
  },
  {
    title: "And hit send",
    body: "Every email goes out on time and in seconds. Follow ups scheduled automatically for anyone who doesn't respond."
  }
];

const features = [
  "Auto-generated subject lines in industry format",
  "Personalized emails per brand — no copy and paste",
  "Pre-written pull request templates",
  "Follow-up scheduling for non-responses",
  "Dashboard to track opens, responses, and status per project"
];

export default function MarketingHomePage() {
  return (
    <>
      <StyloireImageSection imageUrl={heroImage} position="center 12%" className="pt-24">
        <StyloireHero className="max-w-[58rem] gap-8">
          <p className="font-serif text-[clamp(4.2rem,10vw,7.2rem)] font-semibold uppercase leading-none tracking-[-0.02em] text-white">
            Styloire
          </p>
          <StyloireHeading as="h1" level="display" className="font-sans text-[clamp(1.8rem,3.5vw,2.9rem)] font-semibold tracking-[-0.01em] text-white">
            Make Emailing Simple
          </StyloireHeading>
          <StyloireLead className="max-w-4xl text-[clamp(1.6rem,2.6vw,2.35rem)] not-italic text-white">
            Pull request outreach but automated. Write one email, send it personalized to
            every brand on your list in minutes.
          </StyloireLead>
          <StyloireButton
            href="/dashboard"
            variant="outline"
            className="rounded-full border-white/60 bg-white/10 px-14 py-3 text-white hover:border-white hover:bg-white/20"
          >
            LIVE CTA text
          </StyloireButton>
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireHeading as="h2" level="title">
            The problem
          </StyloireHeading>
          <p className="mx-auto mt-10 max-w-styloire-prose font-sans text-[clamp(1.55rem,3.1vw,2.35rem)] font-light leading-[1.2] text-styloire-inkSoft">
            The average stylist sends 100–500 emails per project. Most of them are copy and
            paste.
          </p>
          <StyloireLead className="mt-12 text-[clamp(2rem,4vw,3rem)] text-styloire-champagneLight">
            There&apos;s a better way.
          </StyloireLead>
        </div>
      </StyloireSection>

      <StyloireSection tone="deep">
        <div className="mx-auto mb-24 max-w-styloire-narrow text-center">
          <StyloireHeading level="title">How it works</StyloireHeading>
          <Link
            href="/how-it-works"
            className="mt-10 inline-block font-sans text-styloire-caption uppercase tracking-[0.2em] text-styloire-champagneMuted underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-champagneLight"
          >
            View all steps
          </Link>
        </div>
        <div className="mx-auto grid max-w-styloire gap-12 md:grid-cols-3">
          {threeSteps.map((col) => (
            <article
              key={col.title}
              className="border border-styloire-lineSubtle bg-styloire-canvas/50 px-9 py-14 text-center ring-1 ring-styloire-champagne/[0.07] transition-colors duration-styloire ease-styloire hover:border-styloire-champagne/40 hover:ring-styloire-champagne/[0.12]"
            >
              <h3 className="font-serif text-[clamp(1.65rem,2.6vw,2.25rem)] font-light italic text-styloire-inkSoft">
                {col.title}
              </h3>
              <p className="mt-7 font-sans text-[0.98rem] font-light leading-relaxed text-styloire-inkSoft">
                {col.body}
              </p>
            </article>
          ))}
        </div>
      </StyloireSection>

      <StyloireImageSection imageUrl={atelierImage} overlay="heavy" position="center">
        <StyloireHero>
          <StyloireHeading level="title" className="text-styloire-ink">
            Features
          </StyloireHeading>
          <StyloireLead className="text-styloire-inkSoft">
            Everything you need. Nothing you don&apos;t.
          </StyloireLead>
          <StyloireList items={features} />
        </StyloireHero>
      </StyloireImageSection>

      <StyloireImageSection imageUrl={whoImage} overlay="heavy" position="center 20%">
        <StyloireHero>
          <StyloireHeading level="title" className="text-styloire-ink">
            Who it&apos;s for
          </StyloireHeading>
          <StyloireLead className="text-styloire-inkSoft">
            Built for stylists, by someone who gets it.
          </StyloireLead>
          <StyloireBody className="text-styloire-inkSoft">
            Whether you&apos;re dressing talent for a red carpet, an editorial shoot, or a
            commercial campaign, your time belongs on set, in the showroom, making selects -
            not in your inbox. Styloire was built for the people behind the looks.
          </StyloireBody>
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection id="get-started" tone="deep" className="scroll-mt-28 pb-28">
        <StyloireHero>
          <StyloireHeading level="display">Be the first to know.</StyloireHeading>
          <StyloireBody className="max-w-[44rem] text-[1.04rem] text-styloire-inkSoft">
            Styloire is currently in development. Join our early access list for product updates
            and founding member pricing.
          </StyloireBody>
          <div className="flex flex-wrap justify-center gap-4">
            <StyloireButton href="/contact" variant="solid" className="px-10">
              Contact us
            </StyloireButton>
            <StyloireButton href="/contact" variant="outline" className="px-10">
              Book a walkthrough
            </StyloireButton>
          </div>
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
