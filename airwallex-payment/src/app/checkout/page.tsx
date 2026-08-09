"use client";

import { useState } from "react";
import Link from "next/link";

const CURRENCIES = ["USD", "HKD", "SGD", "AUD", "GBP", "EUR"];

export default function CheckoutPage() {
  const [amount, setAmount] = useState("9.99");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("Demo payment");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create payment intent on our server.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      // 2. Redirect to Airwallex Hosted Payment Page via the frontend SDK.
      const { init } = await import("@airwallex/components-sdk");
      const env =
        (process.env.NEXT_PUBLIC_AIRWALLEX_ENV as "demo" | "prod") ?? "demo";
      const { payments } = await init({ env, enabledElements: ["payments"] });

      if (!payments) throw new Error("Airwallex payments SDK failed to initialize");

      await payments.redirectToCheckout({
        intent_id: data.payment_intent_id,
        client_secret: data.client_secret,
        currency: data.currency,
        country_code: "US",
        methods: ["card"],
        successUrl: `${window.location.origin}/success?intent_id=${data.payment_intent_id}`,
        failUrl: `${window.location.origin}/cancel?intent_id=${data.payment_intent_id}`,
      });

      // redirectToCheckout navigates away; code below only runs if it throws.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Back
      </Link>

      <h1 className="mt-6 mb-8 text-2xl font-bold">Credit Card Payment</h1>

      <form onSubmit={handleCheckout} className="space-y-6">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="mb-1 block text-sm text-neutral-400">
            Amount (major unit)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-lg focus:border-cyan-500 focus:outline-none"
            required
          />
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="mb-1 block text-sm text-neutral-400">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 focus:border-cyan-500 focus:outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="desc" className="mb-1 block text-sm text-neutral-400">
            Description
          </label>
          <input
            id="desc"
            type="text"
            maxLength={32}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
        >
          {loading ? "Redirecting…" : `Pay ${amount} ${currency}`}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-neutral-600">
        Sandbox test card: 4242 4242 4242 4242 · Any future expiry · Any CVC
      </p>
    </main>
  );
}
