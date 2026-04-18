import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const styloireSerif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-styloire-serif",
  display: "swap",
  weight: ["300", "400", "500", "600"]
});

const styloireSans = Manrope({
  subsets: ["latin"],
  variable: "--font-styloire-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"]
});

const base = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "Styloire",
    template: "%s · Styloire"
  },
  description:
    "Pull request outreach for stylists — one composed note, hundreds of personalized sends.",
  applicationName: "Styloire",
  authors: [{ name: "Styloire" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: base,
    siteName: "Styloire",
    title: "Styloire",
    description:
      "Pull request outreach for stylists — one composed note, hundreds of personalized sends."
  },
  twitter: {
    card: "summary_large_image",
    title: "Styloire",
    description:
      "Pull request outreach for stylists — one composed note, hundreds of personalized sends."
  },
  icons: {
    icon: "/icon.svg"
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: "#181818",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${styloireSerif.variable} ${styloireSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
