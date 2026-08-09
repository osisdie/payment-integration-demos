"use client";

import { useState } from "react";
import Link from "next/link";

const PAYMENT_METHODS = [
  { value: "Credit", label: "信用卡 Credit Card" },
  { value: "ALL", label: "全部 ALL (讓消費者選)" },
  { value: "WebATM", label: "WebATM" },
  { value: "ATM", label: "ATM 虛擬帳號" },
  { value: "CVS", label: "超商代碼 CVS" },
  { value: "Barcode", label: "超商條碼 Barcode" },
  { value: "BNPL", label: "無卡分期 BNPL" },
];

/**
 * Build a hidden form via safe DOM APIs and submit it.
 * No innerHTML / document.write — all fields are created with createElement.
 */
function submitOPayForm(actionUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      totalAmount: Number(formData.get("totalAmount")),
      tradeDesc: formData.get("tradeDesc"),
      itemName: formData.get("itemName"),
      choosePayment: formData.get("choosePayment"),
      customField1: formData.get("customField1") || undefined,
    };

    try {
      const res = await fetch("/api/checkout/aio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error}`);
        setLoading(false);
        return;
      }

      // Build a hidden form via DOM APIs and submit to OPay
      submitOPayForm(data.actionUrl, data.fields);
    } catch {
      alert("Network error");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link href="/" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-200">
        ← 回首頁
      </Link>
      <h1 className="mb-6 text-2xl font-bold">信用卡付款 (AIO Checkout)</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-400">商品名稱 Item Name</label>
          <input
            name="itemName"
            required
            defaultValue="測試商品"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">交易描述 Trade Description</label>
          <input
            name="tradeDesc"
            required
            defaultValue="OPay Demo 測試交易"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">金額 Amount (TWD)</label>
          <input
            name="totalAmount"
            type="number"
            required
            min="1"
            defaultValue="100"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">付款方式 Payment Method</label>
          <select
            name="choosePayment"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-blue-500"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            自訂欄位 Custom Field (optional)
          </label>
          <input
            name="customField1"
            placeholder="e.g. member-123"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Redirecting to OPay…" : "前往付款 Pay Now"}
        </button>
      </form>

      <p className="mt-4 text-xs text-neutral-600">
        Stage mode — 測試卡號: 4311952222222222 · 任意到期日/CVV/持卡人
      </p>
    </main>
  );
}
