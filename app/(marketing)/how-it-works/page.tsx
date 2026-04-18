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
          <StyloireEyebrow>Product tour</StyloireEyebrow>
          <StyloireHeading as="h1" level="title">
            How it works
          </StyloireHeading>
          <StyloireBody className="mt-6">
            One calm path from blank page to sent box — whether you are dressing a new face
            or returning to a saved client profile.
          </StyloireBody>
        </div>
      </StyloireSection>

      <StyloireSection tone="deep">
        <StyloireSteps
          steps={[
            {
              index: "01",
              title: "Create a request",
              body: "Give the project a name; add talent, event, or publication. Styloire already knows how your subject lines should read."
            },
            {
              index: "02",
              title: "Upload your contacts",
              body: "Import brand PR spreadsheets (Brand Name, Email, optional contact name) without reformatting or complicated imports."
            },
            {
              index: "03",
              title: "Write your email once",
              body: "Use pre-written pull request templates or write custom copy. Every email is personalized per brand without manual copy-pasting."
            },
            {
              index: "04",
              title: "Hit send",
              body: "Emails go out personalized and on time. Styloire handles tracking (opens, responses) and flags threads that need follow-up."
            },
            {
              index: "05",
              title: "Schedule your follow-up",
              body: "Automatically send follow-ups on a date you pick to brands that have not responded."
            }
          ]}
        />
      </StyloireSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow border border-styloire-lineSubtle bg-styloire-canvas/40 px-8 py-12 text-center ring-1 ring-styloire-champagne/[0.06]">
          <StyloireHeading level="section">Client profiles</StyloireHeading>
          <StyloireBody className="mt-4">
            Every upload becomes a living directory for that talent — editable contacts, bulk
            CSV merges with dedupe by email, and a timeline of past Requests so assistants know
            what already went out the door.
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
          <StyloireBody>Open the app to start a request, or write us if you need a hand.</StyloireBody>
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
