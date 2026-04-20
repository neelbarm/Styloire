import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { NewRequestWizard } from "@/components/app/new-request-wizard";

export default function NewRequestPage() {
  return (
    <>
      <StyloireAppPageHeader
        title="Send a new request"
        description="Create your request, upload contacts, write once, then schedule follow-up and send."
      />
      <NewRequestWizard />
    </>
  );
}
