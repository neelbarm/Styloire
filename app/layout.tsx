import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const styloireSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-styloire-serif",
  display: "swap"
});

const styloireSans = Inter({
  subsets: ["latin"],
  variable: "--font-styloire-sans",
  display: "swap",
  weight: ["300", "400", "500"]
});

export const metadata: Metadata = {
  title: "Styloire",
  description: "Make emailing simple — pull request automation for fashion stylists."
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
