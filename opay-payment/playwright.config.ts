import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm exec prisma migrate deploy && pnpm dev",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
      OPAY_ENV: "stage",
      OPAY_MERCHANT_ID: process.env.OPAY_MERCHANT_ID ?? "2000132",
      OPAY_HASH_KEY: process.env.OPAY_HASH_KEY ?? "5294y06JbISpM5x9",
      OPAY_HASH_IV: process.env.OPAY_HASH_IV ?? "v77hoKGq4kWxNNIS",
    },
  },
});
