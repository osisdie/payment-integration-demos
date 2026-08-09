import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ tradeNo?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { tradeNo } = await searchParams;

  const order = tradeNo
    ? await prisma.order.findFirst({
        where: { merchantTradeNo: tradeNo },
      })
    : null;

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link href="/" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-200">
        ← 回首頁
      </Link>

      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-8">
        <h1 className="mb-4 text-2xl font-bold text-emerald-400">✅ 付款完成</h1>

        {order ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-neutral-400">Merchant Trade No</dt>
              <dd className="font-mono">{order.merchantTradeNo}</dd>
            </div>
            {order.tradeNo && (
              <div>
                <dt className="text-neutral-400">OPay Trade No</dt>
                <dd className="font-mono">{order.tradeNo}</dd>
              </div>
            )}
            <div>
              <dt className="text-neutral-400">金額 Amount</dt>
              <dd>NT$ {order.totalAmount.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-neutral-400">付款方式 Payment Method</dt>
              <dd>{order.paymentMethod}</dd>
            </div>
            <div>
              <dt className="text-neutral-400">狀態 Status</dt>
              <dd className="capitalize">{order.paymentStatus}</dd>
            </div>
            {order.paymentDate && (
              <div>
                <dt className="text-neutral-400">付款時間 Payment Date</dt>
                <dd>{order.paymentDate}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-neutral-400">
            {tradeNo
              ? `找不到訂單 ${tradeNo}（可能尚未收到 callback）`
              : "無交易編號 — 請從結帳頁面開始"}
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/checkout"
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-800"
        >
          再次付款
        </Link>
        <Link
          href="/orders"
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-800"
        >
          查看訂單
        </Link>
      </div>
    </main>
  );
}
