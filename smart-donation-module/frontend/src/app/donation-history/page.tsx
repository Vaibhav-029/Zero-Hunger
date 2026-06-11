"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInrPaise } from "@/lib/format";
import { generateCertificatePdf } from "@/lib/certificate";
import { Download, Share2, Receipt, CheckCircle2 } from "lucide-react";

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
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <Receipt className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>
                Past donations, certificates and impact records.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {err ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>
          ) : null}

          {items.length ? (
            items.map((d) => (
              <div
                key={d.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${d.paymentStatus === "PAID" ? 'bg-emerald-50' : 'bg-zinc-100'}`}>
                    <CheckCircle2 className={`h-4 w-4 ${d.paymentStatus === "PAID" ? 'text-emerald-600' : 'text-zinc-400'}`} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium text-zinc-900">
                        {d.ngoName ?? "Donation"}
                      </div>
                      {d.paymentStatus === "PAID" ? (
                        <Badge>Paid</Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-500 ring-zinc-200/50">{d.paymentStatus}</Badge>
                      )}
                      <Badge>{formatInrPaise(d.amount)}</Badge>
                      <Badge>{d.mealsFunded} meals</Badge>
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Donor: <span className="font-medium text-zinc-600">{d.donorName}</span> ·{" "}
                      {new Date(d.createdAt).toLocaleString("en-IN")}
                    </div>
                    {d.transactionId ? (
                      <div className="mt-0.5 text-xs text-zinc-400">
                        Txn: <span className="font-mono text-zinc-500">{d.transactionId}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => download(d)}
                    disabled={d.paymentStatus !== "PAID"}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Certificate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `I donated ${formatInrPaise(d.amount)} to ${d.ngoName ?? "an NGO"} via FoodRescue AI.`
                      );
                      alert("Share text copied (demo).");
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500">
              No donations yet. Make one from the Donate page.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
