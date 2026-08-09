"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderRow {
  id: string;
  merchantTradeNo: string;
  tradeNo: string | null;
  paymentMethod: string;
  totalAmount: number;
  paymentStatus: string;
}

export default function RefundPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Fetch paid orders for refund selection
    fetch("/api/query/orders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});
  }, []);

  const selected = orders.find((o) => o.id === selectedOrder);

  async function handleRefund(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setResult(null);

    const endpoint = selected.paymentMethod === "TWQR"
      ? "/api/refund/twqr"
      : "/api/refund/credit";

    const body = selected.paymentMethod === "TWQR"
      ? { orderId: selected.id, refundAmt: Number(refundAmount) }
      : { orderId: selected.id, totalAmount: Number(refundAmount) };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      setResult({
        success: data.success,
        message: data.success
          ? `退款成功 — ${data.rtnMsg}`
          : `退款失敗 — [${data.rtnCode}] ${data.rtnMsg ?? data.error}`,
      });
    } catch {
      setResult({ success: false, message: "Network error" });
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link href="/" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-200">
        ← 回首頁
      </Link>
      <h1 className="mb-6 text-2xl font-bold">退款 Refund</h1>

      <form onSubmit={handleRefund} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-400">選擇訂單 Select Order</label>
          <select
            value={selectedOrder}
            onChange={(e) => {
              setSelectedOrder(e.target.value);
              const o = orders.find((o) => o.id === e.target.value);
              if (o) setRefundAmount(String(o.totalAmount));
            }}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-rose-500"
          >
            <option value="">-- 請選擇 --</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.merchantTradeNo} — {o.paymentMethod} — NT${o.totalAmount} ({o.paymentStatus})
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm">
              <p><span className="text-neutral-400">Trade No:</span> {selected.merchantTradeNo}</p>
              <p><span className="text-neutral-400">OPay Trade No:</span> {selected.tradeNo ?? "—"}</p>
              <p><span className="text-neutral-400">Method:</span> {selected.paymentMethod}</p>
              <p><span className="text-neutral-400">Amount:</span> NT$ {selected.totalAmount}</p>
              <p className="text-xs text-neutral-500 mt-1">
                Endpoint: {selected.paymentMethod === "TWQR" ? "/api/refund/twqr" : "/api/refund/credit"}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm text-neutral-400">退款金額 Refund Amount</label>
              <input
                type="number"
                min="1"
                max={selected.totalAmount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !refundAmount}
              className="w-full rounded-lg bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
            >
              {loading ? "Processing…" : "執行退款 Refund"}
            </button>
          </>
        )}
      </form>

      {result && (
        <div
          className={`mt-6 rounded-lg p-4 text-sm ${
            result.success
              ? "border border-emerald-800 bg-emerald-950/30 text-emerald-300"
              : "border border-red-800 bg-red-950/30 text-red-300"
          }`}
        >
          {result.message}
        </div>
      )}
    </main>
  );
}
