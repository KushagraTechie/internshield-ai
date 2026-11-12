import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import BrandOpening from "./components/brand-opening";

export const metadata: Metadata = {
  title: { default: "InternShield AI | Internship Risk Review", template: "%s | InternShield AI" },
  description: "Review internship offers with explainable warning signals, private report history, and practical verification steps.",
  applicationName: "InternShield AI",
  keywords: ["internship scam check", "internship offer review", "student safety", "fraud signals"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><ThemeProvider><BrandOpening>{children}</BrandOpening></ThemeProvider></body>
    </html>
  );
}
