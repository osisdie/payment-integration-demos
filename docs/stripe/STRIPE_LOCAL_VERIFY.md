# Local purchase + cancel / refund (Stripe **test mode**)

Stripe does not ship CLI binaries inside this repo. **Test mode** plus **Stripe CLI** on your machine is the standard local “sandbox” workflow.

## 1) Install Stripe CLI (one-time on your computer)

- **macOS**: `brew install stripe/stripe-cli/stripe`
- **Windows**: [installer](https://docs.stripe.com/stripe-cli#install) or Scoop  
- **Linux**: [packages](https://docs.stripe.com/stripe-cli#install)

Verify:

```bash
stripe --version
stripe login
```

## 2) Three terminals (fastest loop)

| Terminal | Command |
|----------|---------|
| A | `pnpm db:migrate` (once) then `pnpm dev` |
| B | `pnpm stripe:listen` — copy `whsec_…` into `.env` as `STRIPE_WEBHOOK_SECRET`, restart A if needed |
| C | After purchase/cancel, optional: `pnpm stripe:cancel-sub` / `pnpm stripe:refund-last` |

**Test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

## 3) One-time payment → refund

1. Open `http://localhost:3000` → **Pay demo price**.
2. Pay with the test card.
3. Confirm `CheckoutPayment` (`pnpm db:studio`).
4. **Refund:** `pnpm stripe:refund-last`

## 4) Subscription → cancel（退訂）

1. Set `STRIPE_PRICE_SUBSCRIPTION_MONTHLY` to a recurring Dashboard price (`price_…`).
2. **Subscribe** from the home page; complete payment with the test card.
3. Confirm `SubscriptionRecord` is `active` or `trialing`.
4. **Cancel immediately:** `pnpm stripe:cancel-sub` or `pnpm stripe:cancel-sub -- sub_xxx`
5. Webhooks update the DB row (`canceled`, etc.).

## 5) Safety notes

- Helper scripts accept **only** `sk_test…`. They exit on live keys.
- When you restart `stripe listen`, the webhook secret changes — refresh `STRIPE_WEBHOOK_SECRET`.

---

## 中文（本機 sandbox / 測試模式）

1. **請在本機安裝 Stripe CLI**（無法只靠 `pnpm install`）：安裝後 `stripe login`。
2. 建議開 **三個終端**：① `pnpm dev` ② `pnpm stripe:listen`（`whsec` 寫入 `.env`）③ 購買後執行 `pnpm stripe:cancel-sub`／`pnpm stripe:refund-last`。
3. **購買**：測試卡 `4242 4242 4242 4242`。
4. **一次性退款**：完成付款與 webhook 後 `pnpm stripe:refund-last`。
5. **訂閱退訂**：完成訂閱後 `pnpm stripe:cancel-sub`（或由 Dashboard 取消）；依 webhook 更新本地 DB。

Stripe 文件中與 sandbox 對應的是 **Test mode（測試模式）**，不是另外的獨立 URL。
