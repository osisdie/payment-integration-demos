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

For invoices, `merchantId` can be overridden per-request (via the UI or API) to issue invoices on behalf of sub-merchants. If omitted, the env default is used.

### AES Encryption — 加密順序差異

TWQR and E-Invoice APIs use **different** AES encryption sequences:

| API | Encrypt | Decrypt |
|-----|---------|---------|
| **TWQR** (CreateTrade, QueryTrade) | JSON → AES → Base64 → URL encode | URL decode → Base64 → AES → JSON |
| **TWQR Chargeback** | JSON → AES → Base64 (**no** URL encode) | Base64 → AES → JSON |
| **E-Invoice** | JSON → URL encode → AES → Base64 | Base64 → AES → URL decode → JSON |

The code handles this automatically: `invoiceMode` for E-Invoice, `rawBase64` for Chargeback (in `aes-encrypt.ts`).

> **Note**: The TWQR spec (p.23) says "加密後字串做 UrlEncode", but the Chargeback handler does not URL-decode the Data field before Base64-decoding — unlike CreateTrade/QueryTrade which do. This is a server-side inconsistency. Since the body is `application/json`, URL encoding is technically unnecessary; `rawBase64` skips it.

## Credit Card Close/Capture — 信用卡關帳

Credit card payments require **close/capture (關帳)** before a refund can be processed. The flow is:

```
Authorization (已授權) → Close/Capture (關帳) → Refund (退刷)
```

### How to close/capture

| Method | How |
|--------|-----|
| **API** | `DoAction` with `Action="C"` — supported in `aio-client.ts:doAction()` |
| **Merchant Backend** | 信用卡收單 → 交易明細查詢 → click 【關帳】 |
| **Auto-capture** | 廠商專區 → 信用卡帳務設定 → 「每日自動關帳」= ON |
| **Batch capture** | 信用卡收單 → 整批請款 (manual-capture mode) |

### Timing

- Close/capture files are sent to the bank daily at **PM 11:59**
- Settlement date is calculated from the capture date
- After refund succeeds, **do not** cancel the capture — that would cancel the refund

### DoAction Types

| Action | Name | Description |
|--------|------|-------------|
| `C` | Close (關帳/請款) | Capture an authorized transaction |
| `R` | Refund (退刷) | Refund a captured transaction |
| `E` | Cancel Auth (取消授權) | Cancel before capture (irreversible) |
| `N` | Void Capture (取消關帳) | Cancel a pending capture |

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

發票開立時可在請求中帶入 `merchantId` 覆蓋預設值，讓平台商可以指定子商戶開發票。

### 加密順序

TWQR 和電子發票的 AES 加密順序不同（詳見上方英文說明），程式透過 `invoiceMode` 和 `rawBase64` 自動處理。

TWQR Chargeback 比較特殊：文件寫要 URL encode，但 server 端 handler 不會先 URL decode，所以要用 `rawBase64`（純 Base64 不做 URL encode）。

### 信用卡關帳

信用卡交易流程：**授權 → 關帳 → 退款**。未關帳就操作退刷會失敗（`10000002 更新失敗`）。

關帳方式：
1. **API**: `DoAction` Action="C"（程式已支援）
2. **廠商後台**: 信用卡收單 → 交易明細 → 【關帳】
3. **自動關帳**: 廠商專區 → 信用卡帳務設定 → 「每日自動關帳」= 開

系統每日 PM 11:59 送關帳檔給銀行。撥款日從關帳日起算。
