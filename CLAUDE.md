# Payment Integration Examples

Mono-repo of runnable payment-integration demos. Each sub-project is a self-contained Next.js (App Router) app with Prisma + SQLite.

## Workspace Layout

```
stripe-checkout/   — Stripe Checkout (one-time + subscription)
opay-payment/      — OPay 歐付寶 (AIO credit card, TWQR, e-invoice, refund, reports)
docs/              — shared documentation and specs
```

## Quick Start

```bash
pnpm install          # installs all workspaces

# Stripe demo
cd stripe-checkout
cp .env.example .env  # fill Stripe keys
pnpm db:migrate
pnpm dev              # http://localhost:3000

# OPay demo
cd opay-payment
cp .env.example .env  # fill OPay keys (stage defaults included)
pnpm db:migrate
pnpm dev              # http://localhost:3001
```

## Conventions

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`
- **PR descriptions**: English
- **Code style**: each app has its own ESLint config; run `pnpm lint` from the app directory
- **Tests**: Playwright E2E per app — `pnpm exec playwright test`
- **Database**: SQLite by default; swap to Postgres by changing `provider` in `schema.prisma`

## Key Dependencies (shared across apps)

- Next.js 16 (App Router)
- React 19
- Prisma 6 + SQLite
- Tailwind CSS 4
- Playwright (E2E)
- TypeScript 5

## OPay-Specific Notes

- No official Node.js SDK — `opay-payment/src/lib/opay/` is a custom implementation
- Three separate credential sets: AIO payment, TWQR, E-Invoice
- Two crypto methods: HMAC-SHA256 (CheckMacValue) and AES-128-CBC-PKCS7 (Data envelope)
- B2B2C platform: PlatformID routes crypto through platform's keys, MerchantID identifies sub-merchant
- Local dev callback: requires ngrok or cloudflared tunnel (unlike Stripe CLI)
