# OPay Local Verify / 本機驗證

## Prerequisites — 前置需求

1. **Node.js 20+** and **pnpm**
2. **ngrok** (or cloudflared) for callback URL
3. OPay stage credentials (pre-filled in `.env.example`)

## Step-by-step — 操作步驟

### 1. Start the app

```bash
cd opay-payment
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed       # seeds test merchants
pnpm dev            # http://localhost:3001
```

### 2. Start ngrok (separate terminal)

```bash
ngrok http 3001
```

Copy the HTTPS URL and update `.env`:
```
NEXT_PUBLIC_APP_URL="https://your-ngrok-url.ngrok-free.app"
```

Restart `pnpm dev` after updating `.env`.

### 3. AIO Credit Card Checkout — 信用卡付款

1. Open http://localhost:3001
2. Click **信用卡付款 (AIO)**
3. Fill in amount and click **前往付款**
4. You'll be redirected to OPay stage payment page
5. Enter test card: `4311952222222222`, any expiry/CVV/name
6. After payment, OPay redirects back to success page
7. Check DB: `pnpm db:studio` → Orders table

### 4. TWQR QR Code Payment — 動態碼

1. Click **TWQR 動態碼**
2. Enter amount and click **產生 QR Code**
3. QR code displays with a countdown
4. In stage environment, use OPay's simulated payment to trigger callback
5. The page polls every 5 seconds and shows payment status

### 5. E-Invoice — 電子發票

1. Click **電子發票** → **開立發票**
2. Fill in item details and amount
3. Optional: enter **Store ID** (門市代號) and/or **Merchant ID** (子商戶，B2B2C 平台用)
4. **Carrier types** (載具):
   - 無 (None) — default
   - 手機條碼 (Mobile Barcode) — format: `/ABC+123`
   - 自然人憑證 (Citizen Digital Certificate) — 16-char code
   - OPay 會員載具
5. For B2B: check "B2B 三聯式" and enter 統一編號 (8 digits)
   - Automatically enforces: Print=1, Donation=0, CarrierType=empty
6. Click **開立發票**
7. Invoice number (e.g. `KA10002291`) is returned on success
8. Email notification sent to the customer email address

### 5a. Invoice Query API — 發票查詢

```bash
# List all invoices
curl http://localhost:3001/api/query/invoices

# Filter by storeId
curl http://localhost:3001/api/query/invoices?storeId=STORE001

# Filter by invoiceNo
curl http://localhost:3001/api/query/invoices?invoiceNo=KA10002291

# Filter by status
curl http://localhost:3001/api/query/invoices?status=issued
```

### 6. Refund — 退款

#### 6a. Credit Card Refund (信用卡退款)

Credit card refund requires **close/capture (關帳)** first:

1. After a credit card payment is authorized, capture it:
   - **Via API**: call `DoAction` with `Action="C"` (the UI can be extended to support this)
   - **Via backend**: log in to [vendor-stage.opay.tw](https://vendor-stage.opay.tw) → 信用卡收單 → click 【關帳】
   - **Auto-capture**: enable "每日自動關帳" in 信用卡帳務設定
2. Wait for capture to complete (system sends capture files to bank at PM 11:59)
3. Once captured (已關帳), click **退款** → select the credit card order → **執行退款**
4. Credit card refund uses `DoAction` with `Action="R"`

> Without closing first, refund returns `10000002 更新失敗`.

#### 6b. TWQR Chargeback (TWQR 退款)

1. Click **退款**
2. Select a TWQR paid order from the dropdown
3. Enter refund amount and click **執行退款**
4. TWQR refund uses `POST /TWQRCashier/Chargeback`
5. On success: `rtnCode=1, rtnMsg=退款成功`, TradeStatus changes to 2 (全額退款)

> TWQR Chargeback uses `rawBase64` (no URL encode on encrypted Data) due to a server-side handler inconsistency.

### 7. Query Trade — 訂單查詢

```bash
# Via CLI
pnpm opay:query

# Via web
# Navigate to /orders page
```

## Troubleshooting — 問題排解

| Problem | Solution |
|---------|----------|
| CheckMacValue Error | Verify HashKey/HashIV in `.env`. Different API systems use different keys. |
| Callback not received | Ensure ngrok is running and `NEXT_PUBLIC_APP_URL` matches the ngrok URL. |
| Invoice Issue fails | Check that the invoice credentials (`OPAY_INVOICE_HASH_KEY/IV`) are correct. |
| Invoice 解密失敗 | E-Invoice uses a different AES encryption order than TWQR. Ensure `invoiceMode: true` is passed. |
| TWQR timeout | QR codes expire in 10 minutes (default). Try a new one. |
| `TransCode != 1` | E-Invoice transport layer error. Check Timestamp is within 10 minutes of server time. |
| Carrier 格式錯誤 | Mobile barcode must start with `/` (e.g. `/ABC+123`). Citizen cert is 16 chars. |
| Credit refund `10000002 更新失敗` | Must close/capture (關帳) the transaction first. Use `DoAction Action="C"` or enable auto-capture in vendor backend. |
| TWQR Chargeback `10100051 JSON Parameter Error` | Chargeback handler doesn't URL-decode Data. Use `rawBase64: true` in `aesEncrypt` (no URL encode). |
