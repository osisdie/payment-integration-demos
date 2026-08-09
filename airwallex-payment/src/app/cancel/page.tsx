import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-16 text-center">
      <div className="mb-6 text-5xl">❌</div>
      <h1 className="mb-4 text-2xl font-bold">Payment Cancelled</h1>
      <p className="mb-8 text-neutral-400">
        You cancelled the payment or it failed. No charge was made.
      </p>

      <div className="flex justify-center gap-4">
        <Link
          href="/checkout"
          className="rounded-lg border border-neutral-700 px-5 py-2 text-sm transition hover:border-neutral-500"
        >
          Try Again
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
