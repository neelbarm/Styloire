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
  "url('https://images.unsplash.com/photo-1509631179647-017733169239?auto=format&fit=crop&w=2400&q=82')";

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
      <StyloireImageSection imageUrl={heroImage} position="center 26%">
        <StyloireHero>
          <StyloireHeading as="h1" level="display">
            Make Emailing Simple
          </StyloireHeading>
          <StyloireLead className="text-styloire-inkSoft">
            Pull request outreach but automated. Write one email, send it personalized to
            every brand on your list in minutes.
          </StyloireLead>
          <StyloireButton href="/dashboard" variant="solid">
            My portal
          </StyloireButton>
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireHeading as="h2" level="title">
            The problem
          </StyloireHeading>
          <p className="mx-auto mt-10 max-w-styloire-prose font-sans text-[clamp(1.45rem,3vw,2.2rem)] font-light leading-tight text-styloire-inkSoft">
            The average stylist sends 100–500 emails per project. Most of them are copy and
            paste.
          </p>
          <StyloireLead className="mt-10">There&apos;s a better way.</StyloireLead>
        </div>
      </StyloireSection>

      <StyloireSection tone="deep">
        <div className="mx-auto mb-20 max-w-styloire-narrow text-center">
          <StyloireHeading level="title">How it works</StyloireHeading>
          <Link
            href="/how-it-works"
            className="mt-8 inline-block font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-champagneMuted underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-champagneLight"
          >
            View all steps
          </Link>
        </div>
        <div className="mx-auto grid max-w-styloire gap-12 md:grid-cols-3">
          {threeSteps.map((col) => (
            <article
              key={col.title}
              className="border border-styloire-lineSubtle px-8 py-12 text-center transition-colors duration-styloire ease-styloire hover:border-styloire-champagne/30"
            >
              <h3 className="font-serif text-xl font-light italic text-styloire-inkSoft md:text-2xl">
                {col.title}
              </h3>
              <p className="mt-6 font-sans text-sm font-light leading-relaxed text-styloire-inkSoft">
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
          <StyloireBody className="text-styloire-inkSoft">
            Styloire is currently in development. Join our early access list for product updates
            and founding member pricing.
          </StyloireBody>
          <div className="flex flex-wrap justify-center gap-4">
            <StyloireButton href="/contact" variant="solid">
              Contact us
            </StyloireButton>
            <StyloireButton href="/contact" variant="outline">
              Book a walkthrough
            </StyloireButton>
          </div>
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
