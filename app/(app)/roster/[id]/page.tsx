import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileWithContacts } from "@/lib/styloire/mock-data";
import { ProfileContactsClient } from "@/components/app/profile-contacts-client";

// ─── Shared style tokens ──────────────────────────────────────────────────────
const thCls =
  "px-4 py-3 text-left font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/42";
const tdCls = "px-4 py-3 font-sans text-[0.88rem] text-white/78 align-middle";

function formatSendDate(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RosterDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const bundle = getProfileWithContacts(params.id);
  if (!bundle) notFound();
  const { profile, contacts, requests } = bundle;
  const rawTab = searchParams?.tab;
  const tab = typeof rawTab === "string" && rawTab === "history" ? "history" : "contacts";

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="mb-7 text-center">
        <h1 className="font-serif text-[clamp(1.9rem,3.8vw,2.8rem)] font-semibold uppercase leading-[0.94] tracking-[-0.01em] text-styloire-champagneLight">
          Manage profile
        </h1>
      </div>

      <div className="mx-auto max-w-[54rem]">
        {/* ── BACK LINK ───────────────────────────────────────────────── */}
        <Link
          href="/roster"
          className="mb-4 inline-flex items-center gap-1 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-white/42 transition-colors duration-styloire hover:text-styloire-champagneLight"
        >
          ← Back to My Roster
        </Link>

        {/* ── PROFILE IDENTITY ────────────────────────────────────────── */}
        <div className="mb-5">
          <h2 className="font-serif text-[clamp(1.5rem,3vw,2.2rem)] font-semibold leading-[1.05] text-styloire-champagneLight">
            {profile.talent_name}
          </h2>
          <p className="mt-1 font-sans text-[0.8rem] text-white/48">
            {contacts.length} brand contact{contacts.length !== 1 ? "s" : ""} ·{" "}
            {requests.length} past request{requests.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── TAB BAR ─────────────────────────────────────────────────── */}
        <div className="border-b border-white/14">
          <div className="flex gap-6">
            <Link
              href={`/roster/${params.id}?tab=contacts`}
              className={[
                "pb-2.5 font-sans text-[0.8rem] font-semibold transition-colors duration-styloire",
                tab === "contacts"
                  ? "border-b-2 border-styloire-champagneLight text-styloire-champagneLight"
                  : "text-white/40 hover:text-white/68"
              ].join(" ")}
            >
              Brand Contacts
            </Link>
            <Link
              href={`/roster/${params.id}?tab=history`}
              className={[
                "pb-2.5 font-sans text-[0.8rem] font-semibold transition-colors duration-styloire",
                tab === "history"
                  ? "border-b-2 border-styloire-champagneLight text-styloire-champagneLight"
                  : "text-white/40 hover:text-white/68"
              ].join(" ")}
            >
              Request History
            </Link>
          </div>
        </div>

        {/* ══ BRAND CONTACTS TAB — interactive client component ═══════════ */}
        {tab === "contacts" ? (
          <ProfileContactsClient
            profileId={params.id}
            initialContacts={contacts}
          />
        ) : (
          /* ══ REQUEST HISTORY TAB — static server render ═══════════════ */
          <div className="mt-5">
            <div className="overflow-hidden rounded-[0.55rem] border border-white/12 bg-black/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[440px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/12">
                      <th className={thCls}>Event / Publication</th>
                      <th className={thCls}>Sent</th>
                      <th className={thCls}>Contacts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {requests.length > 0 ? (
                      requests.map((r) => (
                        <tr
                          key={r.id}
                          className="transition-colors duration-100 hover:bg-white/[0.025]"
                        >
                          <td className={tdCls + " font-medium"}>{r.event_name || "—"}</td>
                          <td className={tdCls + " text-white/50"}>
                            {formatSendDate(r.sent_at ?? null)}
                          </td>
                          <td className={tdCls + " text-white/50"}>
                            {r.selected_count > 0 ? r.selected_count : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center font-sans text-[0.82rem] text-white/28"
                        >
                          No requests for this profile yet.{" "}
                          <Link
                            href="/requests/new"
                            className="text-styloire-champagneMuted underline-offset-3 hover:text-styloire-champagneLight"
                          >
                            Send a new request →
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
