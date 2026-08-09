import { expect, test } from "@playwright/test";

test.describe("docs/screenshots", () => {
  test("01-home — landing with flow cards", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Airwallex/i }),
    ).toBeVisible();
    await page.screenshot({
      path: "../docs/screenshots/airwallex/01-home.png",
      fullPage: true,
    });
  });

  test("02-checkout — payment form", async ({ page }) => {
    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: /Credit Card/i }),
    ).toBeVisible();
    await page.screenshot({
      path: "../docs/screenshots/airwallex/02-checkout.png",
      fullPage: true,
    });
  });
});
