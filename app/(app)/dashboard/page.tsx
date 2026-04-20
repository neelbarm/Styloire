import { StyloireButton } from "@/components/styloire/button";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl pb-10 pt-9">
      <h1 className="text-center font-serif text-[clamp(3.1rem,7vw,5.7rem)] font-semibold uppercase leading-[0.92] tracking-[-0.012em] text-styloire-champagneLight">
        My portal
      </h1>

      <div className="mx-auto mt-5 flex max-w-[21rem] flex-col items-center gap-4.5">
        <StyloireButton
          href="/requests/new"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Send a new request
        </StyloireButton>
        <StyloireButton
          href="/dashboard?status=all"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Existing requests
        </StyloireButton>
        <StyloireButton
          href="/roster"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Client profiles
        </StyloireButton>
        <StyloireButton
          href="/templates"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Templates
        </StyloireButton>
        <StyloireButton
          href="/roster"
          variant="outline"
          className="w-full border-white/46 bg-white/24 py-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-styloire-champagneLight"
        >
          Client profiles
        </StyloireButton>
      </div>
    </div>
  );
}
