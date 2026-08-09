import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm exec prisma migrate deploy && pnpm dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "sk_test_playwright_local_only",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_playwright_local_only",
      STRIPE_PRICE_SUBSCRIPTION_MONTHLY:
        process.env.STRIPE_PRICE_SUBSCRIPTION_MONTHLY ?? "price_test_playwright_placeholder",
    },
  },
});
