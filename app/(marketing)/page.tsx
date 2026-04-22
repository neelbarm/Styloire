import Link from "next/link";
import { StyloireButton } from "@/components/styloire";

const IMG_HERO = "url('/images/who-for.jpeg')";
const IMG_HOW = "url('/images/editorial-bw.jpeg')";
const IMG_WHO = "url('/images/pearl-necklace.jpeg')";

const threeSteps = [
  {
    title: "Create your request",
    body: "Enter your talent and event. Styloire automatically formats your subject line."
  },
  {
    title: "Upload your contacts",
    body: "Drop in your brand list and create a client profile for easy future outreach. No sample spreadsheet setup or manual reformatting required."
  },
  {
    title: "And hit send",
    body: "Every email goes out on time with each brand's contact. No manual send needed."
  }
];

const features = [
  "Auto-generated subject lines in industry format",
  "Personalized emails per brand - no copy paste",
  "Contacts grouped into reusable client profiles"
];

const sectionTitle =
  "font-serif text-[clamp(2.4rem,6vw,4.9rem)] font-semibold uppercase leading-none tracking-[0.02em]";

export default function MarketingHomePage() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden bg-[#1d1815] text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(14,10,9,0.18), rgba(14,10,9,0.18)), ${IMG_HERO}`,
          backgroundPosition: "center 38%",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto flex min-h-[34rem] w-full max-w-[76rem] flex-col items-center justify-center px-6 pb-16 pt-32 text-center md:min-h-[43rem] md:px-10 md:pb-20 md:pt-36">
          <h1 className="font-serif text-[clamp(4.4rem,10vw,6.9rem)] font-semibold uppercase leading-[0.88] tracking-[-0.03em] text-white">
            Styloire
          </h1>
          <p className="mt-3 font-serif text-[clamp(1.02rem,2vw,1.5rem)] font-light italic text-white/88">
            Make Emailing Simple
          </p>
          <p className="mt-4 max-w-[30rem] font-sans text-[0.85rem] font-light leading-[1.45] text-white/78 md:text-[0.93rem]">
            Pull request outreach but automated. Write one email, send it
            personalized to every brand on your list in minutes.
          </p>
          <StyloireButton
            href="/dashboard"
            variant="outline"
            className="mt-7 min-w-[11rem] border-white/30 bg-white/12 px-8 py-2 text-[0.54rem] tracking-[0.2em] text-white backdrop-blur-sm hover:border-white/42 hover:bg-white/18"
          >
            Get Started
          </StyloireButton>
        </div>
      </section>

      <section className="bg-[#27282a] px-6 py-16 text-center text-[#f2eadf] md:px-10 md:py-20">
        <div className="mx-auto max-w-[48rem]">
          <h2 className={`${sectionTitle} text-[#efe4d5]`}>The Problem</h2>
          <p className="mx-auto mt-6 max-w-[31rem] font-serif text-[clamp(1.3rem,3vw,2.25rem)] font-light leading-[1.08] text-[#f3eee8]">
            The average stylist sends 100-500 emails per project. Most of them
            are copy and paste.
          </p>
          <p className="mt-7 font-serif text-[clamp(1.2rem,2.3vw,1.9rem)] font-light italic text-[#ddd1c2]">
            There&apos;s a better way.
          </p>
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(11,9,9,0.14), rgba(11,9,9,0.14)), ${IMG_HOW}`,
          backgroundPosition: "center 34%",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto max-w-[78rem] px-6 py-16 md:px-10 md:py-20">
          <h2 className={`${sectionTitle} text-center text-white`}>How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-8">
            {threeSteps.map((step) => (
              <article key={step.title} className="text-center">
                <h3 className="font-serif text-[clamp(1.1rem,2vw,1.6rem)] font-semibold italic leading-[1.1] text-white">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-[18rem] font-sans text-[0.8rem] font-light leading-[1.45] text-white/82 md:text-[0.88rem]">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#27282a] px-6 py-16 text-center text-[#f2eadf] md:px-10 md:py-20">
        <div className="mx-auto max-w-[48rem]">
          <h2 className={`${sectionTitle} text-[#efe4d5]`}>Features</h2>
          <p className="mt-4 font-serif text-[clamp(1rem,2vw,1.55rem)] font-light italic text-[#ddd1c2]">
            Everything you need. Nothing you don&apos;t.
          </p>
          <ul className="mx-auto mt-6 max-w-[35rem] space-y-1.5 text-left font-sans text-[0.86rem] font-light leading-[1.45] text-[#f1ede7] md:text-[0.96rem]">
            {features.map((feature) => (
              <li key={feature}>- {feature}</li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(96,74,56,0.08), rgba(15,12,10,0.14)), ${IMG_WHO}`,
          backgroundPosition: "center 48%",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto max-w-[58rem] px-6 py-16 text-center md:px-10 md:py-20">
          <h2 className={`${sectionTitle} text-white`}>Who It&apos;s For</h2>
          <p className="mt-5 font-serif text-[clamp(1.05rem,2vw,1.5rem)] font-light italic text-white/90">
            Built for stylists, by someone who gets it.
          </p>
          <p className="mx-auto mt-4 max-w-[35rem] font-sans text-[0.82rem] font-light leading-[1.42] text-white/82 md:text-[0.92rem]">
            Whether you&apos;re dressing talent for a red carpet, an editorial
            shoot, or a commercial campaign, your time belongs on set, in the
            showroom, making selects - not in your inbox. Styloire was built for
            the people behind the looks.
          </p>
        </div>
      </section>

      <section className="bg-[#27282a] px-6 py-14 text-center text-[#f2eadf] md:px-10 md:py-16">
        <div className="mx-auto max-w-[42rem]">
          <h2 className="font-serif text-[clamp(2.55rem,5vw,4.25rem)] font-semibold leading-none tracking-[-0.02em] text-[#efe4d5]">
            Ready to Join?
          </h2>
          <p className="mt-4 font-serif text-[clamp(1rem,1.9vw,1.45rem)] font-light italic text-[#ddd1c2]">
            Join today and send a new request in minutes.
          </p>
          <StyloireButton
            href="/dashboard"
            variant="outline"
            className="mt-7 min-w-[11rem] border-white/28 bg-white/12 px-8 py-2 text-[0.54rem] tracking-[0.2em] text-white backdrop-blur-sm hover:border-white/42 hover:bg-white/18"
          >
            Get Started
          </StyloireButton>
          <p className="mt-5 font-sans text-[0.66rem] uppercase tracking-[0.18em] text-white/54">
            <Link
              href="/privacy"
              className="underline-offset-4 transition-colors duration-styloire hover:text-white/82 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
