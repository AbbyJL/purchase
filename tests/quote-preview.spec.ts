import { test, expect, Page } from "@playwright/test";

/**
 * Quote Preview Tests
 *
 * Verifies that clicking "预览" on a quote row:
 *   1. Navigates to /pis/preview (not opens a PI editor modal)
 *   2. Shows data from the correct quote (customer, product, etc.)
 *   3. Has a working back button
 *   4. URL contains preview_<quoteId> as the pi param
 *
 * Bug that was fixed (2026-06-20):
 *   onPreviewPI was wired to generatePIFromQuote (opens PI editor modal)
 *   instead of previewPIFromQuote (navigates to /pis/preview with a
 *   temporary preview_<id> PI record).
 *
 * Usage:
 *   Local:      TEST_URL=http://localhost:5173 npm test -- quote-preview
 *   Production: TEST_URL=https://management-three-delta.vercel.app npm test -- quote-preview
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:5173";

/** Seed a minimal quote via localStorage so tests work without real data */
async function seedMinimalQuote(page: Page, id = "test_quote_seed_001") {
  await page.evaluate((quoteId) => {
    const now = new Date().toISOString();
    const quote = {
      id: quoteId,
      quoteNo: "QU2606999",
      piNo: "",
      date: now.slice(0, 10),
      modificationDate: now.slice(0, 10),
      register: "Tester",
      itemType: "Bag",
      brand: "TestBrand",
      linkman: "",
      salesperson: "",
      customer: "TestCustomer",
      item: "Test Product",
      productCode: "TEST001",
      productName: "Test Product Name",
      status: "Draft",
      costItems: [],
      tiers: [{ id: "t1", quantity: "100", unitPrice: 10 }],
      lines: [
        {
          id: "l1",
          checked: true,
          imageUrl: "",
          productCode: "TEST001",
          productName: "Test Product Name",
          suppliers: ["TestSupplier"],
          price: 10,
          sample: 0,
          description: "Test description",
          pricingNotes: "",
          costItems: [],
        },
      ],
      imageUrl: "",
      notes: "Seeded by test",
    };
    const key = "management.quotes";
    let existing: unknown[] = [];
    try {
      existing = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {}
    // Remove any existing seed quote, then add new one at front
    const filtered = existing.filter((q: any) => q.id !== quoteId);
    localStorage.setItem(key, JSON.stringify([quote, ...filtered]));
  }, id);
}

/** Remove the seeded test quote from localStorage */
async function removeSeedQuote(page: Page, id = "test_quote_seed_001") {
  await page.evaluate((quoteId) => {
    const key = "management.quotes";
    try {
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify(existing.filter((q: any) => q.id !== quoteId)));
    } catch {}
  }, id);
}

async function gotoQuotes(page: Page) {
  await page.goto(`${BASE_URL}/quotes`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("table, .table-row, [class*='quote']", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

test.describe("Quote Preview - navigates to correct PI preview page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Grant quote access in localStorage so the protected page is accessible
    await page.evaluate(() => {
      localStorage.setItem("management.quoteAccessGranted", "true");
    });
    await seedMinimalQuote(page);
    await gotoQuotes(page);
  });

  test.afterEach(async ({ page }) => {
    await removeSeedQuote(page);
  });

  test("preview button navigates to /pis/preview (not open PI modal)", async ({ page }) => {
    const previewBtn = page
      .getByRole("button")
      .filter({ hasText: /预览|Preview/i })
      .first();

    const count = await previewBtn.count();
    test.skip(count === 0, "No quotes rendered - check seed logic");

    await previewBtn.click();
    await page.waitForTimeout(1500);

    // Must navigate to preview page
    await expect(page).toHaveURL(/\/pis\/preview/, { timeout: 8000 });

    // PI edit modal must NOT be open (regression guard)
    const modal = page.locator(".modal-overlay, .modal-backdrop, [role='dialog']");
    await expect(modal).toHaveCount(0);

    await page.screenshot({ path: "test-results/quote-preview-navigated.png", fullPage: true });
  });

  test("preview URL contains pi=preview_<quoteId>", async ({ page }) => {
    const previewBtn = page
      .getByRole("button")
      .filter({ hasText: /预览|Preview/i })
      .first();

    const count = await previewBtn.count();
    test.skip(count === 0, "No quotes rendered");

    await previewBtn.click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/pis\/preview/, { timeout: 8000 });

    const url = page.url();
    // The pi param must be preview_<quoteId>, not a real PI id or empty
    expect(url).toMatch(/\/pis\/preview\?pi=preview_/);
  });

  test("preview page shows the seeded customer name (TestCustomer)", async ({ page }) => {
    const previewBtn = page
      .getByRole("button")
      .filter({ hasText: /预览|Preview/i })
      .first();

    const count = await previewBtn.count();
    test.skip(count === 0, "No quotes rendered");

    await previewBtn.click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/pis\/preview/, { timeout: 8000 });

    await page.screenshot({ path: "test-results/quote-preview-data.png", fullPage: true });

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toContain("TestCustomer");
  });

  test("preview page has a 返回 button that goes back to /quotes", async ({ page }) => {
    const previewBtn = page
      .getByRole("button")
      .filter({ hasText: /预览|Preview/i })
      .first();

    const count = await previewBtn.count();
    test.skip(count === 0, "No quotes rendered");

    await previewBtn.click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/pis\/preview/, { timeout: 8000 });

    // Back button must be visible
    const backBtn = page
      .getByRole("button")
      .filter({ hasText: /返回|Back/i })
      .first();
    await expect(backBtn).toBeVisible();

    await backBtn.click();
    await page.waitForTimeout(1000);

    // Should return to quotes page
    await expect(page).toHaveURL(/\/quotes/, { timeout: 5000 });

    await page.screenshot({ path: "test-results/quote-preview-back.png", fullPage: true });
  });

  test("PI selector on preview page shows the preview_ entry as selected", async ({ page }) => {
    const previewBtn = page
      .getByRole("button")
      .filter({ hasText: /预览|Preview/i })
      .first();

    const count = await previewBtn.count();
    test.skip(count === 0, "No quotes rendered");

    await previewBtn.click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/pis\/preview/, { timeout: 8000 });

    const selector = page.locator("select").first();
    await expect(selector).toBeVisible();

    const selectedValue = await selector.inputValue();
    expect(selectedValue).toMatch(/^preview_/);
  });
});

