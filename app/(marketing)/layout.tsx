import type { Metadata } from "next";
import { StyloireMarketingHeader } from "@/components/styloire";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata: Metadata = {
  title: "Styloire — Make Emailing Simple",
  description:
    "Email automation for fashion stylists. Write one pull request email, personalize it for hundreds of brand PR contacts."
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
