"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/donate", label: "Donate" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/impact", label: "Impact" },
  { href: "/donation-history", label: "History" }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-green to-brand-orange shadow" />
            <div>
              <div className="text-lg font-extrabold tracking-tight">
                FoodRescue AI
              </div>
              <div className="text-sm text-zinc-600">
                Smart Charity & Humanitarian Donations
              </div>
            </div>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
          {nav.map((n) => {
            const active = pathname?.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-700 hover:bg-zinc-50"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="mt-10 text-center text-xs text-zinc-500">
        Demo MVP • Razorpay Sandbox • Transparent impact metrics
      </footer>
    </div>
  );
}

