import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodRescue AI",
  description:
    "Humanitarian donation platform — donate, sponsor meals, emergency campaigns, impact & certificates."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-stone-50 text-zinc-900 antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
