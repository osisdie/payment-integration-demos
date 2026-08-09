# opay-payment

OPay (歐付寶) payment integration demo — **TypeScript**, **Next.js 16 (App Router)**, **Prisma 6 + SQLite**.

## Features

| Feature | API | Route |
|---------|-----|-------|
| Credit card checkout (AIO) | `/Cashier/AioCheckOut/V5` | `POST /api/checkout/aio` |
| TWQR dynamic QR code | `/TWQRCashier/CreateTrade` | `POST /api/twqr/create` |
| Trade query | `/Cashier/QueryTradeInfo/V5` | `POST /api/query/trade` |
| Credit card refund | `/CreditDetail/DoAction` | `POST /api/refund/credit` |
| TWQR chargeback | `/TWQRCashier/Chargeback` | `POST /api/refund/twqr` |
| E-Invoice issue | `/B2CInvoice/Issue` | `POST /api/invoice/issue` |
| E-Invoice void | `/B2CInvoice/IssueInvalid` | `POST /api/invoice/void` |
| Funding report | `/CreditDetail/FundingReconDetail` | `POST /api/report/funding` |

## Quick Start

```bash
cp .env.example .env    # stage credentials pre-filled
pnpm install
pnpm db:migrate
pnpm db:seed            # optional: seed test merchants
pnpm dev                # http://localhost:3001
```

For callbacks, expose localhost via ngrok:

```bash
ngrok http 3001
# Update NEXT_PUBLIC_APP_URL in .env with the HTTPS URL
```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next.js dev server (port 3001) |
| `pnpm build` | `prisma generate` + production build |
| `pnpm db:migrate` | Apply Prisma migrations |
| `pnpm db:seed` | Seed test merchants |
| `pnpm db:studio` | Prisma Studio |
| `pnpm opay:query` | Query latest order's trade status |
| `pnpm opay:refund` | Refund latest paid order |
| `pnpm screenshots` | Playwright screenshots |

## Architecture

- **No official Node.js SDK** — `src/lib/opay/` is a custom implementation
- **Two encryption methods**: HMAC-SHA256 (CheckMacValue) + AES-128-CBC-PKCS7 (Data envelope)
- **Three credential sets**: AIO payment, TWQR, E-Invoice (each with separate HashKey/HashIV)
- **B2B2C platform**: PlatformID + platform's keys; MerchantID identifies sub-merchant

See [docs/opay/OPAY_SETUP.md](../docs/opay/OPAY_SETUP.md) and [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) for details.
