import { NextResponse } from "next/server";
import { appUrl, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  try {
    const priceId = process.env.STRIPE_PRICE_SUBSCRIPTION_MONTHLY?.trim();
    if (!priceId?.startsWith("price_")) {
      return NextResponse.json(
        {
          error:
            "Set STRIPE_PRICE_SUBSCRIPTION_MONTHLY to a recurring Price ID (price_…) from Stripe Dashboard.",
        },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const base = appUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_types: ["card"],
      success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout/subscribe]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
