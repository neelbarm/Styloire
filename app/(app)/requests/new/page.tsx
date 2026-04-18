import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { NewRequestWizard } from "@/components/app/new-request-wizard";

export default function NewRequestPage() {
  return (
    <>
      <StyloireAppPageHeader
        title="New request"
        description="Mirrors onboarding flow §4.2 — talent + event, CSV import with brand toggles, template preview, optional follow-up scheduling. Sending waits on SendGrid."
      />
      <NewRequestWizard />
    </>
  );
}
