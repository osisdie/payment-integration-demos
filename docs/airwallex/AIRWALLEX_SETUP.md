# Airwallex Payment — Setup Guide

## Prerequisites

- Node.js 20+
- pnpm 9+

## 1. Create an Airwallex Account

### English

1. Sign up at [Airwallex Dashboard](https://www.airwallex.com/app/sign-up)
2. Complete identity verification (sandbox is available immediately)
3. Toggle to **Demo** mode in the top-right corner

### 中文

1. 前往 [Airwallex 控制台](https://www.airwallex.com/app/sign-up) 註冊帳號
2. 完成身份驗證（沙箱模式可立即使用）
3. 右上角切換至 **Demo** 模式

## 2. API Credentials

### English

Navigate to **Account → API Keys** in the Dashboard:

| Variable | Where to find |
|----------|---------------|
| `AIRWALLEX_CLIENT_ID` | "Client ID" field |
| `AIRWALLEX_API_KEY` | "API Key" field (shown once — copy immediately) |

### 中文

前往 控制台 → **Account → API Keys**：

| 變數 | 位置 |
|------|------|
| `AIRWALLEX_CLIENT_ID` | "Client ID" 欄位 |
| `AIRWALLEX_API_KEY` | "API Key" 欄位（只顯示一次，請立即複製） |

## 3. Webhook Configuration

### English

Navigate to **Account → Webhooks** in the Dashboard:

1. Click **Add endpoint**
2. URL: Your public URL + `/api/webhooks/airwallex`
   - Local dev: use ngrok or cloudflared (see below)
   - Example: `https://abc123.ngrok.io/api/webhooks/airwallex`
3. Select events: `payment_intent.succeeded`, `payment_intent.cancelled`, `refund.succeeded`
4. Copy the **Webhook signing secret** → `AIRWALLEX_WEBHOOK_SECRET`

### 中文

前往 控制台 → **Account → Webhooks**：

1. 點擊 **Add endpoint**
2. URL：你的公開網址 + `/api/webhooks/airwallex`
   - 本地開發：使用 ngrok 或 cloudflared（見下方）
3. 選擇事件：`payment_intent.succeeded`、`payment_intent.cancelled`、`refund.succeeded`
4. 複製 **Webhook signing secret** → 填入 `AIRWALLEX_WEBHOOK_SECRET`

## 4. Environment Setup

```bash
cd airwallex-payment
cp .env.example .env
# Fill in your credentials:
#   AIRWALLEX_CLIENT_ID
#   AIRWALLEX_API_KEY
#   AIRWALLEX_WEBHOOK_SECRET
```

## 5. Local Tunnel for Webhooks

Unlike Stripe (which has `stripe listen` CLI), Airwallex requires a public URL for webhooks.

### ngrok

```bash
ngrok http 3002
# Copy the https://xxx.ngrok.io URL
# Update .env: NEXT_PUBLIC_APP_URL="https://xxx.ngrok.io"
# Update Dashboard webhook URL: https://xxx.ngrok.io/api/webhooks/airwallex
```

### cloudflared

```bash
cloudflared tunnel --url http://localhost:3002
# Copy the https://xxx.trycloudflare.com URL
# Same updates as ngrok
```

## 6. Test Card Numbers

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Declined |

Use any future expiry date and any 3-digit CVC.

## 7. Key Differences from Other Payment Providers

| Aspect | Stripe | OPay | Airwallex |
|--------|--------|------|-----------|
| Amount unit | Minor (cents) | Integer TWD | **Major** (dollars) |
| Server SDK | Official `stripe` | Custom (no official) | Raw `fetch()` (no official) |
| Frontend SDK | `@stripe/stripe-js` | Form POST | `@airwallex/components-sdk` |
| Webhook verify | `stripe.webhooks.constructEvent` | CheckMacValue HMAC-SHA256 | HMAC-SHA256 (`x-timestamp` + body) |
| Local webhook | `stripe listen` CLI | ngrok/cloudflared | ngrok/cloudflared |
| Auth | Secret key (header) | HashKey/HashIV per request | Bearer token (login → cache) |
