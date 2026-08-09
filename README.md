# payment-examples

Mono-repo of runnable **payment-integration demos** — TypeScript, Next.js (App Router), Prisma + SQLite.

| App | Payment Provider | Features |
|-----|-----------------|----------|
| [`stripe-checkout/`](stripe-checkout/) | Stripe | One-time payment, subscription, signed webhooks |
| [`opay-payment/`](opay-payment/) | OPay 歐付寶 | AIO credit card, TWQR dynamic QR, refund, e-invoice, B2B2C platform, reports |

## Quick Start

```bash
pnpm install
```

### Stripe Checkout

```bash
cd stripe-checkout
cp .env.example .env   # fill STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_SUBSCRIPTION_MONTHLY
pnpm db:migrate
pnpm dev               # http://localhost:3000
```

In another terminal: `pnpm stripe:listen` (requires [Stripe CLI](https://stripe.com/docs/stripe-cli)).

→ [Stripe setup guide](docs/stripe/STRIPE_SETUP.md) · [Local verify](docs/stripe/STRIPE_LOCAL_VERIFY.md)

### OPay 歐付寶

```bash
cd opay-payment
cp .env.example .env   # stage test credentials pre-filled
pnpm db:migrate
pnpm dev               # http://localhost:3001
```

For payment callbacks, expose localhost via [ngrok](https://ngrok.com/) or [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/):

```bash
ngrok http 3001
# Update NEXT_PUBLIC_APP_URL in .env with the ngrok URL
```

→ [OPay setup guide](docs/opay/OPAY_SETUP.md) · [Local verify](docs/opay/OPAY_LOCAL_VERIFY.md)

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — diagrams and module map
- [docs/stripe/](docs/stripe/) — Stripe keys, webhook, local sandbox
- [docs/opay/](docs/opay/) — OPay PDF specs (TWQR, AIO, e-invoice, merchant backend)
- [docs/screenshots/](docs/screenshots/) — screenshot file naming
- [docs/playwright-mcp.md](docs/playwright-mcp.md) — Playwright screenshots

## Scripts (workspace root)

| Command | Purpose |
|---------|---------|
| `pnpm dev:stripe` | Start Stripe demo (port 3000) |
| `pnpm dev:opay` | Start OPay demo (port 3001) |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all tests |

See each app's `package.json` for app-specific scripts.

**License:** [MIT](LICENSE)

---

## 簡介（中文）

本專案以 **pnpm workspace** 管理多個支付整合範例。每個子專案為獨立的 Next.js App Router 應用程式，使用 Prisma + SQLite。

- **stripe-checkout/** — Stripe Checkout（一次性付款 + 訂閱）
- **opay-payment/** — 歐付寶全方位金流（AIO 信用卡、TWQR 動態碼、退款、電子發票、B2B2C 平台、對帳報表）

各子專案詳見其 README。
