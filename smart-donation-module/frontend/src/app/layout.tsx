import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "FoodRescue AI — Smart Donations",
  description:
    "AI-powered humanitarian donation ecosystem: donate, sponsor meals, emergency campaigns, impact & certificates."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 text-zinc-900">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

