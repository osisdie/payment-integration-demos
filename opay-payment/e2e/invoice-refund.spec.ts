import { expect, test } from "@playwright/test";

test.describe("invoice", () => {
  test("issue form renders and submits to OPay API", async ({ page }) => {
    await page.goto("/invoices/issue");
    await expect(page.getByRole("heading", { name: /Issue Invoice/i })).toBeVisible();

    await page.locator('input[name="itemName"]').fill("Playwright 測試商品");
    await page.locator('input[name="itemPrice"]').fill("100");
    await page.locator('input[name="salesAmount"]').fill("100");

    // Listen for the API call
    const apiPromise = page.waitForResponse(
      (res) => res.url().includes("/api/invoice/issue") && res.request().method() === "POST",
    );

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: /開立發票/i }).click();

    const apiRes = await apiPromise;
    const body = await apiRes.json();

    // 200 = success or 500 = OPay stage API error — both are valid outcomes
    expect([200, 500]).toContain(apiRes.status());

    if (apiRes.status() === 200 && body.success) {
      expect(body.invoiceNo).toBeTruthy();
      expect(body.invoiceDate).toBeTruthy();
    } else {
      expect(body.error).toBeTruthy();
    }
  });

  test("B2B toggle enforces VAT rules", async ({ page }) => {
    await page.goto("/invoices/issue");

    const vatToggle = page.getByRole("checkbox", { name: /B2B/i });
    await vatToggle.check();

    // VAT number field should appear (placeholder "12345678")
    await expect(page.getByPlaceholder("12345678")).toBeVisible();

    await vatToggle.uncheck();
    // Carrier type dropdown should appear when B2B is off
    await expect(page.getByText(/載具類型 Carrier Type/)).toBeVisible();
  });
});

test.describe("refund", () => {
  test("refund page renders with dual input", async ({ page }) => {
    await page.goto("/refund");
    await expect(page.getByRole("heading", { name: /退款/i })).toBeVisible();

    // Manual trade number input
    await expect(page.getByPlaceholder(/20260823/)).toBeVisible();
    await expect(page.getByRole("button", { name: /查詢/ })).toBeVisible();

    // Dropdown
    await expect(page.getByText(/下拉選擇/)).toBeVisible();
  });

  test("manual search finds order or shows not-found", async ({ page }) => {
    await page.goto("/refund");

    // Search for a non-existent order
    await page.getByPlaceholder(/20260823/).fill("NONEXISTENT_ORDER");

    const searchPromise = page.waitForResponse(
      (res) => res.url().includes("/api/query/orders?search="),
    );
    await page.getByRole("button", { name: /查詢/ }).click();
    await searchPromise;

    // Should show "not found" or order detail
    const notFound = page.getByText(/找不到此訂單/);
    const orderDetail = page.getByText(/Trade No:/);
    await expect(notFound.or(orderDetail)).toBeVisible();
  });

  test("dropdown loads paid orders from API", async ({ page }) => {
    const ordersPromise = page.waitForResponse(
      (res) => res.url().includes("/api/query/orders") && !res.url().includes("search="),
    );
    await page.goto("/refund");
    const ordersRes = await ordersPromise;
    const orders = await ordersRes.json();

    expect(Array.isArray(orders)).toBe(true);
    // All orders in dropdown should be paid
    for (const o of orders) {
      expect(o.paymentStatus).toBe("paid");
    }
  });
});
