import { ContactForm } from "@/components/marketing/contact-form";

export default function ContactPage() {
  return (
    <>
      <section className="px-6 pb-16 pt-8 md:px-10">
        <div className="mx-auto max-w-[52rem] text-center">
          <h1 className="font-serif text-[clamp(4rem,8vw,6.8rem)] font-semibold uppercase leading-[0.88] tracking-[-0.03em] text-styloire-champagneLight">
            Get in touch
          </h1>
          <p className="mx-auto mt-4 max-w-[42rem] font-sans text-[clamp(1.15rem,2.3vw,1.45rem)] font-light leading-[1.12] text-white/78">
            Have a question, a suggestion, or just want to say hi? We&apos;d love to hear from you.
          </p>
          <div className="mt-10">
            <ContactForm />
          </div>
          <div className="mt-12 text-center">
            <p className="font-serif text-[clamp(1.05rem,2vw,1.45rem)] text-styloire-champagneLight">
              Prefer email? Reach us directly at hello@styloire.co
            </p>
            <p className="mt-3 font-serif text-[clamp(1.05rem,2vw,1.45rem)] text-styloire-champagneLight">
              Follow along on Instagram @styloire.co
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
