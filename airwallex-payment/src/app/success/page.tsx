import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  SUCCEEDED: "bg-green-900/30 text-green-400",
  INITIAL: "bg-yellow-900/30 text-yellow-400",
  REQUIRES_PAYMENT_METHOD: "bg-yellow-900/30 text-yellow-400",
  CANCELLED: "bg-red-900/30 text-red-400",
};

export default async function SuccessPage(props: {
  searchParams: Promise<{ intent_id?: string }>;
}) {
  const { intent_id } = await props.searchParams;

  const order = intent_id
    ? await prisma.paymentIntent.findUnique({
        where: { airwallexIntentId: intent_id },
      })
    : null;

  return (
    <main className="mx-auto max-w-lg px-6 py-16 text-center">
      <div className="mb-6 text-5xl">✅</div>
      <h1 className="mb-4 text-2xl font-bold">Payment Complete</h1>

      {order ? (
        <div className="mb-8 space-y-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-left">
          <Row label="Intent ID" value={order.airwallexIntentId} mono />
          <Row label="Amount" value={`${order.amount} ${order.currency}`} />
          <Row label="Description" value={order.descriptor ?? "—"} />
          <Row label="Order ID" value={order.merchantOrderId ?? "—"} mono />
          <Row
            label="Status"
            value={order.paymentStatus}
            badge={STATUS_COLORS[order.paymentStatus]}
          />
          {order.paymentMethod && (
            <Row label="Method" value={order.paymentMethod} />
          )}
        </div>
      ) : (
        <p className="mb-8 text-neutral-400">
          {intent_id
            ? "Payment intent not yet recorded — the webhook may still be in flight."
            : "No intent_id in URL."}
        </p>
      )}

      <div className="flex justify-center gap-4">
        <Link
          href="/orders"
          className="rounded-lg border border-neutral-700 px-5 py-2 text-sm transition hover:border-neutral-500"
        >
          View Orders
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
        >
          Home
        </Link>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  mono,
  badge,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-neutral-500">{label}</span>
      {badge ? (
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${badge}`}>
          {value}
        </span>
      ) : (
        <span
          className={`text-sm ${mono ? "font-mono text-xs text-neutral-300" : ""}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
