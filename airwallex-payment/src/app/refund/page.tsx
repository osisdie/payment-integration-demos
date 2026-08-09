"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  airwallexIntentId: string;
  amount: number;
  currency: string;
  descriptor: string | null;
  paymentStatus: string;
}

export default function RefundPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/query/orders")
      .then((r) => r.json())
      .then((data: Order[]) => {
        const succeeded = data.filter((o) => o.paymentStatus === "SUCCEEDED");
        setOrders(succeeded);
        if (succeeded.length > 0) {
          setSelectedId(succeeded[0].id);
          setAmount(String(succeeded[0].amount));
        }
      });
  }, []);

  const selectedOrder = orders.find((o) => o.id === selectedId);

  async function handleRefund(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: selectedId,
          amount: amount ? Number(amount) : undefined,
          reason: reason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refund failed");

      setResult(
        `Refund created: ${data.refund_id} — ${data.amount} ${data.currency} (${data.status})`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Back
      </Link>

      <h1 className="mt-6 mb-8 text-2xl font-bold">Refund</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500">
          No succeeded orders to refund.{" "}
          <Link href="/checkout" className="text-cyan-400 hover:underline">
            Make a payment first
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={handleRefund} className="space-y-6">
          {/* Order selector */}
          <div>
            <label
              htmlFor="order"
              className="mb-1 block text-sm text-neutral-400"
            >
              Order
            </label>
            <select
              id="order"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const o = orders.find((x) => x.id === e.target.value);
                if (o) setAmount(String(o.amount));
              }}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:outline-none"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.amount} {o.currency} — {o.descriptor ?? o.airwallexIntentId}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="refund-amount"
              className="mb-1 block text-sm text-neutral-400"
            >
              Refund Amount{" "}
              {selectedOrder && (
                <span className="text-neutral-600">
                  (max {selectedOrder.amount} {selectedOrder.currency})
                </span>
              )}
            </label>
            <input
              id="refund-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={selectedOrder?.amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="reason"
              className="mb-1 block text-sm text-neutral-400"
            >
              Reason (optional)
            </label>
            <input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 focus:border-cyan-500 focus:outline-none"
              placeholder="Customer request"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {result && (
            <p className="rounded-lg bg-green-900/30 px-4 py-3 text-sm text-green-400">
              {result}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
          >
            {loading ? "Processing…" : "Submit Refund"}
          </button>
        </form>
      )}
    </main>
  );
}
