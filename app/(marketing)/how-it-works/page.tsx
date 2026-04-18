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
          <StyloireHeading as="h1" level="display">
            How Styloire runs a pull.
          </StyloireHeading>
          <StyloireBody>
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
              title: "Create request",
              body: "Start with talent and event. Styloire opens a Request — the atomic unit for every outreach campaign."
            },
            {
              index: "02",
              title: "Upload contacts",
              body: "Import CSV or XLSX. Preview grouped brands, confirm spelling, and let the system auto-save a Client Profile for that talent."
            },
            {
              index: "03",
              title: "Write email once",
              body: "Pick a template, personalize merge fields, and preview subjects in the Talent / Event / Brand rhythm stylists already use."
            },
            {
              index: "04",
              title: "Hit send",
              body: "SendGrid dispatches individual messages per PR contact. Each row updates with sent time for audit-friendly history."
            },
            {
              index: "05",
              title: "Schedule follow up",
              body: "Optionally set a follow-up date. A daily job chases only the contacts still marked as no response — using your default or custom copy."
            }
          ]}
        />
      </StyloireSection>

      <StyloireSection tone="solid">
        <div className="mx-auto max-w-styloire-narrow border border-styloire-lineSubtle bg-styloire-canvas/40 px-8 py-12 text-center">
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
              className="font-serif text-lg italic text-styloire-inkSoft md:text-xl"
            >
              {line}
            </p>
          ))}
        </div>
      </StyloireSection>

      <StyloireSection tone="solid" className="pb-24">
        <StyloireHero>
          <StyloireHeading level="title">Ready when you are.</StyloireHeading>
          <StyloireBody>Join the waitlist or explore the interactive prototype in the app preview.</StyloireBody>
          <div className="flex flex-wrap justify-center gap-4">
            <StyloireButton href="/contact#waitlist" variant="solid">
              Join waitlist
            </StyloireButton>
            <StyloireButton href="/dashboard" variant="outline">
              Open app preview
            </StyloireButton>
          </div>
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
