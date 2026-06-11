"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatInrPaise, toPaise } from "@/lib/format";
import { generateCertificatePdf } from "@/lib/certificate";
import { Heart, HandHeart, AlertTriangle, Sparkles, CreditCard, Download, Share2, CheckCircle2, XCircle } from "lucide-react";

type Ngo = {
  id: number;
  name: string;
  description: string;
  urgencyLevel: number;
  totalFunds: number;
  verified: boolean;
  city: string | null;
};

type Recommendation = {
  ngoId: number | null;
  ngoName: string | null;
  campaignId: number | null;
  reason: string;
  message: string;
};

type CreateOrderResult = {
  donationId: number;
  razorpayOrderId: string;
  razorpayKeyId: string;
  mealsFunded: number;
  badge: string;
  impact: Record<string, unknown>;
};

type VerifyResponse = {
  donationId: number;
  paymentStatus: string;
  transactionId: string;
  mealsFunded: number;
  impact: Record<string, unknown>;
};

const sponsorCards = [
  { title: "Feed 10 people", subtitle: "A warm meal can change a night.", inr: 300, tag: "Meals • 10" },
  { title: "Milk for children", subtitle: "Nutrition for growing minds.", inr: 500, tag: "Kids • 15" },
  { title: "Community meal", subtitle: "Support a local kitchen run.", inr: 1000, tag: "Meals • 35" },
  { title: "Emergency hunger relief", subtitle: "Fast help when time is short.", inr: 2000, tag: "Urgent • 70" }
];

