# Contributing to Payment Integration Demos

Thank you for your interest in contributing! This project is a collection of runnable payment integration demos built with Next.js, Prisma, and TypeScript.

## Getting Started

1. **Fork & clone** the repo
2. **Install dependencies**: `pnpm install`
3. **Pick an app** to work on (`stripe-checkout/`, `opay-payment/`, `airwallex-payment/`)
4. **Copy `.env.example`** to `.env` and fill in credentials
5. **Run migrations**: `cd <app> && pnpm db:migrate`
6. **Start dev server**: `pnpm dev`

## How to Contribute

### Bug Reports & Feature Requests

- Use [GitHub Issues](https://github.com/osisdie/payment-integration-demos/issues) with the provided templates
- For payment provider-specific issues, prefix the title with `[stripe]`, `[opay]`, or `[airwallex]`

### Pull Requests

1. **Branch from `main`** — use a descriptive branch name:
   - `feat/stripe-subscription-support`
   - `fix/opay-checksum-edge-case`
   - `docs/airwallex-webhook-setup`

2. **Follow [Conventional Commits](https://www.conventionalcommits.org/)**:
   ```
   feat(opay): add TWQR partial refund support
   fix(stripe): handle expired session gracefully
   docs: update Airwallex local testing guide
   chore: bump prisma to v6.x
   ```

3. **Scope changes** — keep PRs focused on one app or one concern

4. **Run checks** before pushing:
   ```bash
   cd <app>
   pnpm lint          # ESLint
   pnpm build         # TypeScript + Next.js build
   pnpm exec playwright test  # E2E (if applicable)
   ```

5. **Write PR descriptions in English** — explain what changed and why

### Adding a New Payment Provider

We welcome PRs adding new payment providers! Follow the existing pattern:

1. Create a new directory at the root (e.g., `paypal-payment/`)
2. Use the same stack: Next.js App Router + Prisma + SQLite + Tailwind + TypeScript
3. Include: checkout flow, webhook/callback handling, order list, refund
4. Add `.env.example` with commented credentials or public test keys
5. Add Playwright E2E screenshot tests
6. Add a setup guide in `docs/<provider>/`
7. Update root `README.md`, `CLAUDE.md`, and `pnpm-workspace.yaml`

## Development Notes

- **Port assignment**: Stripe = 3000, OPay = 3001, Airwallex = 3002 (next = 3003)
- **Database**: SQLite by default; each app has its own `prisma/dev.db`
- **OPay Stage credentials** are public test keys shared by all developers — see `.env.example` for source references
- **Stripe / Airwallex credentials** are per-account — never commit real keys

## Code Style

- Each app has its own ESLint config — run `pnpm lint` from within the app directory
- Use TypeScript strict mode
- Prefer server components; use `"use client"` only when needed
- Match the existing code style and comment density of surrounding files

## Questions?

- Open a [Discussion](https://github.com/osisdie/payment-integration-demos/discussions) for questions or ideas
- File an [Issue](https://github.com/osisdie/payment-integration-demos/issues) for bugs or feature requests
