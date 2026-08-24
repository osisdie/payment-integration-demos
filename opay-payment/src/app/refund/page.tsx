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
  const [manualTradeNo, setManualTradeNo] = useState("");
  const [manualOrder, setManualOrder] = useState<OrderRow | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/query/orders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});
  }, []);

  const selected = manualOrder ?? orders.find((o) => o.id === selectedOrder) ?? null;

  async function handleSearch() {
    const q = manualTradeNo.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    setManualOrder(null);
    setSelectedOrder("");
    setResult(null);

    try {
      const res = await fetch(`/api/query/orders?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setManualOrder(data[0]);
        setRefundAmount(String(data[0].totalAmount));
      } else {
        setSearchError("找不到此訂單 Order not found");
      }
    } catch {
      setSearchError("查詢失敗 Network error");
    }
    setSearching(false);
  }

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
        {/* Manual trade number input */}
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            輸入訂單編號 Enter Trade No
          </label>
          <div className="flex gap-2">
            <input
              value={manualTradeNo}
              onChange={(e) => {
                setManualTradeNo(e.target.value);
                if (manualOrder) {
                  setManualOrder(null);
                  setSearchError("");
                }
              }}
              placeholder="e.g. 20260823163359rhnokb"
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-rose-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || !manualTradeNo.trim()}
              className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-600 disabled:opacity-50"
            >
              {searching ? "…" : "查詢"}
            </button>
          </div>
          {searchError && (
            <p className="mt-1 text-xs text-red-400">{searchError}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-600">
          <span className="h-px flex-1 bg-neutral-800" />
          或 OR
          <span className="h-px flex-1 bg-neutral-800" />
        </div>

        {/* Dropdown selection */}
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            下拉選擇 Select Order
          </label>
          <select
            value={manualOrder ? "" : selectedOrder}
            onChange={(e) => {
              setSelectedOrder(e.target.value);
              setManualOrder(null);
              setManualTradeNo("");
              setSearchError("");
              setResult(null);
              const o = orders.find((o) => o.id === e.target.value);
              if (o) setRefundAmount(String(o.totalAmount));
            }}
            disabled={!!manualOrder}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-rose-500 disabled:opacity-50"
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
              <p><span className="text-neutral-400">Status:</span> {selected.paymentStatus}</p>
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
