import { test, expect } from '@fixtures/customFixtures';

// expect.soft() collects assertion failures instead of stopping at the first one.
// The test body continues to run after a soft failure; all violations are reported
// together when the test ends. This gives full visibility in a single run —
// you see every broken item, not just the first one.
//
// Contrast with hard assertions (expect): a single failure throws immediately
// and the rest of the test is skipped.

test.describe('Playwright Soft Assertions', () => {
  test(
    'validates all inventory products in a single pass @regression @ui',
    async ({ preAuthPage: inventoryPage }) => {
      await test.step('Arrange', async () => {
        // preAuthPage restores session from storageState — no login round-trip.
        await expect(await inventoryPage.isInventoryPageVisible()).toBe(true);
      });

      await test.step('Assert: product names and prices are well-formed', async () => {
        const names = await inventoryPage.getInventoryItemNames();
        const prices = await inventoryPage.getInventoryItemPrices();

        // Hard assertions first — we need items present before soft-checking each one.
        expect(names.length, 'inventory should have at least one item').toBeGreaterThan(0);
        expect(names.length, 'name and price counts must match').toBe(prices.length);

        // Soft assertions collect every failure before the test ends.
        // If three prices were malformed, all three appear in the report.
        expect.soft(names.length, 'SauceDemo inventory should show exactly 6 products').toBe(6);

        for (const [i, name] of names.entries()) {
          expect
            .soft(name.trim(), `product ${i + 1} should have a non-empty name`)
            .not.toBe('');
        }

        for (const [i, price] of prices.entries()) {
          expect
            .soft(price, `product ${i + 1} price "${price}" should match $X.XX format`)
            .toMatch(/^\$\d+\.\d{2}$/);
        }
      });
    },
  );

  // test.fail marks this test as expected to fail.
  // It demonstrates that ALL soft assertion failures are collected and reported
  // together — execution is not halted at the first failure.
  test.fail(
    'demonstrates all soft failures are collected before the test ends @regression @ui',
    async ({ preAuthPage: inventoryPage }) => {
      const count = await inventoryPage.getInventoryItemCount();

      // Both of these will fail — but both run before the test ends.
      expect.soft(count, 'intentionally wrong: expected 100').toBe(100);
      expect.soft(count, 'intentionally wrong: expected 200').toBe(200);

      // Execution reaches here despite the soft failures above.
      // The correct assertion also runs and contributes to the report.
      expect.soft(count, 'item count is actually 6').toBe(6);
    },
  );
});
