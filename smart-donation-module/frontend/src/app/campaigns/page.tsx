"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatInrPaise } from "@/lib/format";

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
          <CardTitle>Emergency Hunger Alerts</CardTitle>
          <CardDescription>
            Urgent campaigns with countdown timers, goals, and real-time progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {err ? (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>
          ) : null}
          {emergencies.length ? (
            emergencies.map((c) => {
              const ends = new Date(c.endsAt).getTime();
              const pct = c.goalAmount > 0 ? (c.raisedAmount / c.goalAmount) * 100 : 0;
              const remaining = ends - now;
              return (
                <div key={c.id} className="glass rounded-2xl border border-white/30 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-extrabold">{c.title}</div>
                    <Badge className="bg-red-600">Emergency</Badge>
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">{c.description}</div>
                  <div className="mt-2 text-xs text-zinc-600">
                    NGO: <span className="font-semibold text-zinc-900">{c.ngoName}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
                    <span>Countdown</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {remaining > 0 ? msToClock(remaining) : "Ended"}
                    </span>
                  </div>
                  <Progress value={pct} className="mt-2" />
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
                    <span>{formatInrPaise(c.raisedAmount)} raised</span>
                    <span className="font-semibold">{formatInrPaise(c.goalAmount)} goal</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href="/donate">
                      <Button>Support now</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          `Emergency: ${c.title} — ${formatInrPaise(c.raisedAmount)} / ${formatInrPaise(
                            c.goalAmount
                          )} raised. Join FoodRescue AI.`
                        );
                        alert("Share text copied (demo).");
                      }}
                    >
                      Share
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl bg-white/60 p-4 text-sm text-zinc-700">
              No active emergency campaigns yet (seed one in DB for demo).
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other campaigns</CardTitle>
          <CardDescription>Ongoing drives that benefit from steady contributions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {normal.length ? (
            normal.map((c) => (
              <div key={c.id} className="rounded-2xl border border-white/40 bg-white/60 p-4">
                <div className="font-bold">{c.title}</div>
                <div className="mt-1 text-sm text-zinc-600 line-clamp-2">{c.description}</div>
                <div className="mt-2 text-xs text-zinc-600">
                  NGO: <span className="font-semibold text-zinc-900">{c.ngoName}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white/60 p-4 text-sm text-zinc-700">
              No campaigns added.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

