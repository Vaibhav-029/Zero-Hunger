"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Metrics = {
  mealsFundedTotal: number;
  foodRescuedKgTotal: number;
  co2ReducedKgTotal: number;
  childrenSupportedTotal: number;
  donationsPaidCount: number;
};

type Ngo = {
  id: number;
  name: string;
  urgencyLevel: number;
  totalFunds: number;
  verified: boolean;
};

export default function ImpactPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, n] = await Promise.all([
          apiGet<Metrics>("/api/metrics/impact"),
          apiGet<Ngo[]>("/api/ngos")
        ]);
        setMetrics(m);
        setNgos(n);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load impact");
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Live Impact Metrics</CardTitle>
          <CardDescription>
            Transparent, real-time visualization from recorded (paid) donations.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {err ? (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>
          ) : null}

          <Metric label="Meals funded" value={metrics?.mealsFundedTotal ?? 0} badge="🍱" />
          <Metric label="Food rescued (kg)" value={metrics?.foodRescuedKgTotal ?? 0} badge="🥦" />
          <Metric label="CO₂ reduced (kg)" value={metrics?.co2ReducedKgTotal ?? 0} badge="🌿" />
          <Metric label="Children supported" value={metrics?.childrenSupportedTotal ?? 0} badge="🧒" />
          <Metric label="Donations" value={metrics?.donationsPaidCount ?? 0} badge="💚" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transparency Dashboard</CardTitle>
          <CardDescription>
            Funding snapshots per NGO (demo). Verified NGOs show a badge.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {ngos
            .slice()
            .sort((a, b) => (b.totalFunds ?? 0) - (a.totalFunds ?? 0))
            .map((n) => (
              <div key={n.id} className="glass rounded-2xl border border-white/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-extrabold">{n.name}</div>
                  {n.verified ? (
                    <Badge className="bg-emerald-700">Verified</Badge>
                  ) : (
                    <Badge className="bg-zinc-700">Community</Badge>
                  )}
                </div>
                <div className="mt-2 text-sm text-zinc-600">
                  Total raised (demo):{" "}
                  <span className="font-bold text-zinc-900">
                    ₹{Math.round((n.totalFunds ?? 0) / 100).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="mt-1 text-xs text-zinc-600">
                  Urgency index: <span className="font-semibold">{n.urgencyLevel}/10</span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, badge }: { label: string; value: number; badge: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-700">{label}</div>
        <div className="text-lg">{badge}</div>
      </div>
      <div className="mt-2 text-3xl font-extrabold">{Number(value ?? 0).toLocaleString("en-IN")}</div>
      <div className="mt-1 text-xs text-zinc-500">Updates every 5 seconds</div>
    </div>
  );
}

