"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Heart, Megaphone, BarChart3, Clock } from "lucide-react";

const nav = [
  { href: "/donate", label: "Donate", icon: Heart },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/impact", label: "Impact", icon: BarChart3 },
  { href: "/donation-history", label: "History", icon: Clock }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/donate" className="group inline-flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white shadow-sm">
            FR
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight text-zinc-900">
              FoodRescue AI
            </div>
            <div className="text-xs text-zinc-400">
              Humanitarian Donations
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-0.5 rounded-lg border border-zinc-200/60 bg-white p-1 shadow-sm">
          {nav.map((n) => {
            const active = pathname?.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all",
                  active
                    ? "bg-emerald-50 font-medium text-emerald-700"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="mt-14 border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400">
        FoodRescue AI · Transparent humanitarian aid
      </footer>
    </div>
  );
}
