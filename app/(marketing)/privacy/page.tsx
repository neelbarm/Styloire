import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Styloire collects, uses, stores, and protects stylist account, contact, and connected email data.",
  alternates: {
    canonical: "/privacy",
  },
};

const sections = [
  {
    title: "Overview",
    body: [
      "Styloire helps stylists and their teams organize brand contacts, create pull request outreach, and send emails from connected accounts. This Privacy Policy explains what information we collect, how we use it, and how you can control your data.",
      "By using Styloire, you agree to the practices described here. If you have questions, you can contact us at hello@styloire.co.",
    ],
  },
  {
    title: "Information We Collect",
    body: [
      "We collect the information you provide directly to Styloire, including your name, email address, account credentials, uploaded contact lists, saved client profiles, templates, connected email account settings, and request history.",
      "If you connect Gmail, Outlook, or SMTP, we collect the minimum information required to authenticate your account and send outreach on your behalf. For Gmail, this includes the connected email address, OAuth tokens, and the ability to send messages you create inside Styloire.",
    ],
  },
  {
    title: "How We Use Gmail Data",
    body: [
      "Styloire uses Gmail access only to let you send outreach emails from your own inbox. We do not use Gmail data to serve ads, sell data, train generalized AI models, or read unrelated inbox content.",
      "Styloire stores the tokens and account details required to keep your Gmail connection active and to send messages you intentionally create in the product. Styloire uses your connected Gmail account solely to send pull request outreach, support account connection status, and troubleshoot delivery issues you request help with.",
      "Styloire's use of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.",
    ],
  },
  {
    title: "How We Use Your Information",
    body: [
      "We use your information to operate Styloire, including creating and managing your account, storing your client profiles and brand contacts, generating outreach drafts, sending emails from connected accounts, supporting billing, and responding to support requests.",
      "We may also use service data to secure the platform, prevent abuse, debug product issues, and improve reliability and user experience.",
    ],
  },
  {
    title: "Sharing",
    body: [
      "We do not sell your personal information or your brand contact data. We only share information with service providers that help us operate Styloire, such as infrastructure, authentication, email, analytics, and payment providers, and only to the extent needed for those services.",
      "We may disclose information if required by law, to enforce our terms, or to protect the rights, safety, and security of Styloire, our users, or others.",
    ],
  },
  {
    title: "Storage, Security, and Retention",
    body: [
      "We use commercially reasonable safeguards to protect your data, including access controls and encrypted handling of sensitive credentials and tokens. No system can be guaranteed perfectly secure, but we work to protect the information entrusted to us.",
      "We retain your information for as long as your account remains active or as needed to provide the service, comply with legal obligations, resolve disputes, and enforce agreements. You may request account deletion or disconnect a provider connection at any time.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You can update your account information inside Styloire, disconnect Gmail or other email providers, and request deletion of your account by contacting support.",
      "If you disconnect Gmail, Styloire will no longer use your Gmail account to send new outreach unless you reconnect it.",
    ],
  },
  {
    title: "Changes",
    body: [
      "We may update this Privacy Policy from time to time. When we do, we will post the updated version on this page and update the effective date below.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="px-6 pb-12 pt-32 md:px-10 md:pt-36">
        <div className="mx-auto max-w-[56rem] text-center">
          <p className="font-sans text-styloire-caption uppercase tracking-styloireWide text-styloire-champagneMuted">
            Legal
          </p>
          <h1 className="mt-4 font-serif text-[clamp(3.6rem,8vw,6.2rem)] font-semibold uppercase leading-[0.88] tracking-[-0.03em] text-styloire-champagneLight">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-[42rem] font-sans text-[clamp(0.95rem,1.8vw,1.15rem)] font-light leading-[1.45] text-white/76">
            Effective April 2026. This page explains how Styloire handles account,
            contact, and connected email data.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16 md:px-10 md:pb-20">
        <div className="mx-auto max-w-[56rem] border border-styloire-lineSubtle bg-styloire-canvas/60 px-6 py-8 ring-1 ring-styloire-champagne/[0.08] md:px-8 md:py-10">
          <div className="space-y-9">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="font-serif text-[clamp(1.6rem,2.8vw,2.2rem)] text-styloire-champagneLight">
                  {section.title}
                </h2>
                <div className="space-y-3 font-sans text-sm font-light leading-7 text-styloire-inkSoft md:text-[0.96rem]">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 border-t border-styloire-lineSubtle pt-6 text-center">
            <p className="font-sans text-xs uppercase tracking-styloireWide text-styloire-inkMuted">
              Questions?
            </p>
            <p className="mt-3 font-sans text-sm font-light text-styloire-inkSoft">
              Contact us at{" "}
              <a
                href="mailto:hello@styloire.co"
                className="text-styloire-champagne underline-offset-4 hover:underline"
              >
                hello@styloire.co
              </a>{" "}
              or return to the{" "}
              <Link
                href="/"
                className="text-styloire-champagne underline-offset-4 hover:underline"
              >
                homepage
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
