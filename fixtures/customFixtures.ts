import { APIRequestContext, Page, request, test as base, expect } from '@playwright/test';
import { InventoryPage } from '@pages/InventoryPage';
import { LoginPage } from '@pages/LoginPage';

type FrameworkFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  authenticatedPage: InventoryPage;
  loggedInPage: { page: Page; inventoryPage: InventoryPage };
  apiContext: APIRequestContext;
};

const getRequiredEnv = (name: 'API_BASE_URL' | 'TEST_USER_EMAIL' | 'TEST_USER_PASSWORD'): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} is required for this test run.`);
  }

  return value;
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

  // Playwright fixture callbacks require object destructuring for the first parameter.
  // eslint-disable-next-line no-empty-pattern
  apiContext: async ({}, use) => {
    const baseURL = getRequiredEnv('API_BASE_URL');
    const authToken = process.env.API_AUTH_TOKEN;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const context = await request.newContext({
      baseURL,
      extraHTTPHeaders: headers,
    });

    await use(context);
    await context.dispose();
  },
});

export { expect };
