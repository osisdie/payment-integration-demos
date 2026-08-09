# Architecture

This repository is a **pnpm-workspace mono-repo** with independent payment-integration demos. Each sub-project is a **Next.js (App Router)** app with **Prisma 6 + SQLite**.

## Workspace Layout

```
payment-examples/
├── stripe-checkout/      # Stripe Checkout (one-time + subscription)
├── opay-payment/         # OPay 歐付寶 (AIO credit card, TWQR, e-invoice, refund, reports)
├── airwallex-payment/    # Airwallex (Hosted Payment Page, webhook, refund)
└── docs/
    ├── stripe/           # Stripe setup guides
    ├── opay/             # OPay PDF specs (TWQR, AIO, e-invoice, merchant backend)
    └── airwallex/        # Airwallex setup + local verify
```

---

## Stripe Checkout Flow

```mermaid
sequenceDiagram
  participant Browser
  participant NextAPI
  participant StripeAPI
  participant Webhook
  participant Prisma

  Browser->>NextAPI: POST /api/checkout/one-time or /subscribe
  NextAPI->>StripeAPI: checkout.sessions.create
  StripeAPI-->>NextAPI: checkout URL
  NextAPI-->>Browser: HTTP 303 redirect
  Browser->>StripeAPI: Customer pays on Stripe Checkout
  StripeAPI->>Webhook: Signed event POST
  Webhook->>Prisma: upsert CheckoutPayment or SubscriptionRecord
```

### Persistence

| Model | Written when |
|-------|----------------|
| `CheckoutPayment` | `checkout.session.completed` with `mode=payment` |
| `SubscriptionRecord` | Subscription checkout completes or subscription status webhooks |

### Key files

| Path | Role |
|------|------|
| [stripe-checkout/src/app/api/checkout/one-time/route.ts](../stripe-checkout/src/app/api/checkout/one-time/route.ts) | Stripe Checkout Session, `mode: payment` |
| [stripe-checkout/src/app/api/checkout/subscribe/route.ts](../stripe-checkout/src/app/api/checkout/subscribe/route.ts) | Stripe Checkout Session, `mode: subscription` |
| [stripe-checkout/src/app/api/webhooks/stripe/route.ts](../stripe-checkout/src/app/api/webhooks/stripe/route.ts) | Signature verification + DB writes |
| [stripe-checkout/prisma/schema.prisma](../stripe-checkout/prisma/schema.prisma) | SQLite models |

---

## OPay 歐付寶 Flow

### AIO Credit Card Payment

```mermaid
sequenceDiagram
  participant Browser
  participant NextAPI
  participant OPayAPI
  participant Callback
  participant Prisma

  Browser->>NextAPI: POST /api/checkout/aio
  NextAPI->>NextAPI: Build params + CheckMacValue
  NextAPI-->>Browser: Self-submitting HTML form
  Browser->>OPayAPI: Form POST to /Cashier/AioCheckOut/V5
  OPayAPI-->>Browser: OPay hosted payment page
  Browser->>OPayAPI: Customer pays
  OPayAPI->>Callback: POST to ReturnURL (server-side)
  Callback->>Callback: Verify CheckMacValue
  Callback->>Prisma: Update Order status
  Callback-->>OPayAPI: "1|OK"
  OPayAPI-->>Browser: Redirect to OrderResultURL
```

### TWQR Dynamic QR Code Payment

```mermaid
sequenceDiagram
  participant Browser
  participant NextAPI
  participant OPayAPI
  participant Callback
  participant Prisma

  Browser->>NextAPI: POST /api/twqr/create
  NextAPI->>NextAPI: AES encrypt Data + CheckMacValue
  NextAPI->>OPayAPI: POST /TWQRCashier/CreateTrade
  OPayAPI-->>NextAPI: TWQRCode + ExpireDate (encrypted)
  NextAPI->>NextAPI: AES decrypt response
  NextAPI-->>Browser: QR code data
  Browser->>Browser: Display QR + poll every 5s
  Note over Browser,OPayAPI: Consumer scans QR with bank/payment app
  OPayAPI->>Callback: POST to ReturnURL (encrypted)
  Callback->>Prisma: Update Order status
  Browser->>NextAPI: Poll /api/twqr/query → paid
```

### E-Invoice Flow

