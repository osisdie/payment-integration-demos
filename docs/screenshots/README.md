# Screenshots

Each app's screenshots are organized in subfolders:

```
docs/screenshots/
├── stripe/         ← Stripe Checkout demos
├── opay/           ← OPay 歐付寶 demos
├── airwallex/      ← Airwallex demos
└── README.md
```

## How to generate

```bash
# Per app (headed mode — opens browser window)
cd stripe-checkout  && npx playwright test --headed
cd opay-payment     && npx playwright test --headed
cd airwallex-payment && npx playwright test --headed
```

## Stripe

| File | Page |
|------|------|
| `stripe/01-home.png` | Landing page with Checkout cards |
| `stripe/03-success.png` | Success page shell |

## OPay 歐付寶

| File | Page |
|------|------|
| `opay/01-home.png` | Landing — 5 flow cards (AIO, TWQR, Orders, Invoice, Refund) |
| `opay/02-checkout.png` | AIO credit card checkout form |
| `opay/03-twqr.png` | TWQR dynamic QR code payment |
| `opay/04-invoice-issue.png` | E-Invoice issue form |
| `opay/05-orders.png` | Order list page |
| `opay/06-refund.png` | Refund page |

## Airwallex

| File | Page |
|------|------|
| `airwallex/01-home.png` | Landing — 3 flow cards (Payment, Orders, Refund) |
| `airwallex/02-checkout.png` | Credit card payment form |
