# payment-examples

Mono-repo of runnable **payment-integration demos** — TypeScript, Next.js (App Router), Prisma + SQLite.

| App | Payment Provider | Features |
|-----|-----------------|----------|
| [`stripe-checkout/`](stripe-checkout/) | Stripe | One-time payment, subscription, signed webhooks |

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

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — diagrams and module map
- [docs/stripe/](docs/stripe/) — Stripe keys, webhook, local sandbox
- [docs/screenshots/](docs/screenshots/) — screenshot file naming
- [docs/playwright-mcp.md](docs/playwright-mcp.md) — Playwright screenshots

## Scripts (workspace root)

| Command | Purpose |
|---------|---------|
| `pnpm dev:stripe` | Start Stripe demo (port 3000) |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all tests |

See each app's `package.json` for app-specific scripts.

**License:** [MIT](LICENSE)

---

## 簡介（中文）

本專案以 **pnpm workspace** 管理多個支付整合範例。每個子專案為獨立的 Next.js App Router 應用程式，使用 Prisma + SQLite。

- **stripe-checkout/** — Stripe Checkout（一次性付款 + 訂閱）

各子專案詳見其 README。
