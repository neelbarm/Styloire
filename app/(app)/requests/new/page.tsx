import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { NewRequestWizard } from "@/components/app/new-request-wizard";

export default function NewRequestPage() {
  return (
    <>
      <StyloireAppPageHeader
        title="New request"
        description="Talent and event, file import, template preview, optional follow-up — sending unlocks when your mail layer is ready."
      />
      <NewRequestWizard />
    </>
  );
}
