import type { Metadata } from "next";
import { StyloireMarketingHeader } from "@/components/styloire";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
  title: "Make emailing simple",
  description:
    "Styloire helps stylists send one polished pull request and reach every house on the list — without the paste marathon.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Styloire — Make emailing simple",
    description:
      "Styloire helps stylists send one polished pull request and reach every house on the list — without the paste marathon."
  }
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-styloire-canvas text-styloire-ink">
      <StyloireMarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
