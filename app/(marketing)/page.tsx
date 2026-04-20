import Link from "next/link";
import {
  StyloireBody,
  StyloireButton,
  StyloireEyebrow,
  StyloireHeading,
  StyloireHero,
  StyloireImageSection,
  StyloireLead,
  StyloireSection
} from "@/components/styloire";

/**
 * Image slots — copy the raw files from the conversation into public/images/:
 *   public/images/hero.jpg          → runway / fashion show (wide landscape)
 *   public/images/how-it-works.jpg  → stylist looking at shoes on rack
 *   public/images/who-for.jpg       → heels walking (warm amber)
 */
const IMG_HERO = "url('/images/hero.jpeg')";
const IMG_HOW = "url('/images/how-it-works.jpeg')";
const IMG_WHO = "url('/images/who-for.jpeg')";

const threeSteps = [
  {
    index: "01",
    title: "Create your request",
    body: "Enter your talent and event. Styloire builds your subject lines automatically, in the exact format brands expect."
  },
  {
    index: "02",
    title: "Upload your contacts",
    body: "Drop in your brand PR list and create a client profile — set up once and saved forever. Just a simple spreadsheet."
  },
  {
    index: "03",
    title: "And hit send",
    body: "Every email goes out on time and in seconds. Track sent, opened, and responded status for each request."
  }
];

const features = [
  "Auto-generated subject lines in industry format",
  "Personalized emails per brand — no copy and paste",
  "Pre-written pull request templates",
  "Dashboard to track opens, responses, and status per project"
];

