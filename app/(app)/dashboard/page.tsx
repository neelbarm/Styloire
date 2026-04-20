import { StyloireButton } from "@/components/styloire/button";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl pb-12 pt-10">
      <h1 className="text-center font-serif text-[clamp(4.1rem,9vw,6.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.014em] text-styloire-champagneLight">
        My portal
      </h1>

      <div className="mx-auto mt-4 flex max-w-[21.5rem] flex-col items-center gap-4">
        <StyloireButton
          href="/requests/new"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Send a new request
        </StyloireButton>
        <StyloireButton
          href="/roster"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Existing requests
        </StyloireButton>
        <StyloireButton
          href="/roster"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Client profiles
        </StyloireButton>
        <StyloireButton
          href="/templates"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Templates
        </StyloireButton>
        <StyloireButton
          href="/roster"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-[0.9rem] text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Client profiles
        </StyloireButton>
      </div>
    </div>
  );
}
