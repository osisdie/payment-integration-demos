"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InvoiceIssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasVat, setHasVat] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      relateNumber: form.get("relateNumber"),
      merchantId: form.get("merchantId") || undefined,
      customerIdentifier: form.get("customerIdentifier") || undefined,
      customerName: form.get("customerName") || undefined,
      customerEmail: form.get("customerEmail") || undefined,
      customerPhone: form.get("customerPhone") || undefined,
      storeId: form.get("storeId") || undefined,
      print: hasVat ? "1" : "0",
      donation: "0",
      carrierType: hasVat ? "" : (form.get("carrierType") || ""),
      carrierNum: form.get("carrierNum") || undefined,
      taxType: form.get("taxType") || "1",
      salesAmount: Number(form.get("salesAmount")),
      invType: "07",
      items: [
        {
          ItemName: form.get("itemName"),
          ItemCount: Number(form.get("itemCount") || 1),
          ItemWord: form.get("itemWord") || "個",
          ItemPrice: Number(form.get("itemPrice")),
          ItemAmount: Number(form.get("salesAmount")),
        },
      ],
    };

    try {
      const res = await fetch("/api/invoice/issue", {
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

      const emailMsg = data.email?.sent
        ? `\n📧 Email sent to: ${data.email.to}${data.email.fallback ? " (fallback)" : ""}`
        : "\n📧 Email: not configured (set SMTP_* in .env)";
      alert(`發票開立成功！\nInvoice No: ${data.invoiceNo}\nRandom: ${data.randomNumber}${emailMsg}`);
      router.push("/invoices");
    } catch {
      alert("Network error");
      setLoading(false);
    }
  }

  // Generate unique relate number
  const defaultRelateNo = `INV${Date.now().toString(36).toUpperCase()}`;

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link href="/invoices" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-200">
        ← 發票列表
      </Link>
      <h1 className="mb-6 text-2xl font-bold">開立發票 Issue Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-400">關聯編號 Relate Number</label>
          <input
            name="relateNumber"
            required
            defaultValue={defaultRelateNo}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">門市代號 Store ID</label>
            <input
              name="storeId"
              placeholder="e.g. STORE001"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">商戶編號 Merchant ID</label>
            <input
              name="merchantId"
              placeholder="留空=env預設 (2000132)"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            />
            <p className="mt-1 text-xs text-neutral-500">B2B2C 平台商可指定子商戶</p>
          </div>
        </div>

        {/* B2B VAT toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="vatToggle"
            checked={hasVat}
            onChange={(e) => setHasVat(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-600 bg-neutral-800"
          />
          <label htmlFor="vatToggle" className="text-sm text-neutral-400">
            B2B 三聯式發票 (含統一編號)
          </label>
        </div>

        {hasVat && (
          <div>
            <label className="mb-1 block text-sm text-neutral-400">統一編號 VAT Number</label>
            <input
              name="customerIdentifier"
              required={hasVat}
              maxLength={8}
              pattern="[0-9]{8}"
              placeholder="12345678"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            />
            <p className="mt-1 text-xs text-neutral-500">
              B2B: Print=1, Donation=0, CarrierType=空 (法規要求)
            </p>
          </div>
        )}

        {!hasVat && (
          <div>
            <label className="mb-1 block text-sm text-neutral-400">載具類型 Carrier Type</label>
            <select
              name="carrierType"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            >
              <option value="">無 (None)</option>
              <option value="1">OPay 會員</option>
              <option value="2">自然人憑證</option>
              <option value="3">手機條碼</option>
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-neutral-400">載具號碼 Carrier Number</label>
          <input
            name="carrierNum"
            placeholder="/ABC+123"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">買受人 Customer Name</label>
            <input
              name="customerName"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Email</label>
            <input
              name="customerEmail"
              type="email"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">電話 Phone</label>
          <input
            name="customerPhone"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
          />
        </div>

        <hr className="border-neutral-800" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">商品名稱 Item Name</label>
            <input
              name="itemName"
              required
              defaultValue="測試商品"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">單位 Unit</label>
            <input
              name="itemWord"
              defaultValue="個"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">數量 Quantity</label>
            <input
              name="itemCount"
              type="number"
              min="1"
              defaultValue="1"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">單價 Unit Price</label>
            <input
              name="itemPrice"
              type="number"
              min="1"
              required
              defaultValue="100"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-400">總金額 Sales Amount (TWD)</label>
          <input
            name="salesAmount"
            type="number"
            min="1"
            required
            defaultValue="100"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-violet-500"
          />
        </div>

        <input type="hidden" name="taxType" value="1" />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "開立中…" : "開立發票 Issue Invoice"}
        </button>
      </form>
    </main>
  );
}
