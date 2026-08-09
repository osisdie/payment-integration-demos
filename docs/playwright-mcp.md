# Screenshots (Playwright test runner)

## Automated: `@playwright/test`（可提交到 Git）

靜態頁截圖由 `@playwright/test` 產出，路徑在 `docs/screenshots/`（可提交）：

```bash
cd stripe-checkout
pnpm install
pnpm exec playwright install chromium
pnpm screenshots
```

[`stripe-checkout/e2e/screenshots.spec.ts`](../stripe-checkout/e2e/screenshots.spec.ts) → `01-home.png`、`03-success.png`。

| File | Source / 來源 |
|------|---------------|
| `01-home.png` | `pnpm screenshots` |
| `02-stripe-checkout.png` | Manual screenshot |
| `03-success.png` | `pnpm screenshots` |
| `04-prisma-studio.png` | Manual：`pnpm db:studio` |
| `05-stripe-cli.png` | Manual：`stripe listen …` |
