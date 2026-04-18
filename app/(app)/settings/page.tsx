import { StyloireAppPageHeader } from "@/components/styloire/app-shell";
import { StyloireButton } from "@/components/styloire/button";
import { StyloirePanel } from "@/components/styloire/panel";
import { MOCK_USER } from "@/lib/styloire/mock-data";

export default function SettingsPage() {
  return (
    <>
      <StyloireAppPageHeader
        title="Account & billing"
        description="Name, sign-in, and billing — available once accounts and payments are live."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <StyloirePanel>
          <h2 className="font-serif text-xl text-styloire-ink">Profile</h2>
          <dl className="mt-6 space-y-4 font-sans text-sm font-light text-styloire-inkSoft">
            <div>
              <dt className="text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Name
              </dt>
              <dd className="mt-1 text-styloire-ink">{MOCK_USER.name}</dd>
            </div>
            <div>
              <dt className="text-styloire-caption uppercase tracking-styloireWide text-styloire-inkMuted">
                Email
              </dt>
              <dd className="mt-1 text-styloire-ink">{MOCK_USER.email}</dd>
            </div>
          </dl>
          <StyloireButton type="button" className="mt-8" variant="outline" disabled>
            Change password
          </StyloireButton>
        </StyloirePanel>

        <StyloirePanel>
          <h2 className="font-serif text-xl text-styloire-ink">Subscription</h2>
          <p className="mt-4 font-sans text-sm font-light text-styloire-inkSoft">
            Plan: <span className="text-styloire-ink">Styloire Pro — $20/month</span>
            <br />
            Status:{" "}
            <span className="uppercase tracking-wide text-styloire-ink">
              {MOCK_USER.subscription_status}
            </span>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <StyloireButton type="button" variant="solid" disabled>
              Open billing portal
            </StyloireButton>
            <StyloireButton type="button" variant="outline" disabled>
              Cancel subscription
            </StyloireButton>
          </div>
        </StyloirePanel>
      </div>
    </>
  );
}
