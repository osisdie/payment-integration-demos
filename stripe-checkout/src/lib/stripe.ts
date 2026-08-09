import Stripe from "stripe";

let stripeSingleton: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) {
    throw new Error("Missing STRIPE_SECRET_KEY or invalid format (must start with sk_)");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, { typescript: true });
  }
  return stripeSingleton;
}

export function appUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? "3000"}`;
  return url.replace(/\/+$/, "");
}
