# Stripe setup (English)

1. **Stripe account** — use [Test mode](https://docs.stripe.com/test-mode) (`sk_test…`, `pk_test…`).
2. **Dashboard → Products** — optional product for visuals; subscription flow needs a **recurring Price** copied as `price_…`.
3. **API keys** — Developers → API keys → **Secret key** → `STRIPE_SECRET_KEY` in `.env`.
4. **Webhook signing secret (local)** — install [Stripe CLI](https://docs.stripe.com/stripe-cli), log in (`stripe login`), run:
   ```bash
   pnpm stripe:listen
   ```
   Copy `whsec_…` → `STRIPE_WEBHOOK_SECRET`.
5. **Database** — `cp .env.example .env`, set vars, then:
   ```bash
   pnpm db:migrate
   ```
6. **Quick local verify (purchase + refund / cancel sub)** — see **[docs/STRIPE_LOCAL_VERIFY.md](./STRIPE_LOCAL_VERIFY.md)** (`pnpm stripe:listen`, `pnpm stripe:cancel-sub`, `pnpm stripe:refund-last`).

### Events this demo listens for

- `checkout.session.completed` — persists **one-off** payments to `CheckoutPayment`, and completes **subscription** snapshot after retrieving the Stripe Subscription object.
- `customer.subscription.updated` / `deleted` — updates `SubscriptionRecord`.

### Troubleshooting

- **Webhook never fires** — ensure CLI is forwarding *before* submitting Checkout; rerun `pnpm stripe:listen` if the secret rotates.
- **Subscription button returns 400** — set `STRIPE_PRICE_SUBSCRIPTION_MONTHLY` to a **monthly recurring** price you created in the Dashboard.
- **Prisma / SQLite** — default URL is `file:./prisma/dev.db` (see `.env.example`).

---

## Stripe 設定（中文）

1. **使用測試模式**：從 Stripe Dashboard 取得 `sk_test…` 金鑰，填入 `.env` 的 `STRIPE_SECRET_KEY`。
2. **訂閱價格**：在「產品」建立**週期計費**價格，複製 `price_…` 到 `STRIPE_PRICE_SUBSCRIPTION_MONTHLY`。
3. **本機 Webhook**：安裝 Stripe CLI 後執行 `stripe login`，再執行 `pnpm stripe:listen`，將 `whsec_…` 設為 `STRIPE_WEBHOOK_SECRET`。
4. **資料庫**：複製 `.env.example` 為 `.env`，執行 `pnpm db:migrate` 建立 SQLite 檔。
5. **本機快速驗證（購買／退款／退訂）**：請看 **[docs/STRIPE_LOCAL_VERIFY.md](./STRIPE_LOCAL_VERIFY.md)**（含 `pnpm stripe:listen`、`pnpm stripe:cancel-sub`、`pnpm stripe:refund-last`）。

此範例僅作教學用途；上線前請另設正式環境變數、HTTPS、以及 Dashboard 內註冊的正式 Webhook 端點。
