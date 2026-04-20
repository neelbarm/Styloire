import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileDetail } from "@/lib/data/profile-queries";
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

function formatResponseRate(sent: number, responded: number) {
  if (!sent) return "—";
  return `${Math.round((responded / sent) * 100)}%`;
}

function badgeClass(status: string) {
  if (status === "active") {
    return "border-emerald-400/38 bg-emerald-500/12 text-emerald-300";
  }
  if (status === "archived") {
    return "border-white/18 bg-white/6 text-white/54";
  }
  return "border-amber-400/28 bg-amber-500/10 text-amber-200";
}

export default async function RosterDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const bundle = await getProfileDetail(params.id);
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
                <table className="w-full min-w-[680px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/12">
                      <th className={thCls}>Event / Publication</th>
                      <th className={thCls}>Sent</th>
                      <th className={thCls}>Contacts</th>
                      <th className={thCls}>Response rate</th>
                      <th className={thCls}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {requests.length > 0 ? (
                      requests.map((r) => (
                        <tr
                          key={r.id}
                          className="transition-colors duration-100 hover:bg-white/[0.025]"
                        >
                          <td className={tdCls + " font-medium"}>
                            <Link
                              href={`/requests/${r.id}`}
                              className="transition-colors hover:text-styloire-champagneLight"
                            >
                              {r.event_name || "—"}
                            </Link>
                          </td>
                          <td className={tdCls + " text-white/50"}>
                            {formatSendDate(r.sent_at ?? null)}
                          </td>
                          <td className={tdCls + " text-white/50"}>
                            {r.selected_count > 0 ? r.selected_count : "—"}
                          </td>
                          <td className={tdCls + " text-white/50"}>
                            {formatResponseRate(r.sent_count, r.responded_count)}
                          </td>
                          <td className={tdCls}>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${badgeClass(r.status)}`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
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
