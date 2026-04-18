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
  StyloireSection,
  StyloireWaitlistForm
} from "@/components/styloire";

const heroImage =
  "url('https://images.unsplash.com/photo-1509631179647-017733169239?auto=format&fit=crop&w=2400&q=82')";

const atelierImage =
  "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=82')";

const threeSteps = [
  {
    title: "Create request",
    body: "Talent, event, one workspace. Nothing else on the screen until you need it."
  },
  {
    title: "Upload contacts",
    body: "CSV or spreadsheet in. Brands grouped, list checked, profile saved for the next season."
  },
  {
    title: "Write once",
    body: "One note, merge fields, subjects in the rhythm you already use: talent, event, house."
  }
];

const features = [
  "Hundreds of personalized sends from a single draft",
  "Client profiles per talent — private, yours alone",
  "Templates for first touch and follow-up, plus your own voice",
  "Follow-ups only where there is still silence",
  "Delivery and opens tracked; responses stay in your judgment"
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
          <StyloireLead>
            One letter. Every house addressed as it should be — without losing the afternoon
            to paste and pray.
          </StyloireLead>
          <StyloireBody>
            For stylists and assistants who still live inside pull requests, Styloire is the
            quiet layer between your sentence and their inbox.
          </StyloireBody>
          <StyloireButton href="/contact#waitlist" variant="solid">
            Join the waitlist
          </StyloireButton>
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireHeading as="h2" level="editorial">
            The old way is a full-time job.
          </StyloireHeading>
          <p className="mx-auto mt-10 max-w-styloire-prose font-serif text-xl font-light italic leading-relaxed text-styloire-inkSoft md:text-2xl">
            A hundred to five hundred messages a project — nearly the same line, a different
            name each time.
          </p>
          <StyloireBody className="mt-10">
            You still write the note. Styloire carries it to every thread with care — fields,
            subjects, and silence where there should be silence.
          </StyloireBody>
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
            className="mt-8 inline-block font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-inkMuted underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-ink"
          >
            The five steps
          </Link>
        </div>
        <div className="mx-auto grid max-w-styloire gap-12 md:grid-cols-3">
          {threeSteps.map((col) => (
            <article
              key={col.title}
              className="border border-styloire-lineSubtle px-8 py-12 text-center transition-colors duration-styloire ease-styloire hover:border-styloire-line"
            >
              <h3 className="font-serif text-xl font-light italic text-styloire-ink md:text-2xl">
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
          <StyloireHeading level="title">Included at launch</StyloireHeading>
          <StyloireList items={features} />
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireEyebrow>For</StyloireEyebrow>
          <StyloireHeading level="section">The people behind the look.</StyloireHeading>
          <StyloireBody className="mt-6">
            Red carpet, commercial, editorial — whoever holds the rail and whoever holds the
            inbox. If pull requests are your week, this is built for you.
          </StyloireBody>
        </div>
      </StyloireSection>

      <StyloireSection id="waitlist" tone="deep" className="scroll-mt-28 pb-28">
        <StyloireHero>
          <StyloireHeading level="display">Be first in line.</StyloireHeading>
          <StyloireLead>
            Invitations go out in small batches. Leave your address; we will write when there
            is a seat.
          </StyloireLead>
          <StyloireWaitlistForm />
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
