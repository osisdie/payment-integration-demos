import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  SUCCEEDED: "bg-green-900/30 text-green-400",
  INITIAL: "bg-yellow-900/30 text-yellow-400",
  REQUIRES_PAYMENT_METHOD: "bg-yellow-900/30 text-yellow-400",
  CANCELLED: "bg-red-900/30 text-red-400",
};

export default async function OrdersPage() {
  const orders = await prisma.paymentIntent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { refunds: true },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Back
      </Link>

      <h1 className="mt-6 mb-8 text-2xl font-bold">Order History</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500">No orders yet. Make a payment first.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs text-neutral-400">
                  {o.airwallexIntentId}
                </p>
                <p className="text-sm">
                  {o.descriptor ?? "Payment"} ·{" "}
                  <span className="font-semibold">
                    {o.amount} {o.currency}
                  </span>
                </p>
              </div>

              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  STATUS_COLORS[o.paymentStatus] ??
                  "bg-neutral-800 text-neutral-400"
                }`}
              >
                {o.paymentStatus}
              </span>

              {o.refunds.length > 0 && (
                <span className="rounded bg-orange-900/30 px-2 py-0.5 text-xs font-medium text-orange-400">
                  {o.refunds.length} refund{o.refunds.length > 1 ? "s" : ""}
                </span>
              )}

              <time className="text-xs text-neutral-600">
                {new Date(o.createdAt).toLocaleString()}
              </time>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
