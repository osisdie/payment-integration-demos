import { NextResponse } from "next/server";
import { appUrl, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  try {
    const stripe = getStripe();
    const base = appUrl();

    let line_items;

    const priceOneTime = process.env.STRIPE_PRICE_ONE_TIME;
    if (priceOneTime && priceOneTime.trim().startsWith("price_")) {
      line_items = [{ price: priceOneTime.trim(), quantity: 1 }];
    } else {
      line_items = [
        {
          price_data: {
            currency: "usd",
            unit_amount: 599,
            product_data: {
              name: "Demo — one-time",
              description: "Community Stripe example — payment mode Checkout",
            },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
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
    console.error("[checkout/one-time]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
