# OPay Setup Guide / 歐付寶環境設定

## Environment Variables

Copy `.env.example` and fill in your credentials:

```bash
cd opay-payment
cp .env.example .env
```

### Stage (Test) — 測試環境

The `.env.example` comes pre-filled with OPay stage credentials. You can start testing immediately.

| Variable | Stage Default | Description |
|----------|---------------|-------------|
| `OPAY_ENV` | `stage` | `stage` or `production` |
| `OPAY_MERCHANT_ID` | `2000132` | AIO payment MerchantID |
| `OPAY_HASH_KEY` | `5294y06JbISpM5x9` | AIO HashKey |
| `OPAY_HASH_IV` | `v77hoKGq4kWxNNIS` | AIO HashIV |
| `OPAY_TWQR_MERCHANT_ID` | `2032990` | TWQR MerchantID |
| `OPAY_TWQR_HASH_KEY` | `zZ3TY0OnRvh1S1Sy` | TWQR HashKey |
| `OPAY_TWQR_HASH_IV` | `IJpIyW5lGSISNPZv` | TWQR HashIV |
| `OPAY_INVOICE_MERCHANT_ID` | `2000132` | E-Invoice MerchantID |
| `OPAY_INVOICE_HASH_KEY` | `ejCk326UnaZWKisg` | E-Invoice HashKey |
| `OPAY_INVOICE_HASH_IV` | `q9jcZX8Ib9LM8wYk` | E-Invoice HashIV |

### Production — 正式環境

1. Register at [https://www.opay.tw](https://www.opay.tw)
2. After approval, get your MerchantID, HashKey, HashIV from the merchant backend
3. Set `OPAY_ENV=production` and replace all credential values

### B2B2C Platform — 平台模式

Set `OPAY_PLATFORM_ID` to enable platform mode. The platform's own HashKey/HashIV are used for encryption, while `OPAY_MERCHANT_ID` identifies the sub-merchant.

## Callback URL (ReturnURL) — 回呼網址

Unlike Stripe CLI (which has built-in forwarding), OPay requires a **publicly accessible URL** for payment callbacks.

### Local Development — 使用 ngrok

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3001

# Copy the HTTPS URL (e.g. https://abc123.ngrok-free.app)
# Update .env:
NEXT_PUBLIC_APP_URL="https://abc123.ngrok-free.app"
```

### Alternative: Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3001
```

## Merchant Backend — 廠商後台

| Environment | URL | Credentials |
|-------------|-----|-------------|
| Stage | https://vendor-stage.opay.tw | StageTest / test1234 |
| Production | https://vendor.opay.tw | Your registered account |

## Test Card — 測試卡號

| Field | Value |
|-------|-------|
| Card Number | 4311952222222222 |
| Expiry | Any future date |
| CVV | Any 3 digits |
| Cardholder | Any name |

> ⚠️ Test card only works with stage MerchantID. Production requires real cards.

---

## 繁體中文說明

### 環境變數

`.env.example` 已預填測試環境金鑰，可直接使用。三套 API 系統有各自的 HashKey/HashIV：

1. **AIO 全方位金流** — 信用卡、ATM、超商等
2. **TWQR 台灣Pay** — 動態 QR Code
3. **電子發票** — 開立/作廢發票

### 回呼網址

歐付寶需要可公開存取的 ReturnURL。本機開發請使用 ngrok 或 cloudflared tunnel，將 URL 設為 `NEXT_PUBLIC_APP_URL`。

### B2B2C 平台

設定 `OPAY_PLATFORM_ID` 啟用平台模式。平台使用自己的 HashKey/HashIV 加密，`OPAY_MERCHANT_ID` 為子特店編號。
