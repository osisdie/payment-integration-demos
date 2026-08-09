import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-900 text-yellow-300",
  issued: "bg-emerald-900 text-emerald-300",
  voided: "bg-red-900 text-red-300",
  allowance: "bg-violet-900 text-violet-300",
};

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-200">
        ← 回首頁
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">電子發票 Invoices</h1>
        <Link
          href="/invoices/issue"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          開立發票 Issue Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className="text-neutral-400">尚無發票記錄</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-800 text-neutral-400">
              <tr>
                <th className="pb-3 pr-4">Invoice No</th>
                <th className="pb-3 pr-4">Relate No</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">VAT (統編)</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-900">
                  <td className="py-3 pr-4 font-mono text-xs">
                    {inv.invoiceNo ?? "—"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{inv.relateNumber}</td>
                  <td className="py-3 pr-4">NT$ {inv.salesAmount.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-xs">
                    {inv.customerIdentifier || "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[inv.status] ?? "bg-neutral-800"}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-neutral-400">
                    {inv.invoiceDate ?? inv.createdAt.toISOString().slice(0, 10)}
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
