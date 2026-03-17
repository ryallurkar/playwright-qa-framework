import { Page, test as base, expect } from '@playwright/test';
import { InventoryPage } from '@pages/InventoryPage';
import { LoginPage } from '@pages/LoginPage';
import { AUTH_FILE } from '@test-data/static/authPaths';

type FrameworkFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  authenticatedPage: InventoryPage;
  loggedInPage: { page: Page; inventoryPage: InventoryPage };
  // Restores session from storageState — no login round-trip per test.
  preAuthPage: InventoryPage;
};

export const test = base.extend<FrameworkFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  authenticatedPage: async ({ page, loginPage }, use) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    const isVisible = await inventoryPage.isInventoryPageVisible();
    if (!isVisible) {
      throw new Error('Authenticated fixture failed to reach the Saucedemo inventory page.');
    }

    await use(inventoryPage);
  },

  loggedInPage: async ({ page, loginPage }, use) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.waitForURL('/inventory');

    if (!(await inventoryPage.isInventoryPageVisible())) {
      throw new Error('loggedInPage fixture failed to load the Saucedemo inventory page.');
    }

    await use({ page, inventoryPage });
  },

  preAuthPage: async ({ browser }, use) => {
    const baseURL = process.env.BASE_URL || 'https://www.saucedemo.com';
    const context = await browser.newContext({ storageState: AUTH_FILE, baseURL });
    const page = await context.newPage();
    await page.goto('/inventory.html');
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
    await context.close();
  },
});

export { expect };
