import { NewRequestWizard } from "@/components/app/new-request-wizard";

export default function NewRequestPage() {
  return (
    <>
      <div className="mb-7 text-center">
        <h1 className="font-serif text-[clamp(2.2rem,4.8vw,3.6rem)] font-semibold uppercase leading-[0.94] tracking-[-0.01em] text-styloire-champagneLight">
          Send a new request
        </h1>
        <p className="mt-2 font-sans text-[0.82rem] font-light text-white/45">
          5 steps — details, contacts, email, review, send.
        </p>
      </div>
      <div className="mx-auto max-w-4xl">
        <NewRequestWizard />
      </div>
    </>
  );
}
