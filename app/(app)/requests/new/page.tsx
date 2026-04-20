import { NewRequestWizard } from "@/components/app/new-request-wizard";

export default function NewRequestPage() {
  return (
    <>
      <div className="mb-10">
        <h1 className="font-serif text-[clamp(3.2rem,7vw,5.4rem)] font-semibold uppercase leading-none tracking-[-0.015em] text-styloire-ink">
          Send a new request
        </h1>
      </div>
      <NewRequestWizard />
    </>
  );
}
