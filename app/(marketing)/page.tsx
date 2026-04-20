import Link from "next/link";
import {
  StyloireBody,
  StyloireButton,
  StyloireSection,
  StyloireImageSection,
  StyloireHero
} from "@/components/styloire";

const IMG_HERO = "url('/images/hero.jpeg')";
const IMG_HOW = "url('/images/how-it-works.jpeg')";
const IMG_WHO = "url('/images/who-for.jpeg')";

/** Shared class for large editorial band headings (~5rem desktop) */
const BIG = "font-serif text-[clamp(3rem,6.5vw,5.5rem)] font-semibold uppercase leading-none tracking-[0.08em]";

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
        <StyloireHero className="max-w-[64rem] gap-4">
          {/* STYLOIRE is the large hero title */}
          <h1 className="font-serif text-[clamp(5rem,13vw,10rem)] font-semibold uppercase leading-[0.92] tracking-[-0.02em] text-white">
            Styloire
          </h1>
          {/* Subtitle */}
          <p className="font-serif text-[clamp(1.2rem,2.8vw,2.2rem)] font-light italic leading-tight text-white/85">
            Make Emailing Simple.
          </p>
          {/* Body */}
          <p className="max-w-[38rem] font-sans text-[clamp(0.85rem,1.4vw,0.98rem)] font-light leading-relaxed text-white/70">
            Pull request outreach but automated. Write one email, send it
            personalized to every brand on your list in minutes.
          </p>
          <StyloireButton
            href="/dashboard"
            variant="outline"
            className="mt-1 border-white/55 bg-white/10 px-12 py-3 text-[0.63rem] tracking-[0.22em] text-white hover:border-white/85 hover:bg-white/18"
          >
            Get Started
          </StyloireButton>
        </StyloireHero>
      </StyloireImageSection>

      {/* ─── THE PROBLEM ─────────────────────────────────────────────── */}
      <StyloireSection tone="solid" className="py-[clamp(4rem,8vw,7rem)]">
        <div className="mx-auto max-w-[56rem] text-center">
          <h2 className={`${BIG} mb-7 text-styloire-ink`}>The Problem</h2>
          <p className="font-serif text-[clamp(1.1rem,2.4vw,1.85rem)] font-light leading-[1.2] text-styloire-inkSoft">
            The average stylist sends{" "}
            <span className="text-styloire-ink">100–500 emails</span> per
            project. Most of them are copy and paste.
          </p>
          <p className="mt-8 font-serif text-[clamp(1rem,2vw,1.55rem)] font-light italic text-styloire-champagneLight">
            There&apos;s a better way.
          </p>
        </div>
      </StyloireSection>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────── */}
      <StyloireImageSection
        imageUrl={IMG_HOW}
        overlay="heavy"
        position="center 40%"
        className="min-h-[min(55vh,32rem)] py-[clamp(4rem,8vw,6rem)]"
      >
        <div className="mx-auto w-full max-w-styloire px-6 md:px-10">
          <div className="mb-10 text-center">
            <h2 className={`${BIG} text-white`}>How It Works</h2>
          </div>
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {threeSteps.map((step) => (
              <article key={step.index} className="text-center">
                <p className="mb-3 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/45">
                  {step.index}
                </p>
                <h3 className="font-serif text-[clamp(1.2rem,2vw,1.65rem)] font-semibold italic leading-[1.12] text-white">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-[22rem] font-sans text-[clamp(0.82rem,1.3vw,0.95rem)] font-light leading-relaxed text-white/75">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </StyloireImageSection>

      {/* ─── FEATURES ────────────────────────────────────────────────── */}
      <StyloireSection tone="deep" className="py-[clamp(4rem,8vw,7rem)]">
        <StyloireHero className="max-w-[52rem] gap-5">
          <h2 className={`${BIG} text-styloire-champagneLight`}>Features</h2>
          <p className="font-serif text-[clamp(1rem,2vw,1.45rem)] font-light italic text-styloire-champagneLight">
            Everything you need. Nothing you don&apos;t.
          </p>
          <ul className="w-full max-w-[38rem] space-y-4 text-left">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-4 font-sans text-[clamp(0.88rem,1.5vw,1.02rem)] font-light leading-relaxed text-styloire-inkSoft"
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
            className="font-sans text-[0.63rem] font-semibold uppercase tracking-[0.22em] text-styloire-champagneMuted underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-champagneLight"
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
        className="min-h-[min(52vh,30rem)] py-[clamp(4rem,8vw,6rem)]"
      >
        <div className="mx-auto max-w-[52rem] text-center">
          <h2 className={`${BIG} text-white`}>Who It&apos;s For</h2>
          <p className="mt-6 font-serif text-[clamp(1rem,2vw,1.5rem)] font-semibold italic text-white/90">
            Built for stylists, by someone who gets it.
          </p>
          <p className="mx-auto mt-4 max-w-[38rem] font-sans text-[clamp(0.82rem,1.3vw,0.95rem)] font-light leading-relaxed text-white/75">
            Whether you&apos;re dressing talent for a red carpet, an editorial
            shoot, or a commercial campaign — your time belongs on set, in the
            showroom, making selects. Not in your inbox. Styloire was built for
            the people behind the looks.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
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
      <StyloireSection tone="solid" className="py-[clamp(4rem,8vw,7rem)]">
        <StyloireHero className="max-w-[44rem] gap-5">
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-tight tracking-[0.06em] text-styloire-champagneLight">
            Ready to Join?
          </h2>
          <StyloireBody className="text-[clamp(0.88rem,1.5vw,1rem)] text-styloire-inkSoft">
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
