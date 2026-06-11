"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatInrPaise } from "@/lib/format";
import { Siren, Timer, Share2, ArrowRight, Megaphone } from "lucide-react";

type Campaign = {
  id: number;
  ngoId: number;
  ngoName: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  endsAt: string;
  emergency: boolean;
};

function msToClock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [now, setNow] = useState(Date.now());
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const active = await apiGet<Campaign[]>("/api/campaigns/active-emergency");
        const rest = await apiGet<Campaign[]>("/api/campaigns");
        const merged = [...active, ...rest.filter((c) => !active.some((a) => a.id === c.id))];
        setCampaigns(merged);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load campaigns");
      }
    })();
  }, []);

  const emergencies = useMemo(() => campaigns.filter((c) => c.emergency), [campaigns]);
  const normal = useMemo(() => campaigns.filter((c) => !c.emergency), [campaigns]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
              <Siren className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <CardTitle>Emergency Hunger Alerts</CardTitle>
              <CardDescription>
                Urgent campaigns with countdown timers and real-time progress.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {err ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>
          ) : null}
          {emergencies.length ? (
            emergencies.map((c) => {
              const ends = new Date(c.endsAt).getTime();
              const pct = c.goalAmount > 0 ? (c.raisedAmount / c.goalAmount) * 100 : 0;
              const remaining = ends - now;
              return (
                <div key={c.id} className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-zinc-900">{c.title}</div>
                    <Badge className="bg-rose-50 text-rose-600 ring-rose-200/50">Emergency</Badge>
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">{c.description}</div>
                  <div className="mt-2 text-xs text-zinc-400">
                    NGO: <span className="font-medium text-zinc-700">{c.ngoName}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      <span>Countdown</span>
                    </div>
                    <span className="font-mono font-semibold text-zinc-900">
                      {remaining > 0 ? msToClock(remaining) : "Ended"}
                    </span>
                  </div>
                  <Progress value={pct} className="mt-2" />
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                    <span>{formatInrPaise(c.raisedAmount)} raised</span>
                    <span className="font-medium">{formatInrPaise(c.goalAmount)} goal</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href="/donate">
                      <Button size="sm">
                        <ArrowRight className="h-3.5 w-3.5" />
                        Support now
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          `Emergency: ${c.title} — ${formatInrPaise(c.raisedAmount)} / ${formatInrPaise(
                            c.goalAmount
                          )} raised. Join FoodRescue AI.`
                        );
                        alert("Share text copied (demo).");
                      }}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500">
              No active emergency campaigns yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <Megaphone className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle>Other Campaigns</CardTitle>
              <CardDescription>Ongoing drives that benefit from steady contributions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {normal.length ? (
            normal.map((c) => (
              <div key={c.id} className="rounded-xl border border-zinc-100 bg-white p-4">
                <div className="font-medium text-zinc-900">{c.title}</div>
                <div className="mt-1 text-sm text-zinc-500 line-clamp-2">{c.description}</div>
                <div className="mt-2 text-xs text-zinc-400">
                  NGO: <span className="font-medium text-zinc-700">{c.ngoName}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500">
              No campaigns added.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