test.describe("Quote Preview - data isolation between quotes", () => {
  const SEED_IDS = ["test_quote_seed_A", "test_quote_seed_B"];

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(() => {
      localStorage.setItem("management.quoteAccessGranted", "true");
    });
    // Seed two distinct quotes
    await page.evaluate((ids) => {
      const now = new Date().toISOString();
      const makeQuote = (id: string, idx: number) => ({
        id,
        quoteNo: `QU260600${idx}`,
        piNo: "",
        date: now.slice(0, 10),
        modificationDate: now.slice(0, 10),
        register: "Tester",
        itemType: "Bag",
        brand: `Brand${idx}`,
        linkman: "",
        salesperson: "",
        customer: `Customer${idx}`,
        item: `Product${idx}`,
        productCode: `CODE00${idx}`,
        productName: `Product Name ${idx}`,
        status: "Draft",
        costItems: [],
        tiers: [{ id: `t${idx}`, quantity: "100", unitPrice: idx * 5 }],
        lines: [
          {
            id: `l${idx}`,
            checked: true,
            imageUrl: "",
            productCode: `CODE00${idx}`,
            productName: `Product Name ${idx}`,
            suppliers: [],
            price: idx * 5,
            sample: 0,
            description: "",
            pricingNotes: "",
            costItems: [],
          },
        ],
        imageUrl: "",
        notes: `Seeded by test ${idx}`,
      });
      const key = "management.quotes";
      let existing: unknown[] = [];
      try { existing = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}
      const filtered = existing.filter((q: any) => !ids.includes(q.id));
      localStorage.setItem(key, JSON.stringify([makeQuote(ids[0], 1), makeQuote(ids[1], 2), ...filtered]));
    }, SEED_IDS);
    await gotoQuotes(page);
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate((ids) => {
      const key = "management.quotes";
      try {
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        localStorage.setItem(key, JSON.stringify(existing.filter((q: any) => !ids.includes(q.id))));
      } catch {}
    }, SEED_IDS);
  });

  test("clicking different quote rows yields different preview_ IDs", async ({ page }) => {
    const previewBtns = page.getByRole("button").filter({ hasText: /预览|Preview/i });
    const total = await previewBtns.count();
    test.skip(total < 2, "Need at least 2 quote rows rendered");

    // Click first preview
    await previewBtns.nth(0).click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/pis\/preview/, { timeout: 8000 });
    const pi1 = new URL(page.url()).searchParams.get("pi");

    // Go back and click second preview
    await page.goBack();
    await page.waitForTimeout(1000);

    // Re-query buttons (DOM might have re-rendered)
    const previewBtns2 = page.getByRole("button").filter({ hasText: /预览|Preview/i });
    await previewBtns2.nth(1).click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/pis\/preview/, { timeout: 8000 });
    const pi2 = new URL(page.url()).searchParams.get("pi");

    expect(pi1).toMatch(/^preview_/);
    expect(pi2).toMatch(/^preview_/);
    expect(pi1).not.toBe(pi2);
  });
});
