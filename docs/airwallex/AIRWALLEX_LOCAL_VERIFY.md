# Airwallex Payment — Local Verification

Step-by-step walkthrough to verify the integration locally.

## Prerequisites

- `.env` configured with valid Airwallex demo credentials (see [AIRWALLEX_SETUP.md](./AIRWALLEX_SETUP.md))
- Database migrated: `pnpm db:migrate`

## Terminal A — Dev Server

```bash
cd airwallex-payment
pnpm dev
# → http://localhost:3002
```

## Terminal B — Tunnel (for webhook)

```bash
ngrok http 3002
# Copy the HTTPS URL
```

Update `.env`:

```env
NEXT_PUBLIC_APP_URL="https://your-tunnel-url.ngrok.io"
```

Register the webhook URL in Airwallex Dashboard:
`https://your-tunnel-url.ngrok.io/api/webhooks/airwallex`

## Step 1 — Make a Payment

1. Open http://localhost:3002
2. Click **Credit Card Payment**
3. Enter amount (e.g. 9.99 USD) and click **Pay**
4. You'll be redirected to Airwallex's Hosted Payment Page
5. Enter test card: `4242 4242 4242 4242`, any future expiry, any CVC
6. Complete the payment
7. You'll be redirected to `/success` with payment details

## Step 2 — Verify Webhook

Check your terminal for:
```
Webhook: payment_intent.succeeded — int_hk...
```

Or verify in the database:
```bash
pnpm db:studio
# → Open PaymentIntent table, status should be SUCCEEDED
```

## Step 3 — Check Orders

1. Navigate to http://localhost:3002/orders
2. You should see your payment with a green "SUCCEEDED" badge

## Step 4 — Issue a Refund

1. Navigate to http://localhost:3002/refund
2. Select the succeeded order
3. Enter the refund amount (or leave as full amount)
4. Click **Submit Refund**
5. Check the webhook log for `refund.succeeded`

## Step 5 — CLI Helpers

```bash
# Query the latest payment intent from local DB
pnpm airwallex:query

# Query a specific intent from Airwallex API
pnpm airwallex:query -- int_hkXXXXXX

# Refund the latest succeeded order
pnpm airwallex:refund
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Airwallex auth failed (401)" | Check `AIRWALLEX_CLIENT_ID` and `AIRWALLEX_API_KEY` |
| Webhook not received | Ensure tunnel is running and URL is registered in Dashboard |
| "Invalid signature" in webhook | Check `AIRWALLEX_WEBHOOK_SECRET` matches Dashboard |
| Payment page doesn't load | Check `NEXT_PUBLIC_AIRWALLEX_ENV` is set to "demo" |
