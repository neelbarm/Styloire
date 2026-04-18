import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { NewRequestWizard } from "@/components/app/new-request-wizard";

export default function NewRequestPage() {
  return (
    <>
      <StyloireAppPageHeader
        title="New request"
        description="Choose a new upload or existing roster profile, toggle contacts, preview templates, then schedule send."
      />
      <NewRequestWizard />
    </>
  );
}
