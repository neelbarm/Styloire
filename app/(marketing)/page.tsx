import Link from "next/link";
import {
  StyloireBody,
  StyloireButton,
  StyloireEyebrow,
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
    body: "Drop in your brand PR list and create a client profile — set up once and have it saved. Just a simple spreadsheet."
  },
  {
    title: "And hit send",
    body: "Every email goes out on time and in seconds. Follow-ups are scheduled automatically for anyone who does not respond."
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
          <StyloireEyebrow>Letters, not dashboards</StyloireEyebrow>
          <StyloireHeading as="h1" level="display">
            Make emailing simple.
          </StyloireHeading>
          <StyloireLead className="text-styloire-inkSoft">
            One letter. Every house addressed as it should be — without losing the afternoon
            to paste and pray.
          </StyloireLead>
          <StyloireBody className="text-styloire-inkSoft">
            For stylists and assistants who still live inside pull requests, Styloire is the
            quiet layer between your sentence and their inbox.
          </StyloireBody>
          <StyloireButton href="/dashboard" variant="solid">
            Get started
          </StyloireButton>
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireHeading as="h2" level="title">
            The problem
          </StyloireHeading>
          <StyloireBody className="mt-10">
            The average stylist sends 100–500 emails per project. Most of them are copy and
            paste.
          </StyloireBody>
          <StyloireLead className="mt-10">There&apos;s a better way.</StyloireLead>
        </div>
      </StyloireSection>

      <StyloireSection tone="deep">
        <div className="mx-auto mb-20 max-w-styloire-narrow text-center">
          <StyloireEyebrow>Process</StyloireEyebrow>
          <StyloireHeading level="title">How it works</StyloireHeading>
          <StyloireBody className="mt-4">
            Three movements here. The full sequence lives on its own page.
          </StyloireBody>
          <Link
            href="/how-it-works"
            className="mt-8 inline-block font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-champagneMuted underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-champagneLight"
          >
            The five steps
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
            commercial campaign, your time belongs on set, in the showroom, making selects —
            not in your inbox. Styloire was built for the people behind the looks.
          </StyloireBody>
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection id="get-started" tone="deep" className="scroll-mt-28 pb-28">
        <StyloireHero>
          <StyloireHeading level="display">Start when you&apos;re ready.</StyloireHeading>
          <StyloireLead>Open your workspace and run a pull in minutes.</StyloireLead>
          <div className="flex flex-wrap justify-center gap-4">
            <StyloireButton href="/dashboard" variant="solid">
              Get started
            </StyloireButton>
            <StyloireButton href="/contact" variant="outline">
              Contact
            </StyloireButton>
          </div>
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
