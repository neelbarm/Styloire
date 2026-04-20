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
  "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=82')";

const howImage =
  "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=82')";

const whoImage =
  "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=82')";

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
      <StyloireImageSection imageUrl={heroImage} position="center 18%" className="pt-24">
        <StyloireHero className="max-w-[62rem] gap-7">
          <p className="font-serif text-[clamp(4.4rem,10vw,7.6rem)] font-semibold uppercase leading-none tracking-[-0.02em] text-white">
            Styloire
          </p>
          <StyloireHeading as="h1" level="display" className="font-sans text-[clamp(1.8rem,3.5vw,2.7rem)] font-semibold tracking-[-0.01em] text-white">
            Make Emailing Simple
          </StyloireHeading>
          <StyloireLead className="max-w-4xl text-[clamp(1.5rem,2.5vw,2.2rem)] not-italic text-white">
            Pull request outreach but automated. Write one email, send it personalized to
            every brand on your list in minutes.
          </StyloireLead>
          <StyloireButton
            href="/dashboard"
            variant="outline"
            className="rounded-full border-white/60 bg-white/10 px-14 py-3 text-white hover:border-white hover:bg-white/20"
          >
            LIVE CTA text
          </StyloireButton>
        </StyloireHero>
      </StyloireImageSection>

      <StyloireSection tone="solid" className="py-[clamp(5.5rem,10vw,8rem)]">
        <div className="mx-auto max-w-styloire-narrow text-center">
          <StyloireHeading as="h2" level="title">
            The problem
          </StyloireHeading>
          <p className="mx-auto mt-10 max-w-styloire-prose font-sans text-[clamp(2rem,4vw,3rem)] font-light leading-[1.12] text-styloire-inkSoft">
            The average stylist sends 100–500 emails per project. Most of them are copy and
            paste.
          </p>
          <StyloireLead className="mt-12 text-[clamp(2rem,4vw,3rem)] text-styloire-champagneLight">
            There&apos;s a better way.
          </StyloireLead>
        </div>
      </StyloireSection>

      <section
        className="relative overflow-hidden py-[clamp(5rem,10vw,7.5rem)]"
        style={{
          backgroundImage: howImage,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
        }}
      >
        <div className="absolute inset-0 bg-black/45" aria-hidden />
        <div className="relative mx-auto max-w-styloire px-6 md:px-10">
          <StyloireHeading level="title" className="text-center text-white">
            How it works
          </StyloireHeading>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {threeSteps.map((col) => (
              <article key={col.title} className="text-center">
                <h3 className="font-serif text-[clamp(2rem,3.6vw,3.2rem)] font-semibold italic text-white">
                  {col.title}
                </h3>
                <p className="mx-auto mt-4 max-w-sm font-sans text-[clamp(1.2rem,2vw,1.7rem)] font-light leading-tight text-white">
                  {col.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <StyloireSection tone="solid">
        <StyloireHero className="max-w-[58rem]">
          <StyloireHeading level="title" className="text-styloire-ink">
            Features
          </StyloireHeading>
          <StyloireLead className="text-[clamp(2.1rem,4vw,3rem)] text-styloire-champagneLight">
            Everything you need. Nothing you don&apos;t.
          </StyloireLead>
          <StyloireList
            className="text-[clamp(1.8rem,2.8vw,2.45rem)] italic"
            items={features.map((f) => `- ${f}`)}
          />
          <Link
            href="/how-it-works"
            className="font-sans text-styloire-caption uppercase tracking-[0.2em] text-styloire-champagneMuted underline-offset-[5px] transition-colors duration-styloire ease-styloire hover:text-styloire-champagneLight"
          >
            View full process
          </Link>
        </StyloireHero>
      </StyloireSection>

      <section
        className="relative overflow-hidden py-[clamp(5rem,9vw,7rem)]"
        style={{
          backgroundImage: whoImage,
          backgroundSize: "cover",
          backgroundPosition: "center 24%",
        }}
      >
        <div className="absolute inset-0 bg-black/35" aria-hidden />
        <div className="relative mx-auto max-w-styloire px-6 text-center md:px-10">
          <StyloireHeading level="title" className="text-white">
            Who it&apos;s for
          </StyloireHeading>
          <StyloireLead className="mt-5 text-[clamp(2.1rem,3.8vw,3rem)] text-white">
            Built for stylists, by someone who gets it.
          </StyloireLead>
          <StyloireBody className="mt-6 max-w-[56rem] text-[clamp(1.5rem,2.5vw,2rem)] leading-tight text-white">
            Whether you&apos;re dressing talent for a red carpet, an editorial shoot, or a
            commercial campaign, your time belongs on set, in the showroom, making selects -
            not in your inbox. Styloire was built for the people behind the looks.
          </StyloireBody>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <StyloireButton href="/dashboard" variant="outline" className="rounded-full border-white/60 bg-white/10 text-white hover:border-white hover:bg-white/20">
              My portal
            </StyloireButton>
            <StyloireButton href="/contact" variant="outline" className="rounded-full border-white/60 bg-white/10 text-white hover:border-white hover:bg-white/20">
              Contact
            </StyloireButton>
          </div>
        </div>
      </section>

      <StyloireSection id="get-started" tone="deep" className="scroll-mt-28 pb-28">
        <StyloireHero>
          <StyloireHeading level="display">Ready to send?</StyloireHeading>
          <StyloireBody className="max-w-[44rem] text-[1.04rem] text-styloire-inkSoft">
            Open your portal and send a new request in minutes.
          </StyloireBody>
          <div className="flex flex-wrap justify-center gap-4">
            <StyloireButton href="/dashboard" variant="solid" className="px-10">
              My portal
            </StyloireButton>
            <StyloireButton href="/contact" variant="outline" className="px-10">
              Book a walkthrough
            </StyloireButton>
          </div>
        </StyloireHero>
      </StyloireSection>
    </>
  );
}
