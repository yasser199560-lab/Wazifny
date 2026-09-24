import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";

export const metadata: Metadata = {
  title: "Wazifny — AI-Powered Job Matching Platform for Lebanon",
  description:
    "Upload your CV, get AI-matched to jobs across Lebanon, and apply in one click. Wazifny connects talents and employers faster.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