export default function DonatePage() {
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [mode, setMode] = useState<"ngo" | "sponsor" | "emergency">("ngo");
  const [selectedNgoId, setSelectedNgoId] = useState<number | null>(null);
  const [loadingNgos, setLoadingNgos] = useState(true);
  const [donorName, setDonorName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [amountInr, setAmountInr] = useState<number>(500);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [success, setSuccess] = useState<VerifyResponse | null>(null);
  const [successNgoName, setSuccessNgoName] = useState<string>("");
  const [successAmountPaise, setSuccessAmountPaise] = useState<number>(0);

  async function loadNgos() {
    setErr(null);
    setLoadingNgos(true);
    try {
      const [ngoList, recommendation] = await Promise.all([
        apiGet<Ngo[]>("/api/ngos"),
        apiGet<Recommendation>("/api/ngos/recommended")
      ]);
      setNgos(ngoList);
      setRec(recommendation);
      setSelectedNgoId((prev) => (prev ?? ngoList[0]?.id ?? null));
    } catch (e: any) {
      setErr(
        (e?.message ?? "Failed to load NGOs") +
          "\n\nTip: if your backend is on 8086, set NEXT_PUBLIC_DONATION_API_BASE=http://localhost:8086 in frontend .env.local and restart dev server."
      );
      setNgos([]);
      setRec(null);
    } finally {
      setLoadingNgos(false);
    }
  }

  useEffect(() => {
    loadNgos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedNgo = useMemo(
    () => ngos.find((n) => n.id === selectedNgoId) ?? null,
    [ngos, selectedNgoId]
  );

  const aiNgo = useMemo(() => {
    if (!rec?.ngoId) return null;
    return ngos.find((n) => n.id === rec.ngoId) ?? null;
  }, [rec, ngos]);

  async function startPayment() {
    setErr(null);
    setSuccess(null);
    if (!donorName.trim()) {
      setErr("Please enter your name.");
      return;
    }
    const amountPaise = toPaise(amountInr);
    if (amountPaise < 1000) {
      setErr("Minimum is ₹10 for demo.");
      return;
    }
    const ngoId =
      mode === "ngo"
        ? selectedNgoId
        : mode === "emergency"
          ? rec?.ngoId ?? selectedNgoId
          : rec?.ngoId ?? selectedNgoId;

    if (!ngoId) {
      setErr("Please select an NGO.");
      return;
    }

    setLoading(true);
    try {
      const order = await apiPost<CreateOrderResult>("/api/payments/order", {
        donorName: donorName.trim(),
        anonymous,
        ngoId,
        campaignId: mode === "emergency" ? rec?.campaignId : null,
        amountPaise,
        message: message.trim() || null
      });

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Check your network.");
      }

      const ngoName =
        ngos.find((n) => n.id === ngoId)?.name ?? rec?.ngoName ?? "Selected NGO";
      setSuccessNgoName(ngoName);
      setSuccessAmountPaise(amountPaise);

      const rzp = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: amountPaise,
        currency: "INR",
        name: "FoodRescue AI",
        description: mode === "sponsor" ? "Sponsor meals" : "Humanitarian donation",
        order_id: order.razorpayOrderId,
        prefill: { name: anonymous ? "" : donorName.trim() },
        notes: {
          ngo: ngoName,
          donationId: String(order.donationId)
        },
        theme: { color: "#22c55e" },
        handler: async (response: any) => {
          const verified = await apiPost<VerifyResponse>("/api/payments/verify", {
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          setSuccess(verified);
        }
      });
      rzp.open();
    } catch (e: any) {
      setErr(e?.message ?? "Payment failed to start");
    } finally {
      setLoading(false);
    }
  }

  async function downloadCertificate() {
    if (!success || success.paymentStatus !== "PAID") return;
    const blob = await generateCertificatePdf({
      donorName: anonymous ? "Anonymous Donor" : donorName.trim(),
      ngoName: successNgoName,
      amountPaise: successAmountPaise,
      mealsFunded: success.mealsFunded,
      transactionId: success.transactionId,
      timestampIso: new Date().toISOString(),
      certificateId: `FR-AI-${success.donationId}`
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FoodRescueAI-Certificate-${success.donationId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function shareCertificate() {
    if (!success) return;
    const text = `I just sponsored ${success.mealsFunded} meals on FoodRescue AI. Join me in supporting humanity.`;
    navigator.clipboard?.writeText(text);
    alert("Share message copied (demo).");
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="border-b border-zinc-100 bg-white px-6 py-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <Sparkles className="h-3 w-3" />
                AI-powered giving
              </div>
              <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900">
                Make a Difference Today
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Support verified NGOs, sponsor meals, or fund emergency relief — with full transparency.
              </p>
            </div>

            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={mode === "ngo" ? "secondary" : "ghost"}
                  onClick={() => setMode("ngo")}
                  size="sm"
                >
                  <Heart className="h-3.5 w-3.5" />
                  Donate Now
                </Button>
                <Button
                  variant={mode === "sponsor" ? "secondary" : "ghost"}
                  onClick={() => setMode("sponsor")}
                  size="sm"
                >
                  <HandHeart className="h-3.5 w-3.5" />
                  Sponsor Meals
                </Button>
                <Button
                  variant={mode === "emergency" ? "secondary" : "ghost"}
                  onClick={() => setMode("emergency")}
                  size="sm"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Emergency Support
                </Button>
              </div>

              {mode === "sponsor" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {sponsorCards.map((c) => (
                    <button
                      key={c.title}
                      onClick={() => setAmountInr(c.inr)}
                      className="glass rounded-2xl border border-white/30 p-4 text-left transition hover:brightness-105"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-zinc-900">{c.title}</div>
                        <Badge>{c.tag}</Badge>
                      </div>
                      <div className="mt-1 text-sm text-zinc-500">{c.subtitle}</div>
                      <div className="mt-3 text-base font-semibold">
                        {formatInrPaise(toPaise(c.inr))}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {mode !== "sponsor" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-zinc-700">
                      Choose NGO
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-zinc-800">NGO</div>
                        <Button variant="ghost" size="sm" onClick={loadNgos} disabled={loadingNgos}>
                          {loadingNgos ? "Loading..." : "Reload"}
                        </Button>
                      </div>

                      {ngos.length ? (
                        <>
                          <select
                            className="mt-2 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
                            value={selectedNgoId ?? ""}
                            onChange={(e) => setSelectedNgoId(Number(e.target.value))}
                          >
                            {ngos.map((n) => (
                              <option key={n.id} value={n.id}>
                                {n.name} {n.verified ? "✓" : ""} (Urgency {n.urgencyLevel}/10)
                              </option>
                            ))}
                          </select>

                          <div className="mt-3 rounded-lg bg-zinc-50 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-bold">{selectedNgo?.name ?? "—"}</div>
                              {selectedNgo?.verified ? (
                                <Badge>Verified</Badge>
                              ) : (
                                <Badge>Community</Badge>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-zinc-600">
                              {selectedNgo?.description ?? "—"}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
                              <span>Urgency</span>
                              <span className="font-semibold">
                                {selectedNgo?.urgencyLevel ?? "—"}/10
                              </span>
                            </div>
                            <Progress
                              value={((selectedNgo?.urgencyLevel ?? 0) / 10) * 100}
                              className="mt-2"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-zinc-500">
                          {loadingNgos
                            ? "Loading NGOs..."
                            : "No NGOs loaded. Check your backend URL in frontend .env.local and refresh."}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-zinc-700">
                      AI Recommended
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {aiNgo?.name ?? rec?.ngoName ?? "Loading..."}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {rec?.message ?? "Fetching recommendation..."}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge>{rec?.reason ?? "Analyzing..."}</Badge>
                      {rec?.campaignId ? <Badge>Emergency</Badge> : null}
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          if (rec?.ngoId) setSelectedNgoId(rec.ngoId);
                          setMode(rec?.campaignId ? "emergency" : "ngo");
                        }}
                      >
                        Use AI Pick
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your donation</CardTitle>
              <CardDescription>
                This is a demo-friendly flow: order → checkout → verification → certificate.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <div className="text-sm font-semibold text-zinc-700">Donor name</div>
                <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Your name" />
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                  />
                  Donate anonymously
                </label>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-semibold text-zinc-700">Amount (₹)</div>
                <Input
                  type="number"
                  min={10}
                  value={amountInr}
                  onChange={(e) => setAmountInr(Number(e.target.value))}
                />
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-semibold text-zinc-700">Message (optional)</div>
                <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A short note…" />
              </div>

              <div className="rounded-2xl bg-white/70 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Target</span>
                  <span className="font-semibold">
                    {mode === "emergency" && rec?.campaignId ? "Emergency Campaign" : "NGO Donation"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-zinc-600">NGO</span>
                  <span className="font-semibold">
                    {mode === "emergency"
                      ? rec?.ngoName ?? selectedNgo?.name ?? "—"
                      : selectedNgo?.name ?? "—"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-zinc-600">Amount</span>
                  <span className="font-extrabold">{formatInrPaise(toPaise(amountInr))}</span>
                </div>
              </div>

              {err ? (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">{err}</div>
              ) : null}

              <Button onClick={startPayment} disabled={loading}>
                <CreditCard className="h-4 w-4" />
                {loading ? "Starting..." : "Proceed to Razorpay Checkout"}
              </Button>

              {success ? (
                <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">Status</div>
                  <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                    {success.paymentStatus === "PAID" ? (
                      <><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Payment Successful</>
                    ) : (
                      <><XCircle className="h-5 w-5 text-red-500" /> Payment Failed</>
                    )}
                  </div>

                  {success.paymentStatus === "PAID" ? (
                    <>
                      <div className="mt-3 grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Meals funded</span>
                          <span className="font-semibold">{success.mealsFunded}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Transaction</span>
                          <span className="font-mono text-xs">{success.transactionId}</span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2">
                        <Button variant="secondary" onClick={downloadCertificate}>
                          <Download className="h-4 w-4" />
                          Download Certificate (PDF)
                        </Button>
                        <Button variant="ghost" onClick={shareCertificate}>
                          <Share2 className="h-4 w-4" />
                          Share (copy message)
                        </Button>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

