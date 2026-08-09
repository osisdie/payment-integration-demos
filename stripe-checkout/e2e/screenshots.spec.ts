import { expect, test } from "@playwright/test";

test.describe("docs/screenshots", () => {
  test("01-home — landing with both Checkout cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Stripe · Next\.js · Prisma · SQLite/i })).toBeVisible();
    await page.screenshot({ path: "../docs/screenshots/stripe/01-home.png", fullPage: true });
  });

  test("03-success — shell before session_id (after pay, replace via MCP or manual)", async ({ page }) => {
    await page.goto("/success");
    await expect(page.getByRole("heading", { name: /Checkout complete/i })).toBeVisible();
    await page.screenshot({ path: "../docs/screenshots/stripe/03-success.png", fullPage: true });
  });
});