export default function MarketingHomePage() {
  return (
    <>
      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <StyloireImageSection
        imageUrl={IMG_HERO}
        overlay="heavy"
        position="center 30%"
        className="min-h-screen pt-28"
      >
        <StyloireHero className="max-w-[64rem] gap-6">
          <p className="font-sans text-[clamp(0.62rem,1.1vw,0.78rem)] font-semibold uppercase tracking-[0.38em] text-white/60">
            Styloire
          </p>
          <h1 className="font-serif text-[clamp(4.8rem,11vw,9rem)] font-semibold uppercase leading-none tracking-[-0.02em] text-white">
            Make Emailing<br className="hidden sm:block" /> Simple.
          </h1>
          <StyloireLead className="max-w-[42rem] text-[clamp(1rem,1.8vw,1.25rem)] not-italic leading-relaxed text-white/80">
            Pull request outreach but automated. Write one email, send it
            personalized to every brand on your list in minutes.
          </StyloireLead>
          <StyloireButton
            href="/dashboard"
            variant="outline"
            className="mt-2 border-white/55 bg-white/10 px-12 py-3 text-[0.63rem] tracking-[0.22em] text-white hover:border-white/85 hover:bg-white/18"
          >
            Get Started
          </StyloireButton>
        </StyloireHero>
      </StyloireImageSection>

      {/* ─── THE PROBLEM ─────────────────────────────────────────────── */}
      <StyloireSection tone="solid" className="py-[clamp(5rem,10vw,8rem)]">
        <div className="mx-auto max-w-[52rem] text-center">
          <StyloireEyebrow className="mb-8">The Problem</StyloireEyebrow>
          <p className="font-serif text-[clamp(1.9rem,4.2vw,3.2rem)] font-light leading-[1.14] tracking-[-0.01em] text-styloire-inkSoft">
            The average stylist sends{" "}
            <span className="text-styloire-ink">100–500 emails</span> per
            project. Most of them are copy and paste.
          </p>
          <p className="mt-10 font-serif text-[clamp(1.5rem,3vw,2.2rem)] font-light italic text-styloire-champagneLight">
            There&apos;s a better way.
          </p>
        </div>
      </StyloireSection>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────── */}
      <StyloireImageSection
        imageUrl={IMG_HOW}
        overlay="heavy"
        position="center 40%"
        className="min-h-[min(90vh,50rem)] py-[clamp(5rem,10vw,8rem)]"
      >
        <div className="mx-auto w-full max-w-styloire px-6 md:px-10">
          <div className="mb-12 text-center">
            <StyloireEyebrow className="mb-3 text-white/55">How It Works</StyloireEyebrow>
            <StyloireHeading level="title" className="text-white">
              How it works
            </StyloireHeading>
          </div>
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {threeSteps.map((step) => (
              <article key={step.index} className="text-center">
                <p className="mb-4 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/45">
                  {step.index}
                </p>
                <h3 className="font-serif text-[clamp(1.4rem,2.4vw,1.9rem)] font-semibold italic leading-[1.12] text-white">
                  {step.title}
                </h3>
                <p className="mx-auto mt-4 max-w-[22rem] font-sans text-[clamp(0.9rem,1.5vw,1.05rem)] font-light leading-relaxed text-white/75">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </StyloireImageSection>

      {/* ─── FEATURES ────────────────────────────────────────────────── */}
      <StyloireSection tone="deep" className="py-[clamp(5rem,10vw,8rem)]">
        <StyloireHero className="max-w-[52rem]">
          <StyloireEyebrow>Features</StyloireEyebrow>
          <StyloireHeading level="title" className="text-styloire-champagneLight">
            Features
          </StyloireHeading>
          <StyloireLead className="text-[clamp(1.05rem,2vw,1.35rem)] not-italic text-styloire-champagneLight">
            Everything you need. Nothing you don&apos;t.
          </StyloireLead>
          <ul className="mt-2 w-full max-w-[38rem] space-y-4 text-left">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-4 font-sans text-[clamp(0.9rem,1.6vw,1.05rem)] font-light leading-relaxed text-styloire-inkSoft"
              >
                <span
                  className="mt-[0.2em] shrink-0 select-none font-serif text-styloire-champagne/70"
                  aria-hidden
                >
                  —
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/how-it-works"
            className="mt-2 font-sans text-[0.63rem] font-semibold uppercase tracking-[0.22em] text-styloire-champagneMuted underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-champagneLight"
          >
            View full process →
          </Link>
        </StyloireHero>
      </StyloireSection>

      {/* ─── WHO IT'S FOR ────────────────────────────────────────────── */}
      <StyloireImageSection
        imageUrl={IMG_WHO}
        overlay="heavy"
        position="center 25%"
        className="min-h-[min(80vh,42rem)] py-[clamp(5rem,10vw,8rem)]"
      >
        <div className="mx-auto max-w-[48rem] text-center">
          <StyloireEyebrow className="mb-4 text-white/55">Who It&apos;s For</StyloireEyebrow>
          <StyloireHeading level="title" className="text-white">
            Who it&apos;s for
          </StyloireHeading>
          <StyloireLead className="mt-5 text-[clamp(1.05rem,2vw,1.3rem)] not-italic text-white/80">
            Built for stylists, by someone who gets it.
          </StyloireLead>
          <p className="mx-auto mt-5 max-w-[38rem] font-sans text-[clamp(0.88rem,1.5vw,1rem)] font-light leading-relaxed text-white/70">
            Whether you&apos;re dressing talent for a red carpet, an editorial
            shoot, or a commercial campaign — your time belongs on set, in the
            showroom, making selects. Not in your inbox. Styloire was built for
            the people behind the looks.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
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
        </div>
      </StyloireImageSection>

      {/* ─── BOTTOM CTA ──────────────────────────────────────────────── */}
      <StyloireSection tone="solid" className="py-[clamp(5rem,10vw,8rem)]">
        <StyloireHero className="max-w-[44rem]">
          <StyloireHeading level="title" className="text-styloire-champagneLight">
            Ready to Join?
          </StyloireHeading>
          <StyloireBody className="text-[clamp(0.92rem,1.6vw,1.05rem)] text-styloire-inkSoft">
            Join today and send a new request in minutes.
          </StyloireBody>
          <div className="flex flex-wrap justify-center gap-4">
            <StyloireButton href="/dashboard" variant="solid" className="px-10">
              Get Started
            </StyloireButton>
            <StyloireButton href="/contact" variant="outline" className="px-10">
              Book a Walkthrough
            </StyloireButton>
          </div>
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
