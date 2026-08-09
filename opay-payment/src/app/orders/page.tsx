import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-900 text-yellow-300",
  paid: "bg-emerald-900 text-emerald-300",
  failed: "bg-red-900 text-red-300",
  refunded: "bg-violet-900 text-violet-300",
  expired: "bg-neutral-800 text-neutral-400",
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-200">
        ← 回首頁
      </Link>
      <h1 className="mb-6 text-2xl font-bold">訂單查詢 Orders</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-400">尚無訂單 — 先從首頁建立一筆交易</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-800 text-neutral-400">
              <tr>
                <th className="pb-3 pr-4">Trade No</th>
                <th className="pb-3 pr-4">Method</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Payment Date</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-900">
                  <td className="py-3 pr-4 font-mono text-xs">
                    {order.merchantTradeNo}
                    {order.tradeNo && (
                      <span className="ml-1 text-neutral-500">({order.tradeNo})</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">{order.paymentMethod}</td>
                  <td className="py-3 pr-4">NT$ {order.totalAmount.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[order.paymentStatus] ?? "bg-neutral-800"}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-neutral-400">
                    {order.paymentDate ?? "—"}
                  </td>
                  <td className="py-3 text-xs text-neutral-400">
                    {order.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