```mermaid
sequenceDiagram
  participant App
  participant NextAPI
  participant OPayInvoice
  participant Prisma

  App->>NextAPI: POST /api/invoice/issue
  NextAPI->>NextAPI: AES encrypt + CheckMacValue
  NextAPI->>OPayInvoice: POST /B2CInvoice/Issue
  OPayInvoice-->>NextAPI: InvoiceNo + RandomNumber
  NextAPI->>Prisma: Save Invoice record
  NextAPI-->>App: Invoice issued
```

### Persistence

| Model | Written when |
|-------|-------------|
| `Merchant` | Seed or admin setup (B2B2C sub-merchants) |
| `Order` | AIO checkout or TWQR create; updated on callback |
| `Invoice` | E-Invoice issued; updated on void |
| `Refund` | DoAction refund or TWQR chargeback |

### Key files

| Path | Role |
|------|------|
| `opay-payment/src/lib/opay/check-mac-value.ts` | HMAC-SHA256 CheckMacValue |
| `opay-payment/src/lib/opay/aes-encrypt.ts` | AES-128-CBC-PKCS7 encrypt/decrypt |
| `opay-payment/src/lib/opay/aio-client.ts` | AIO payment API wrapper |
| `opay-payment/src/lib/opay/twqr-client.ts` | TWQR QR payment API wrapper |
| `opay-payment/src/lib/opay/invoice-client.ts` | E-Invoice API wrapper |
| `opay-payment/prisma/schema.prisma` | Merchant, Order, Invoice, Refund models |

---

## Airwallex Payment Flow

```mermaid
sequenceDiagram
  participant Browser
  participant NextAPI
  participant AirwallexAPI
  participant Webhook
  participant Prisma

  Browser->>NextAPI: POST /api/checkout
  NextAPI->>AirwallexAPI: POST /authentication/login
  AirwallexAPI-->>NextAPI: Bearer token (cached)
  NextAPI->>AirwallexAPI: POST /pa/payment_intents/create
  AirwallexAPI-->>NextAPI: { id, client_secret }
  NextAPI->>Prisma: Create PaymentIntent (INITIAL)
  NextAPI-->>Browser: { payment_intent_id, client_secret }
  Browser->>Browser: @airwallex/components-sdk init()
  Browser->>AirwallexAPI: redirectToCheckout (Hosted Payment Page)
  Note over Browser,AirwallexAPI: Customer enters card details
  AirwallexAPI-->>Browser: Redirect to /success
  AirwallexAPI->>Webhook: POST /api/webhooks/airwallex (HMAC signed)
  Webhook->>Webhook: Verify x-timestamp + x-signature
  Webhook->>Prisma: Update PaymentIntent → SUCCEEDED
```

### Refund Flow

```mermaid
sequenceDiagram
  participant Browser
  participant NextAPI
  participant AirwallexAPI
  participant Prisma

  Browser->>NextAPI: POST /api/refund
  NextAPI->>Prisma: Look up PaymentIntent
  NextAPI->>AirwallexAPI: POST /pa/refunds/create
  AirwallexAPI-->>NextAPI: Refund object
  NextAPI->>Prisma: Create Refund record
  NextAPI-->>Browser: Refund result
```

### Persistence

| Model | Written when |
|-------|-------------|
| `PaymentIntent` | Checkout creates intent; webhook updates status |
| `Refund` | Refund request; webhook confirms |

### Key files

| Path | Role |
|------|------|
| `airwallex-payment/src/lib/airwallex/auth.ts` | Bearer token acquisition + cache |
| `airwallex-payment/src/lib/airwallex/client.ts` | Payment intent + refund API wrappers |
| `airwallex-payment/src/lib/airwallex/webhook.ts` | HMAC-SHA256 signature verification |
| `airwallex-payment/src/app/api/checkout/route.ts` | Create payment intent |
| `airwallex-payment/src/app/api/webhooks/airwallex/route.ts` | Webhook handler |
| `airwallex-payment/prisma/schema.prisma` | PaymentIntent, Refund models |

---

## Postgres (optional swap)

Replace `provider = "sqlite"` with PostgreSQL in either app's `schema.prisma`, set `DATABASE_URL` to your connection string, and run `pnpm db:migrate`. SQLite stays simplest for local demos.
