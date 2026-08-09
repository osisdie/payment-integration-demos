import { expect, test } from "@playwright/test";

test.describe("docs/screenshots", () => {
  test("01-home — landing with all flow cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /OPay 歐付寶/i })).toBeVisible();
    await page.screenshot({ path: "../docs/screenshots/opay-01-home.png", fullPage: true });
  });

  test("02-checkout — AIO checkout form", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: /AIO Checkout/i })).toBeVisible();
    await page.screenshot({ path: "../docs/screenshots/opay-02-checkout.png", fullPage: true });
  });

  test("03-twqr — TWQR payment page", async ({ page }) => {
    await page.goto("/twqr");
    await expect(page.getByRole("heading", { name: /TWQR/i })).toBeVisible();
    await page.screenshot({ path: "../docs/screenshots/opay-03-twqr.png", fullPage: true });
  });

  test("04-invoices — invoice issue form", async ({ page }) => {
    await page.goto("/invoices/issue");
    await expect(page.getByRole("heading", { name: /Issue Invoice/i })).toBeVisible();
    await page.screenshot({ path: "../docs/screenshots/opay-04-invoice-issue.png", fullPage: true });
  });
});
