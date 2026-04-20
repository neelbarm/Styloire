import { StyloireEyebrow, StyloireHeading } from "@/components/styloire";

export type FaqBlock = {
  id: string;
  title: string;
  items: { q: string; a: string }[];
};

export const FAQ_BLOCKS: FaqBlock[] = [
  {
    id: "basics",
    title: "The basics",
    items: [
      {
        q: "What is Styloire?",
        a: "Styloire is a web-based email automation platform for fashion stylists and assistants. It automates pull request outreach so you write one email and send personalized messages to large brand PR lists in minutes."
      },
      {
        q: "Who is Styloire for?",
        a: "Celebrity stylists, assistants who run outreach, and independent stylists who manage their own pulls. If you live in spreadsheets and BCC lines, this is for you."
      },
      {
        q: "Do I need to be tech-savvy?",
        a: "No. Upload a CSV or XLSX, confirm your brands, pick a template, and send. The product is designed to feel calm and editorial, not like enterprise software."
      }
    ]
  },
  {
    id: "platform",
    title: "Using the platform",
    items: [
      {
        q: "What format should my contact file be?",
        a: "Structured columns — for example brand_name, email, first_name. Files are parsed in the browser, then stored only under your account."
      },
      {
        q: "Where do my contacts live?",
        a: "In your account as Client Profiles — one profile per talent. Contacts are never shared across users; there is no platform-provided PR database in V1."
      },
      {
        q: "How are subject lines generated?",
        a: "Each send uses the pattern Talent / Event / BRAND NAME so every thread is instantly recognizable in inboxes."
      },
      {
        q: "Can I save templates?",
        a: "Yes. Styloire ships with a default pull template, and you can create, edit, and delete your own templates with merge fields like {{brand_name}} and {{contact_name}}."
      },
      {
        q: "What are client profiles?",
        a: "When you upload a list for a talent, Styloire saves it as a reusable profile. Future requests can load the full brand list with toggles on by default."
      }
    ]
  },
  {
    id: "pricing",
    title: "Pricing",
    items: [
      {
        q: "How much does Styloire cost?",
        a: "$20/month flat. No tiers, no usage limits for V1 — one plan for everyone."
      },
      {
        q: "Is there a free trial?",
        a: "If a trial is available, terms are shown clearly at checkout before you pay."
      },
      {
        q: "Can I cancel any time?",
        a: "Yes — billing is handled through Stripe with a customer portal for self-serve cancellation."
      }
    ]
  },
  {
    id: "privacy",
    title: "Privacy & security",
    items: [
      {
        q: "Who can see my contact lists?",
        a: "Only your account. Lists are private and never pooled into a shared directory."
      },
      {
        q: "How is data secured?",
        a: "Hosted infrastructure with row-level security, HTTPS throughout, and least-privilege access to payment and mail providers."
      }
    ]
  }
];

export function FaqPageContent() {
  return (
    <div className="mx-auto max-w-styloire-narrow space-y-16">
      {FAQ_BLOCKS.map((block) => (
        <section key={block.id} id={block.id} className="scroll-mt-28 space-y-8">
          <StyloireHeading level="section" className="text-center">
            {block.title}
          </StyloireHeading>
          <div className="space-y-6">
            {block.items.map((item) => (
              <details
                key={item.q}
                className="group border-b border-styloire-lineSubtle pb-6"
              >
                <summary className="cursor-pointer list-none font-serif text-lg text-styloire-champagne marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="font-sans text-xs text-styloire-inkMuted transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 font-sans text-styloire-body font-light leading-relaxed text-styloire-inkSoft">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}
      <div className="border border-styloire-lineSubtle bg-styloire-canvas/40 px-8 py-10 text-center">
        <StyloireEyebrow>Still curious?</StyloireEyebrow>
        <StyloireHeading level="title" className="mt-4">
          Talk to us
        </StyloireHeading>
        <p className="mx-auto mt-4 max-w-styloire-prose font-sans text-styloire-body font-light text-styloire-inkSoft">
          For partnerships or press, write hello@styloire.co — we answer within 24–48 hours.
        </p>
      </div>
    </div>
  );
}
