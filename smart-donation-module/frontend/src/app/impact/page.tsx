"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Leaf, Wind, Baby, HandHeart, ShieldCheck, Users } from "lucide-react";

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
            Real-time visualization from recorded donations. Updates every 5 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {err ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 sm:col-span-full">{err}</div>
          ) : null}

          <Metric label="Meals funded" value={metrics?.mealsFundedTotal ?? 0} icon={UtensilsCrossed} color="text-emerald-600" bg="bg-emerald-50" />
          <Metric label="Food rescued" value={metrics?.foodRescuedKgTotal ?? 0} unit="kg" icon={Leaf} color="text-teal-600" bg="bg-teal-50" />
          <Metric label="CO₂ reduced" value={metrics?.co2ReducedKgTotal ?? 0} unit="kg" icon={Wind} color="text-sky-600" bg="bg-sky-50" />
          <Metric label="Children helped" value={metrics?.childrenSupportedTotal ?? 0} icon={Baby} color="text-amber-600" bg="bg-amber-50" />
          <Metric label="Donations" value={metrics?.donationsPaidCount ?? 0} icon={HandHeart} color="text-rose-600" bg="bg-rose-50" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transparency Dashboard</CardTitle>
          <CardDescription>
            Funding snapshots per NGO. Verified NGOs are marked.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {ngos
            .slice()
            .sort((a, b) => (b.totalFunds ?? 0) - (a.totalFunds ?? 0))
            .map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-white p-4">
                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${n.verified ? 'bg-emerald-50' : 'bg-zinc-100'}`}>
                  {n.verified ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Users className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-zinc-900">{n.name}</div>
                    {n.verified ? <Badge>Verified</Badge> : <Badge className="bg-zinc-100 text-zinc-500 ring-zinc-200/50">Community</Badge>}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">
                    Total raised:{" "}
                    <span className="font-semibold text-zinc-700">
                      ₹{Math.round((n.totalFunds ?? 0) / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-400">
                    Urgency: <span className="font-medium text-zinc-600">{n.urgencyLevel}/10</span>
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, unit, icon: Icon, color, bg }: { label: string; value: number; unit?: string; icon: React.ElementType; color: string; bg: string }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${bg}`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
        <div className="text-xs font-medium text-zinc-400">{label}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">
        {Number(value ?? 0).toLocaleString("en-IN")}
        {unit ? <span className="ml-1 text-sm font-normal text-zinc-400">{unit}</span> : null}
      </div>
    </div>
  );
}
