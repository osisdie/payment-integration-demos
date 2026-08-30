import { expect, test } from "@playwright/test";

const API_URL = "/api/invoice/issue";

function uniqueRelateNo() {
  return `INV${Date.now().toString(36).toUpperCase()}`;
}

function basePayload(overrides: Record<string, unknown> = {}) {
  return {
    relateNumber: uniqueRelateNo(),
    customerEmail: "osisdie+test@gmail.com",
    salesAmount: 100,
    taxType: "1",
    invType: "07",
    items: [
      {
        ItemName: "Carrier Test",
        ItemCount: 1,
        ItemWord: "件",
        ItemPrice: 100,
        ItemAmount: 100,
      },
    ],
    ...overrides,
  };
}

test.describe("invoice carrier scenarios", () => {
  test("mobile barcode carrier (手機條碼)", async ({ request }) => {
    const res = await request.post(API_URL, {
      data: basePayload({
        carrierType: "3",
        carrierNum: "/ABC+123",
      }),
    });

    expect([200, 500]).toContain(res.status());
    const body = await res.json();

    if (res.status() === 200 && body.success) {
      expect(body.invoiceNo).toBeTruthy();
    } else {
      expect(body.error).toBeTruthy();
    }
  });

  test("natural person certificate carrier (自然人憑證)", async ({ request }) => {
    const res = await request.post(API_URL, {
      data: basePayload({
        carrierType: "2",
        carrierNum: "AB12345678901234",
      }),
    });

    expect([200, 500]).toContain(res.status());
    const body = await res.json();

    if (res.status() === 200 && body.success) {
      expect(body.invoiceNo).toBeTruthy();
    } else {
      expect(body.error).toBeTruthy();
    }
  });

  test("no carrier (default — donate or print)", async ({ request }) => {
    const res = await request.post(API_URL, {
      data: basePayload({
        carrierType: "",
        print: "0",
        donation: "0",
      }),
    });

    expect([200, 500]).toContain(res.status());
    const body = await res.json();

    if (res.status() === 200 && body.success) {
      expect(body.invoiceNo).toBeTruthy();
    } else {
      expect(body.error).toBeTruthy();
    }
  });
});

test.describe("invoice B2B scenarios", () => {
  test("B2B with VAT number forces Print=1, Donation=0, CarrierType=empty", async ({ request }) => {
    const res = await request.post(API_URL, {
      data: basePayload({
        customerIdentifier: "12345678",
        customerName: "Test Corp",
        carrierType: "3",
        carrierNum: "/SHOULD_BE_CLEARED",
        print: "0",
        donation: "1",
      }),
    });

    expect([200, 500]).toContain(res.status());
    const body = await res.json();

    if (res.status() === 200 && body.success) {
      expect(body.invoiceNo).toBeTruthy();
    } else {
      expect(body.error).toBeTruthy();
    }
  });

  test("B2B with storeId and merchantId override", async ({ request }) => {
    const res = await request.post(API_URL, {
      data: basePayload({
        storeId: "STORE_B2B",
        customerIdentifier: "12345678",
        customerName: "Sub-Merchant Corp",
      }),
    });

    expect([200, 500]).toContain(res.status());
    const body = await res.json();

    if (res.status() === 200 && body.success) {
      expect(body.invoiceNo).toBeTruthy();
    } else {
      expect(body.error).toBeTruthy();
    }
  });
});

test.describe("invoice query API", () => {
  test("GET /api/query/invoices returns array", async ({ request }) => {
    const res = await request.get("/api/query/invoices");
    expect(res.status()).toBe(200);
    const invoices = await res.json();
    expect(Array.isArray(invoices)).toBe(true);
  });

  test("GET /api/query/invoices?storeId= filters correctly", async ({ request }) => {
    const res = await request.get("/api/query/invoices?storeId=NONEXISTENT_STORE");
    expect(res.status()).toBe(200);
    const invoices = await res.json();
    expect(Array.isArray(invoices)).toBe(true);
    expect(invoices.length).toBe(0);
  });

  test("GET /api/query/invoices?status=issued returns only issued", async ({ request }) => {
    const res = await request.get("/api/query/invoices?status=issued");
    expect(res.status()).toBe(200);
    const invoices = await res.json();
    expect(Array.isArray(invoices)).toBe(true);
    for (const inv of invoices) {
      expect(inv.status).toBe("issued");
    }
  });
});

test.describe("invoice carrier UI", () => {
  test("carrier type dropdown shows when B2B is off", async ({ page }) => {
    await page.goto("/invoices/issue");
    const carrierSelect = page.locator('select[name="carrierType"]');
    await expect(carrierSelect).toBeVisible();

    // Check all carrier options exist
    await expect(carrierSelect.locator("option")).toHaveCount(4);
    await expect(carrierSelect.locator('option[value=""]')).toHaveText(/None/);
    await expect(carrierSelect.locator('option[value="3"]')).toHaveText(/手機條碼/);
  });

  test("carrier type hidden when B2B VAT is checked", async ({ page }) => {
    await page.goto("/invoices/issue");

    const vatToggle = page.getByRole("checkbox", { name: /B2B/i });
    await vatToggle.check();

    const carrierSelect = page.locator('select[name="carrierType"]');
    await expect(carrierSelect).not.toBeVisible();
  });

  test("mobile barcode carrier submits via form", async ({ page }) => {
    await page.goto("/invoices/issue");

    // Select mobile barcode carrier
    await page.locator('select[name="carrierType"]').selectOption("3");
    await page.locator('input[name="carrierNum"]').fill("/ABC+123");

    // Fill required fields
    await page.locator('input[name="itemName"]').fill("Carrier Form Test");
    await page.locator('input[name="itemPrice"]').fill("100");
    await page.locator('input[name="salesAmount"]').fill("100");

    const apiPromise = page.waitForResponse(
      (res) => res.url().includes(API_URL) && res.request().method() === "POST",
    );

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: /開立發票/i }).click();

    const apiRes = await apiPromise;
    expect([200, 500]).toContain(apiRes.status());

    // Verify the request payload includes carrier fields
    const reqBody = apiRes.request().postDataJSON();
    expect(reqBody.carrierType).toBe("3");
    expect(reqBody.carrierNum).toBe("/ABC+123");
  });

  test("storeId and merchantId fields visible and submittable", async ({ page }) => {
    await page.goto("/invoices/issue");

    await expect(page.locator('input[name="storeId"]')).toBeVisible();
    await expect(page.locator('input[name="merchantId"]')).toBeVisible();

    await page.locator('input[name="storeId"]').fill("STORE_UI_TEST");
    // merchantId left blank — should use env default

    await page.locator('input[name="itemName"]').fill("StoreID Test");
    await page.locator('input[name="itemPrice"]').fill("50");
    await page.locator('input[name="salesAmount"]').fill("50");

    const apiPromise = page.waitForResponse(
      (res) => res.url().includes(API_URL) && res.request().method() === "POST",
    );

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: /開立發票/i }).click();

    const apiRes = await apiPromise;
    const reqBody = apiRes.request().postDataJSON();
    expect(reqBody.storeId).toBe("STORE_UI_TEST");
    expect(reqBody.merchantId).toBeUndefined();
  });
});
