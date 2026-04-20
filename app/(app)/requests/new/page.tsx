import { NewRequestWizard } from "@/components/app/new-request-wizard";

export default function NewRequestPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-serif text-[clamp(2.7rem,6vw,4.7rem)] font-semibold uppercase leading-[0.94] tracking-[-0.01em] text-styloire-champagneLight">
          Send a new request
        </h1>
      </div>
      <div className="mx-auto max-w-4xl">
        <NewRequestWizard />
      </div>
    </>
  );
}
