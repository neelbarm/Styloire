import {
  StyloireBody,
  StyloireButton,
  StyloireEyebrow,
  StyloireHeading,
  StyloireHero,
  StyloireImageSection,
  StyloireSection
} from "@/components/styloire";

const IMG_INTRO = "url('/images/editorial-bw.jpeg')";
const IMG_PROFILES = "url('/images/stylist-rack.jpeg')";
const IMG_CTA = "url('/images/dress-motion.jpeg')";

const steps = [
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
    body: "Every email lands personalized, professional, and on time. Styloire tracks sent, opened, and responded status so your team stays aligned."
  }
];

const reassurances = [
  "No technical setup required",
  "Works from any device",
  "Your contacts stay private — always."
];

export default function HowItWorksPage() {
  return (
    <>
      {/* ─── HERO IMAGE BAND ───────────────────────────────────────── */}
      <StyloireImageSection
        imageUrl={IMG_INTRO}
        overlay="heavy"
        position="center 35%"
        className="min-h-[min(70vh,40rem)] pt-28"
      >
        <StyloireHero className="max-w-[52rem] gap-6">
          <StyloireEyebrow className="text-white/55">How it works</StyloireEyebrow>
          <h1 className="font-serif text-[clamp(3.2rem,7vw,6rem)] font-semibold uppercase leading-none tracking-[-0.02em] text-white">
            How it works
          </h1>
          <StyloireBody className="max-w-[38rem] text-[clamp(0.9rem,1.6vw,1.05rem)] text-white/75">
            You know the drill. A new project lands and suddenly you are staring
            down a long brand list, copying and pasting the same email. Styloire
            was built to end that.
          </StyloireBody>
        </StyloireHero>
      </StyloireImageSection>

      {/* ─── NUMBERED STEPS ────────────────────────────────────────── */}
      <StyloireSection tone="deep" className="py-[clamp(5rem,10vw,8rem)]">
        <div className="mx-auto max-w-[52rem] space-y-14">
          {steps.map((step, i) => (
            <article
              key={step.index}
              className={`grid gap-6 md:grid-cols-[4rem_1fr] ${
                i !== steps.length - 1
                  ? "border-b border-styloire-lineSubtle pb-14"
                  : ""
              }`}
            >
              <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-styloire-champagne/60 md:pt-[0.3em]">
                {step.index}
              </p>
              <div>
                <h2 className="font-serif text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold italic leading-[1.15] text-styloire-champagneLight">
                  {step.title}
                </h2>
                <p className="mt-3 font-sans text-[clamp(0.88rem,1.5vw,1rem)] font-light leading-relaxed text-styloire-inkSoft">
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </StyloireSection>

      {/* ─── CLIENT PROFILES CALLOUT ───────────────────────────────── */}
      <StyloireImageSection
        imageUrl={IMG_PROFILES}
        overlay="heavy"
        position="center 40%"
        className="min-h-[min(60vh,36rem)] py-[clamp(4rem,8vw,7rem)]"
      >
        <div className="mx-auto max-w-[46rem] text-center">
          <StyloireEyebrow className="mb-4 text-white/55">Client profiles</StyloireEyebrow>
          <StyloireHeading level="title" className="text-white">
            And it gets better over time.
          </StyloireHeading>
          <StyloireBody className="mt-5 max-w-[38rem] text-[clamp(0.88rem,1.6vw,1.02rem)] text-white/75">
            Every contact list you upload becomes a saved client profile. So the
            next time you&apos;re pulling for the same talent, your brand
            contacts, response history, and past requests are already there
            waiting for you. The longer you use Styloire, the smarter it gets.
          </StyloireBody>
        </div>
      </StyloireImageSection>

      {/* ─── REASSURANCE STRIP ─────────────────────────────────────── */}
      <StyloireSection tone="solid" className="py-[clamp(3rem,6vw,5rem)]">
        <div className="mx-auto flex max-w-styloire flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-16">
          {reassurances.map((line) => (
            <p
              key={line}
              className="font-serif text-[clamp(0.95rem,1.6vw,1.1rem)] italic text-styloire-champagneLight"
            >
              {line}
            </p>
          ))}
        </div>
      </StyloireSection>

      {/* ─── BOTTOM CTA IMAGE BAND ─────────────────────────────────── */}
      <StyloireImageSection
        imageUrl={IMG_CTA}
        overlay="heavy"
        position="center 30%"
        className="min-h-[min(55vh,32rem)] py-[clamp(4rem,8vw,7rem)]"
      >
        <StyloireHero className="max-w-[42rem] gap-7">
          <StyloireHeading level="title" className="text-white">
            Ready when you are.
          </StyloireHeading>
          <StyloireBody className="text-[clamp(0.88rem,1.5vw,1rem)] text-white/72">
            Open the app and send your first request in minutes.
          </StyloireBody>
          <div className="flex flex-wrap justify-center gap-4">
            <StyloireButton
              href="/dashboard"
              variant="outline"
              className="border-white/55 bg-white/10 text-[0.63rem] tracking-[0.22em] text-white hover:border-white/85 hover:bg-white/18"
            >
              My Portal
            </StyloireButton>
            <StyloireButton
              href="/contact"
              variant="outline"
              className="border-white/55 bg-white/10 text-[0.63rem] tracking-[0.22em] text-white hover:border-white/85 hover:bg-white/18"
            >
              Contact Us
            </StyloireButton>
          </div>
        </StyloireHero>
      </StyloireImageSection>
    </>
  );
}
