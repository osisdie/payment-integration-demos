# Screenshots

Prefer **Playwright MCP** (configured in [`.cursor/mcp.json`](../../.cursor/mcp.json)): temporary captures go to **`.playwright-mcp/`** (ignored by Git). Copy winners here for the repo. Use **`pnpm screenshots`** for committed `01-home` / `03-success` via `@playwright/test`. Details: [`docs/playwright-mcp.md`](../playwright-mcp.md).

| File | What to capture |
|------|-----------------|
| `01-home.png` | Landing page (`/`) — `pnpm screenshots` or MCP |
| `02-stripe-checkout.png` | Stripe-hosted Checkout — **MCP or manual only** |
| `03-success.png` | Default: `/success` shell from test; after a real test payment, overwrite via MCP with `?session_id=…` |
| `04-prisma-studio.png` | Prisma Studio — manual (`pnpm db:studio`) |
| `05-stripe-cli.png` | Terminal `stripe listen --forward-to …` — manual |

Stripe’s hosted UI changes over time; keep README captions high-level.
