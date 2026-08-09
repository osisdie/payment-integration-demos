import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.35),transparent)]"
      />

      <main className="relative mx-auto flex max-w-3xl flex-col gap-12 px-6 py-20">
        <header className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-violet-300/90">
            payment-examples · community
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Stripe · Next.js · Prisma · SQLite
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-neutral-400">
            Two minimal flows powered by Stripe Checkout redirects:{" "}
            <span className="text-neutral-200">payment</span> and{" "}
            <span className="text-neutral-200">subscription</span>. Your own keys, test mode, webhook
            CLI forwarding to persist rows locally.
          </p>
          <Link
            href="/success"
            className="inline-block font-mono text-sm text-violet-400 underline-offset-4 hover:underline"
          >
            Open success shell (needs session_id)
          </Link>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/40 backdrop-blur">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-xs text-emerald-300 ring-1 ring-emerald-400/40">
                mode: payment
              </span>
              <h2 className="text-xl font-medium text-white">One-time Checkout</h2>
              <p className="text-sm leading-relaxed text-neutral-400">
                Uses inline <code className="text-neutral-300">price_data</code> unless{" "}
                <code className="text-neutral-300">STRIPE_PRICE_ONE_TIME</code> is set to a Dashboard
                price ID (<code className="font-mono text-xs">price_...</code>
                ).
              </p>
            </div>
            <form action="/api/checkout/one-time" method="POST" className="mt-8">
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:brightness-105 active:translate-y-[1px]"
              >
                Pay demo price (USD&nbsp;$5.99)
              </button>
            </form>
          </article>

          <article className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/40 backdrop-blur">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-violet-500/15 px-2.5 py-0.5 font-mono text-xs text-violet-200 ring-1 ring-violet-400/40">
                mode: subscription
              </span>
              <h2 className="text-xl font-medium text-white">Monthly subscription</h2>
              <p className="text-sm leading-relaxed text-neutral-400">
                Requires a recurring Stripe Price ID in{" "}
                <code className="break-all font-mono text-xs text-neutral-300">
                  STRIPE_PRICE_SUBSCRIPTION_MONTHLY
                </code>
                . Create a product → recurring price in the Dashboard first.
              </p>
            </div>
            <form action="/api/checkout/subscribe" method="POST" className="mt-8">
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-105 active:translate-y-[1px]"
              >
                Subscribe (monthly)
              </button>
            </form>
          </article>
        </section>

        <footer className="rounded-xl border border-dashed border-white/15 bg-black/40 p-4 font-mono text-xs leading-relaxed text-neutral-500">
          <strong className="text-neutral-300">Reminder:</strong> run{" "}
          <span className="text-violet-300">stripe listen --forward-to localhost:3000/api/webhooks/stripe</span>
          {" "}
          in test mode before paying; copy the webhook signing secret into{" "}
          <code className="text-neutral-200">STRIPE_WEBHOOK_SECRET</code>. See docs/STRIPE_SETUP.md.
        </footer>
      </main>
    </div>
  );
}
