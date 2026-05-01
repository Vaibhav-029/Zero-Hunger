"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInrPaise } from "@/lib/format";
import { generateCertificatePdf } from "@/lib/certificate";

type DonationItem = {
  id: number;
  donorName: string;
  ngoId: number | null;
  ngoName: string | null;
  amount: number;
  transactionId: string | null;
  paymentStatus: string;
  mealsFunded: number;
  createdAt: string;
  impact: Record<string, unknown>;
};

export default function DonationHistoryPage() {
  const [items, setItems] = useState<DonationItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const h = await apiGet<DonationItem[]>("/api/donations/history?limit=50");
        setItems(h);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load history");
      }
    })();
  }, []);

  async function download(item: DonationItem) {
    if (item.paymentStatus !== "PAID" || !item.transactionId) return;
    const blob = await generateCertificatePdf({
      donorName: item.donorName,
      ngoName: item.ngoName ?? "NGO",
      amountPaise: item.amount,
      mealsFunded: item.mealsFunded,
      transactionId: item.transactionId,
      timestampIso: item.createdAt,
      certificateId: `FR-AI-${item.id}`
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FoodRescueAI-Certificate-${item.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>
            Past donations, certificates and impact. (For MVP this is global history.)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {err ? (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>
          ) : null}

          {items.length ? (
            items.map((d) => (
              <div
                key={d.id}
                className="glass flex flex-col gap-3 rounded-2xl border border-white/30 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-extrabold">
                      {d.ngoName ?? "Donation"}
                    </div>
                    {d.paymentStatus === "PAID" ? (
                      <Badge className="bg-emerald-700">PAID</Badge>
                    ) : (
                      <Badge className="bg-zinc-700">{d.paymentStatus}</Badge>
                    )}
                    <Badge className="bg-zinc-900">{formatInrPaise(d.amount)}</Badge>
                    <Badge className="bg-orange-600">{d.mealsFunded} meals</Badge>
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Donor: <span className="font-semibold text-zinc-900">{d.donorName}</span> •{" "}
                    {new Date(d.createdAt).toLocaleString("en-IN")}
                  </div>
                  {d.transactionId ? (
                    <div className="mt-1 text-xs text-zinc-600">
                      Txn: <span className="font-mono">{d.transactionId}</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => download(d)}
                    disabled={d.paymentStatus !== "PAID"}
                  >
                    Certificate
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `I donated ${formatInrPaise(d.amount)} to ${d.ngoName ?? "an NGO"} via FoodRescue AI.`
                      );
                      alert("Share text copied (demo).");
                    }}
                  >
                    Share
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white/60 p-4 text-sm text-zinc-700">
              No donations yet. Make one from the Donate page.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

