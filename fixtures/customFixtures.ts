import { Page, test as base, expect } from '@playwright/test';
import { InventoryPage } from '@pages/InventoryPage';
import { LoginPage } from '@pages/LoginPage';

type FrameworkFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  authenticatedPage: InventoryPage;
  loggedInPage: { page: Page; inventoryPage: InventoryPage };
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
});

export { expect };
