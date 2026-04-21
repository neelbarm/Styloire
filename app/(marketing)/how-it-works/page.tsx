import { StyloireButton } from "@/components/styloire";

const IMG_STEPS = "url('/images/how-it-works.jpeg')";
const IMG_STRIP = "url('/images/mesh-fabric.jpeg')";

const steps = [
  {
    index: "01",
    title: "Start Here : Create a Request",
    body: "Give your project a name. Add your talent and the event or publication. That's it - Styloire already knows how your subject lines should read."
  },
  {
    index: "02",
    title: "Your List Your Way: Upload Your Contacts",
    body: "Drop in your brand PR spreadsheet - Brand Name, Email, and an optional contact name for a personal touch. No reformatting, no complicated imports."
  },
  {
    index: "03",
    title: "The Part You'll Love: Write Your Email Once",
    body: "Use one of our pre-written pull request templates or write your own. Every email will go out personalized per brand - no copy paste, no manual edits."
  },
  {
    index: "04",
    title: "Watch It Go: Hit Send",
    body: "Every email lands personalized, professional, and on time. Styloire handles the rest."
  }
];

const reassurances = [
  "No technical setup required",
  "Works from any device",
  "Your contacts stay private - always."
];

export default function HowItWorksPage() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(14,14,14,0.18), rgba(14,14,14,0.18)), ${IMG_STEPS}`,
          backgroundPosition: "center 12%",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto max-w-[62rem] px-6 pb-16 pt-28 md:px-10 md:pb-20 md:pt-32">
          <h1 className="text-center font-serif text-[clamp(3.6rem,7vw,5.8rem)] font-semibold uppercase leading-none tracking-[0.02em] text-white">
            How It Works
          </h1>
          <div className="mx-auto mt-4 h-px w-full max-w-[52rem] bg-white/55" />

          <div className="mt-10 space-y-7 md:mt-12 md:space-y-9">
            {steps.map((step) => (
              <article
                key={step.index}
                className="grid items-start gap-3 md:grid-cols-[5rem_1fr]"
              >
                <p className="text-center font-serif text-[clamp(2.8rem,6vw,4.25rem)] font-semibold leading-none text-white/92 md:pt-1">
                  {step.index}
                </p>
                <div className="text-center">
                  <h2 className="font-serif text-[clamp(1.15rem,2.2vw,1.85rem)] font-medium leading-[1.08] text-white">
                    {step.title}
                  </h2>
                  <p className="mx-auto mt-2 max-w-[33rem] font-sans text-[0.82rem] font-light leading-[1.38] text-white/88 md:text-[0.95rem]">
                    {step.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#27282a] px-6 py-16 text-center text-[#f2eadf] md:px-10 md:py-20">
        <div className="mx-auto max-w-[48rem]">
          <h2 className="font-serif text-[clamp(2.6rem,6vw,4.9rem)] font-semibold uppercase leading-none tracking-[0.02em] text-[#efe4d5]">
            Client Profiles
          </h2>
          <p className="mt-4 font-serif text-[clamp(1.05rem,2vw,1.45rem)] font-light italic text-[#ddd1c2]">
            And it gets better over time.
          </p>
          <p className="mx-auto mt-5 max-w-[38rem] font-serif text-[clamp(1.15rem,2.6vw,2rem)] font-light leading-[1.07] text-[#f3eee8]">
            Every contact list you upload becomes a saved client profile. So the
            next time you&apos;re pulling for the same talent, your brand
            contacts, response history, and past requests are already there
            waiting for you.
          </p>
          <p className="mt-5 font-serif text-[clamp(1.15rem,2.6vw,2rem)] font-light leading-[1.07] text-[#f3eee8]">
            The longer you use Styloire, the smarter it gets.
          </p>
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08)), ${IMG_STRIP}`,
          backgroundPosition: "center 42%",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto flex max-w-[70rem] flex-col items-center justify-between gap-5 px-6 py-10 text-center md:flex-row md:px-10 md:py-12">
          {reassurances.map((line) => (
            <p
              key={line}
              className="font-serif text-[0.92rem] font-light italic text-white/88 md:text-[1.02rem]"
            >
              {line}
            </p>
          ))}
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
        </div>
      </section>
    </>
  );
}
