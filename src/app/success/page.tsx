import Link from "next/link";
import type { ReactNode } from "react";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

async function loadCheckoutSession(
  sessionId: string,
): Promise<{ ok: true; session: Stripe.Checkout.Session } | { ok: false }> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    return { ok: true, session };
  } catch {
    return { ok: false };
  }
}

function SessionSummary({ session }: { session: Stripe.Checkout.Session }): ReactNode {
  return (
    <div className="space-y-2 text-neutral-300">
      <p>
        <span className="font-medium text-white">Stripe session:</span> {session.id}
      </p>
      <p>
        <span className="font-medium text-white">Mode:</span> {session.mode}
      </p>
      <p>
        <span className="font-medium text-white">Payment status:</span> {session.payment_status}
      </p>
      {session.customer_email ? (
        <p>
          <span className="font-medium text-white">Customer email:</span> {session.customer_email}
        </p>
      ) : null}
      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
        Persisted rows are written by <code className="font-mono">POST /api/webhooks/stripe</code> (
        <code className="font-mono">checkout.session.completed</code>). Use Stripe CLI forwarding while
        developing locally so the webhook runs after pay.
      </p>
    </div>
  );
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  let summary: ReactNode = (
    <>
      Missing <code className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-100">session_id</code> in the
      URL — open this page via the Stripe success redirect after checkout.
    </>
  );

  if (sessionId) {
    const result = await loadCheckoutSession(sessionId);
    summary = result.ok ? (
      <SessionSummary session={result.session} />
    ) : (
      <>Could not load this session — check STRIPE_SECRET_KEY and session_id.</>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-8 px-6 py-20">
      <h1 className="text-balance font-mono text-2xl tracking-tight text-white">Checkout complete</h1>
      {summary}
      <Link
        href="/"
        className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-500"
      >
        Back to demo home
      </Link>
    </div>
  );
}
