import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://127.0.0.1:3002",
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
    url: "http://127.0.0.1:3002",
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
      AIRWALLEX_ENV: "demo",
      // Dummy values for screenshot-only tests (no live API calls).
      AIRWALLEX_CLIENT_ID: process.env.AIRWALLEX_CLIENT_ID ?? "dummy",
      AIRWALLEX_API_KEY: process.env.AIRWALLEX_API_KEY ?? "dummy",
      AIRWALLEX_WEBHOOK_SECRET: process.env.AIRWALLEX_WEBHOOK_SECRET ?? "dummy",
    },
  },
});
