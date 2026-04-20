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
        a: "Stylists, styling assistants, and anyone managing pull request outreach for a client. Whether you're working editorial, red carpet, or commercial - if you're sending pull request emails, Styloire is for you."
      },
      {
        q: "Do I need to be tech-savvy to use it?",
        a: "Not at all. You can put together a spreadsheet anywhere and still use Styloire. There's no technical setup, no complicated onboarding, and no learning curve. It fits into your workflow from the moment you sign in."
      }
    ]
  },
  {
    id: "platform",
    title: "Using the platform",
    items: [
      {
        q: "How do I import my brand contacts?",
        a: "You upload a simple spreadsheet with two columns - Brand Name and Email. There's an optional third column for your PR contact's name if you want personalized greetings. That's it."
      },
      {
        q: "Does Styloire provide a database of brand PR contacts?",
        a: "No - you bring your own contact list. Your contact list is what makes it yours, and we keep it that way. Styloire is the tool that makes using that list effortless."
      },
      {
        q: "What does the subject line look like?",
        a: "Styloire auto generates subject lines in the standard industry format: Talent Name / BRAND NAME / event or publication - with the contact or brand name already inserted - no manual editing required."
      },
      {
        q: "Can I use my own email copy?",
        a: "Absolutely. You can use your own email from start to finish or choose from our saved pull request templates. Either way, the emails are personalized per brand."
      },
      {
        q: "What are client profiles?",
        a: "Every time you upload contacts for a talent, Styloire saves them under that talent's client profile. The next time you're pulling for them, your brand list, response history, and previous requests are all already there. Everything is already there."
      }
    ]
  }
];

export function FaqPageContent() {
  return (
    <div className="mx-auto max-w-[54rem] space-y-14">
      {FAQ_BLOCKS.map((block) => (
        <section key={block.id} id={block.id} className="scroll-mt-24 space-y-8 text-center">
          <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] font-semibold uppercase leading-none tracking-[0.02em] text-[#efe4d5]">
            {block.title}
          </h2>
          <div className="space-y-7">
            {block.items.map((item) => (
              <article key={item.q} className="space-y-2">
                <h3 className="font-serif text-[clamp(1.15rem,2vw,1.55rem)] font-light italic leading-[1.15] text-[#f3eee8]">
                  {item.q}
                </h3>
                <p className="mx-auto max-w-[43rem] font-serif text-[clamp(0.98rem,1.55vw,1.14rem)] font-light leading-[1.18] text-[#f3eee8]">
                  {item.a}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
