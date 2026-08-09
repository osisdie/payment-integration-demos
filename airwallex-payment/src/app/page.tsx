import Link from "next/link";

const FLOWS = [
  {
    title: "Credit Card Payment",
    desc: "One-time payment via Airwallex Hosted Payment Page — create intent, redirect to checkout.",
    href: "/checkout",
    color: "from-cyan-600 to-sky-500",
  },
  {
    title: "Order History",
    desc: "List payment intents and query their live status from Airwallex.",
    href: "/orders",
    color: "from-amber-600 to-yellow-500",
  },
  {
    title: "Refund",
    desc: "Issue a full or partial refund against a succeeded payment intent.",
    href: "/refund",
    color: "from-rose-600 to-pink-500",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        Airwallex · Next.js · Prisma · SQLite
      </h1>
      <p className="mb-10 text-neutral-400">
        Payment demo — Hosted Payment Page checkout, webhook verification, refund
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
        Demo environment · sandbox mode
      </footer>
    </main>
  );
}
