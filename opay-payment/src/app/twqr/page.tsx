"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function TwqrPage() {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{
    merchantTradeNo: string;
    tradeNo: string;
    twqrCode: string;
    expireDate: string;
  } | null>(null);
  const [status, setStatus] = useState<number | null>(null); // 0=unpaid, 1=paid, 4=failed
  const [amount, setAmount] = useState("100");

  // Poll for payment status every 5 seconds
  const pollStatus = useCallback(async (tradeNo: string) => {
    try {
      const res = await fetch("/api/twqr/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeNo }),
      });
      const data = await res.json();
      setStatus(data.status);
      // Stop polling if paid, refunded, or failed
      if (data.status !== 0) return true;
    } catch {
      // Continue polling on network error
    }
    return false;
  }, []);

  useEffect(() => {
    if (!qrData?.tradeNo) return;

    const interval = setInterval(async () => {
      const done = await pollStatus(qrData.tradeNo);
      if (done) clearInterval(interval);
    }, 5000);

    return () => clearInterval(interval);
  }, [qrData?.tradeNo, pollStatus]);

  async function handleCreate() {
    setLoading(true);
    setQrData(null);
    setStatus(null);

    try {
      const res = await fetch("/api/twqr/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeAmt: Number(amount) }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error}`);
        setLoading(false);
        return;
      }

      setQrData(data);
    } catch {
      alert("Network error");
    }
    setLoading(false);
  }

  const statusLabel: Record<number, string> = {
    0: "⏳ 等待付款 Waiting for payment…",
    1: "✅ 付款成功 Payment successful!",
    2: "🔄 已全額退款 Fully refunded",
    3: "🔄 已部分退款 Partially refunded",
    4: "❌ 付款失敗 Payment failed",
  };

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link href="/" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-200">
        ← 回首頁
      </Link>
      <h1 className="mb-6 text-2xl font-bold">TWQR 動態碼付款</h1>

      {!qrData ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">金額 Amount (TWD)</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Creating QR…" : "產生 QR Code"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-6 text-center">
            <p className="mb-4 text-sm text-neutral-400">
              請使用 台灣Pay / 銀行 APP 掃描 QR Code
            </p>
            {/* Render QR code as a simple text display — in production, use a QR image library */}
            <div className="mx-auto mb-4 inline-block rounded-lg bg-white p-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.twqrCode)}`}
                alt="TWQR Code"
                width={200}
                height={200}
              />
            </div>
            <p className="text-xs text-neutral-500 break-all">
              {qrData.twqrCode}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p><span className="text-neutral-400">Trade No:</span> {qrData.tradeNo}</p>
            <p><span className="text-neutral-400">Merchant Trade No:</span> {qrData.merchantTradeNo}</p>
            <p><span className="text-neutral-400">Expires:</span> {qrData.expireDate}</p>
            <p className="text-lg font-semibold">
              {status !== null ? statusLabel[status] ?? `Status: ${status}` : statusLabel[0]}
            </p>
          </div>

          {(status === 1 || status === 4) && (
            <button
              onClick={() => { setQrData(null); setStatus(null); }}
              className="w-full rounded-lg border border-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-800"
            >
              建立新交易 New Transaction
            </button>
          )}
        </div>
      )}

      <p className="mt-8 text-xs text-neutral-600">
        Stage environment · TWQR MerchantID: 2032990 · 有效期限預設 10 分鐘
      </p>
    </main>
  );
}
