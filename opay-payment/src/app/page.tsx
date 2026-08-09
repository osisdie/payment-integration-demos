import Link from "next/link";

const FLOWS = [
  {
    title: "信用卡付款 (AIO)",
    desc: "Credit card checkout via OPay AIO — redirects to OPay hosted payment page.",
    href: "/checkout",
    color: "from-blue-600 to-cyan-500",
  },
  {
    title: "TWQR 動態碼",
    desc: "Taiwan QR Code — generate a dynamic QR code for scan-to-pay.",
    href: "/twqr",
    color: "from-emerald-600 to-teal-500",
  },
  {
    title: "訂單查詢",
    desc: "Query trade status and list all orders.",
    href: "/orders",
    color: "from-amber-600 to-yellow-500",
  },
  {
    title: "電子發票",
    desc: "Issue / void e-invoices with B2B VAT (統一編號) support.",
    href: "/invoices",
    color: "from-violet-600 to-purple-500",
  },
  {
    title: "退款",
    desc: "Credit card refund (DoAction) and TWQR chargeback.",
    href: "/refund",
    color: "from-rose-600 to-pink-500",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        OPay 歐付寶 · Next.js · Prisma · SQLite
      </h1>
      <p className="mb-10 text-neutral-400">
        全方位金流 demo — AIO 信用卡、TWQR 動態碼、退款、電子發票、B2B2C 平台
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {FLOWS.map((flow) => (
          <Link
            key={flow.href}
            href={flow.href}
            className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-neutral-700"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${flow.color} opacity-0 transition group-hover:opacity-10`}
            />
            <h2 className="mb-2 text-lg font-semibold">{flow.title}</h2>
            <p className="text-sm text-neutral-400">{flow.desc}</p>
          </Link>
        ))}
      </div>

      <footer className="mt-16 text-center text-xs text-neutral-600">
        Stage environment · MerchantID: 2000132 · TWQR: 2032990
      </footer>
    </main>
  );
}
