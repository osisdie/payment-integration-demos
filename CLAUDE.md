# Payment Integration Examples

Mono-repo of runnable payment-integration demos. Each sub-project is a self-contained Next.js (App Router) app with Prisma + SQLite.

## Workspace Layout

```
stripe-checkout/   — Stripe Checkout (one-time + subscription)
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
