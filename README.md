# payment-examples

GitHub-friendly **Stripe + TypeScript** reference: **Next.js (App Router)**, **Prisma 6 + SQLite**, two **Checkout** flows (one-time payment and monthly subscription), and a **signed webhook** that writes to the database.

**Quick start**

```bash
cp .env.example .env
# Fill STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_SUBSCRIPTION_MONTHLY
pnpm install
pnpm db:migrate
pnpm dev
```

In another terminal (Stripe CLI must be installed on your machine):

```bash
pnpm stripe:listen
```

Copy the printed `whsec_…` into `.env` as `STRIPE_WEBHOOK_SECRET`, restart `pnpm dev`, then open [http://localhost:3000](http://localhost:3000).

**Docs**

- [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) — keys、Webhook、環境變數（中英文）
- [docs/STRIPE_LOCAL_VERIFY.md](docs/STRIPE_LOCAL_VERIFY.md) — **本機購買／退款／退訂**（Stripe CLI + `pnpm stripe:*`）
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — diagram and module map
- [docs/playwright-mcp.md](docs/playwright-mcp.md) — **`.cursor/mcp.json`** Playwright MCP · temp files in **`.playwright-mcp/`**
- [docs/screenshots/README.md](docs/screenshots/README.md) — screenshot file naming

**Scripts**

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | `prisma generate` + production build |
| `pnpm db:migrate` | Apply Prisma migrations (SQLite at `prisma/dev.db` by default) |
| `pnpm db:studio` | Prisma Studio |
| `pnpm screenshots` | Playwright — writes `docs/screenshots/01-home.png`, `03-success.png` (first run: `pnpm exec playwright install chromium`) |
| `pnpm screenshots:headed` | Same as above with a visible browser window |
| `pnpm stripe:listen` | Stripe CLI：轉發 webhook 到本機（需先安裝 `stripe`） |
| `pnpm stripe:cancel-sub` | 測試模式：取消 DB 內最新作用中訂閱（或傳 `sub_xxx`） |
| `pnpm stripe:refund-last` | 測試模式：對最近一次一次性 Checkout 做全額退款 |

**License:** [MIT](LICENSE)

---

## 簡介（中文）

本專案示範以 **TypeScript** 實作 Stripe **Checkout**（一次性付款 + 訂閱），後端為 Next.js Route Handlers，資料庫為 **Prisma + SQLite**，並透過 **Stripe Webhook** 將結果寫入資料表。詳見 [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md) 的繁體說明與環境變數列表。

截圖：`pnpm screenshots` 產出可提交之 PNG；**Playwright MCP** 已寫入 [`.cursor/mcp.json`](.cursor/mcp.json)，臨時檔請只放在 **`.playwright-mcp/`**（已 ignore）。請以本 repo 根目錄作為 Cursor **工作區**，否則 `${workspaceFolder}` 路徑會錯。細節見 [docs/playwright-mcp.md](docs/playwright-mcp.md)。

