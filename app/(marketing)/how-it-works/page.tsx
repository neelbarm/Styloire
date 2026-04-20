import {
  StyloireBody,
  StyloireButton,
  StyloireEyebrow,
  StyloireHeading,
  StyloireHero,
  StyloireSection,
  StyloireSteps
} from "@/components/styloire";

export default function HowItWorksPage() {
  return (
    <>
      <StyloireSection tone="solid" className="pt-24">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireEyebrow>How it works</StyloireEyebrow>
          <StyloireHeading as="h1" level="title">
            How it works
          </StyloireHeading>
          <StyloireBody className="mt-6">
            You know the drill. A new project lands, and suddenly you are staring down a long
            brand list, copying and pasting the same email. Styloire was built to end that.
          </StyloireBody>
        </div>
      </StyloireSection>

      <StyloireSection tone="deep">
        <StyloireSteps
          steps={[
            {
              index: "01",
              title: "Start here: Create a request",
              body: "Give your project a name. Add your talent and the event or publication. That's it — Styloire already knows how your subject lines should read."
            },
            {
              index: "02",
              title: "Your list, your way: Upload your contacts",
              body: "Drop in your brand PR spreadsheet — Brand Name, Email, and an optional contact name for a personal touch. No reformatting, no complicated imports."
            },
            {
              index: "03",
              title: "The part you'll love: Write your email once",
              body: "Use one of our pre-written pull request templates or write your own. Every email goes out personalized per brand — no copy paste, no manual edits."
            },
            {
              index: "04",
              title: "Watch it go: Hit send",
              body: "Every email lands personalized, professional, and on time. Styloire tracks sent, opened, and responded status so your team can stay aligned."
            }
          ]}
        />
      </StyloireSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow border border-styloire-lineSubtle bg-styloire-canvas/40 px-8 py-12 text-center ring-1 ring-styloire-champagne/[0.06]">
          <StyloireHeading level="section">Client profiles</StyloireHeading>
          <StyloireBody className="mt-4">
            Every contact list you upload becomes a saved client profile. Next time you are
            pulling for the same talent, contacts, request history, and response history are
            already there waiting for you.
          </StyloireBody>
        </div>
      </StyloireSection>

      <StyloireSection tone="deep">
        <div className="mx-auto flex max-w-styloire flex-col flex-wrap items-center justify-center gap-8 text-center sm:flex-row sm:gap-16">
          {["No setup required", "Works anywhere", "Your contacts stay private"].map((line) => (
            <p
              key={line}
              className="font-serif text-lg italic text-styloire-champagneLight md:text-xl"
            >
              {line}
            </p>
          ))}
        </div>
      </StyloireSection>

      <StyloireSection tone="solid" className="pb-24">
        <StyloireHero>
          <StyloireHeading level="title">Ready when you are.</StyloireHeading>
          <StyloireBody>Open the app to send your first request in minutes.</StyloireBody>
          <div className="flex flex-wrap justify-center gap-4">
            <StyloireButton href="/dashboard" variant="solid">
              My portal
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
