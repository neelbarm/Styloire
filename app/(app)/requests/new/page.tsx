import { NewRequestWizard } from "@/components/app/new-request-wizard";
import { listClientProfileSummaries } from "@/lib/data/profile-queries";

export default async function NewRequestPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const profiles = await listClientProfileSummaries();
  const profileId =
    typeof searchParams?.profile === "string" ? searchParams.profile : undefined;

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-serif text-[clamp(4rem,8vw,6.9rem)] font-semibold uppercase leading-[0.88] tracking-[-0.035em] text-styloire-champagneLight">
          Send a new request
        </h1>
      </div>
      <div className="mx-auto max-w-[52rem]">
        <NewRequestWizard initialProfiles={profiles} initialProfileId={profileId} />
      </div>
    </>
  );
}
