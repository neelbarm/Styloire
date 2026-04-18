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
  "url('https://images.unsplash.com/photo-1509631179647-017733169239?auto=format&fit=crop&w=2400&q=80')";

const atelierImage =
  "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=80')";

const threeSteps = [
  {
    title: "Create request",
    body: "Name the talent and the moment — a carpet, an editorial, a fitting week. Styloire opens a single workspace for the entire pull."
  },
  {
    title: "Upload contacts",
    body: "Drop your CSV or XLSX. We parse brands, preview the roster, and save a private client profile you can reuse on the next job."
  },
  {
    title: "Write once",
    body: "Compose one note with merge fields. Every send is individually addressed with the subject line stylists already use: Talent / Event / Brand."
  }
];

const features = [
  "Personalized sends to 100–500 PR contacts in minutes, not hours",
  "Reusable client profiles per talent with deduped brand rows",
  "Default templates for standard pulls and follow-ups — plus your own library",
  "Optional scheduled follow-ups that only chase non-responses",
  "Open tracking via SendGrid webhooks; responses you mark as they land"
];

export default function MarketingHomePage() {
  return (
    <>
      <StyloireImageSection imageUrl={heroImage} position="center 24%">
        <StyloireHero>
          <StyloireEyebrow>Styloire · $20/month flat at launch</StyloireEyebrow>
          <StyloireHeading as="h1" level="display">
            Make emailing simple.
          </StyloireHeading>
          <StyloireLead>
            Write one email. Send it beautifully to every house on your list — personalized,
            on-brand, and fast enough for call time.
          </StyloireLead>
          <StyloireBody>
            Styloire is a web-based automation platform built exclusively for fashion stylists
            and assistants who still copy-and-paste pull requests one thread at a time.
          </StyloireBody>
          <StyloireButton href="/contact#waitlist" variant="solid">
            Join the waitlist
          </StyloireButton>
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireHeading level="title">The old way is a full-time job.</StyloireHeading>
          <p className="mt-8 font-serif text-xl font-light italic leading-relaxed text-styloire-inkSoft md:text-2xl">
            Between 100 and 500 emails per project — most of them the same sentence with a
            different name in the greeting line.
          </p>
          <StyloireBody className="mt-8">
            Styloire replaces the paste marathon with one composed note, dynamic fields, and
            sends that still feel hand-written because they are — you wrote the story once.
          </StyloireBody>
        </div>
      </StyloireSection>

      <StyloireSection tone="deep">
        <div className="mx-auto mb-16 max-w-styloire-narrow text-center">
          <StyloireEyebrow>At a glance</StyloireEyebrow>
          <StyloireHeading level="title">How it works</StyloireHeading>
          <StyloireBody>Three beats on the homepage — the full choreography lives on its own page.</StyloireBody>
          <Link href="/how-it-works" className="mt-6 inline-block font-sans text-styloire-caption uppercase tracking-styloireNav text-styloire-ink underline-offset-4 hover:underline">
            Read the five-step flow
          </Link>
        </div>
        <div className="mx-auto grid max-w-styloire gap-10 md:grid-cols-3">
          {threeSteps.map((col) => (
            <article
              key={col.title}
              className="border border-styloire-lineSubtle bg-styloire-canvas/40 px-6 py-10 text-center"
            >
              <h3 className="font-serif text-xl italic text-styloire-ink">{col.title}</h3>
              <p className="mt-4 font-sans text-sm font-light leading-relaxed text-styloire-inkSoft">
                {col.body}
              </p>
            </article>
          ))}
        </div>
      </StyloireSection>

      <StyloireImageSection imageUrl={atelierImage} overlay="heavy" position="center">
        <StyloireHero>
          <StyloireHeading level="title">What ships in V1</StyloireHeading>
          <StyloireList items={features} />
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireEyebrow>Who it is for</StyloireEyebrow>
          <StyloireHeading level="section">Built for the people behind the look.</StyloireHeading>
          <StyloireBody>
            Celebrity stylists balancing red carpet and commercial work, assistants who live
            inside inboxes on someone else’s behalf, and independent stylists building their
            own roster of relationships — everyone who needs pull requests out the door without
            losing the human touch.
          </StyloireBody>
        </div>
      </StyloireSection>

      <StyloireSection id="waitlist" tone="deep" className="scroll-mt-28 pb-24">
        <StyloireHero>
          <StyloireHeading level="display">Be first in line.</StyloireHeading>
          <StyloireLead>
            We are onboarding slowly with stylists who want the calm version of scale. Leave
            your email — we will send an invite when the workspace opens.
          </StyloireLead>
          <StyloireWaitlistForm />
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
