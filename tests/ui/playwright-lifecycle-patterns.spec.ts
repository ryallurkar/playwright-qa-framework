import type { BrowserContext, Page } from '@playwright/test';
import { test, expect } from '@fixtures/customFixtures';
import users from '@test-data/static/users.json';

type SauceUser = {
  username: string;
  password: string;
  expectedError?: string;
  expectedTitle?: string;
};

const [standardUser, lockedUser, invalidUser] = users as SauceUser[];

test.describe('Saucedemo Playwright Lifecycle Patterns', () => {
  let healthcheckContext: BrowserContext;
  let healthcheckPage: Page;
  let loginPageTitle = '';
  let lastVisitedUrl = '';
  let inventoryCountSeenInSetup = 0;

  // `test.beforeAll` runs once for this describe block.
  // Use it for expensive setup that every test can share, such as health checks or seed data.
  // Common mistake: putting per-test state here and then leaking it across tests.
  test.beforeAll(async ({ browser }) => {
    healthcheckContext = await browser.newContext();
    healthcheckPage = await healthcheckContext.newPage();

    await healthcheckPage.goto('https://www.saucedemo.com', { waitUntil: 'domcontentloaded' });
    loginPageTitle = await healthcheckPage.title();
  });

  // `test.afterAll` runs once after every test in this describe completes.
  // Use it to close shared resources created in `beforeAll`.
  // Common mistake: forgetting teardown and leaving contexts, files, or DB connections open.
  test.afterAll(async () => {
    await healthcheckContext?.close();
  });

  // `test.beforeEach` runs before every individual test.
  // Use it for repeatable per-test setup such as navigation to a clean starting page.
  // Common mistake: performing too much logic here and hiding what the test really depends on.
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await expect(await loginPage.isLoginPageVisible()).toBe(true);
  });

  // `test.afterEach` runs after every individual test.
  // Use it for cleanup that keeps the next test isolated, such as clearing storage or cookies.
  // Common mistake: asserting too much here and making failures harder to diagnose.
  test.afterEach(async ({ page }) => {
    lastVisitedUrl = page.url();
    await page.context().clearCookies();
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test.describe('Authentication Patterns', () => {
    // Nested `test.describe` blocks help organize related scenarios under a parent feature.
    // Use nested groups when a feature has its own setup or semantics.
    // Common mistake: nesting too deeply and making the suite hard to scan.

    // `test.skip` conditionally skips a test when the scenario is not valid for the current environment.
    // Use it for known platform gaps or unsupported browsers, not for hiding real regressions.
    // Common mistake: leaving broad skips in place after the underlying issue is fixed.
    test('shows how to conditionally skip a browser-specific check @ui', async ({ browserName, page }) => {
      test.skip(browserName === 'firefox', 'Example skip: this demo assertion is only shown outside Firefox.');

      await expect(page).toHaveURL('https://www.saucedemo.com/');
      await expect(page.locator('.login_logo')).toHaveText('Swag Labs');
    });

    // `test.only` isolates a single test during debugging so you can focus on one failure at a time.
    // Use it temporarily while investigating a problem, then remove it before committing.
    // Common mistake: accidentally committing an active `test.only` and blocking the rest of the suite.
    const isolatedTest = process.env.PWDEBUG === '1' ? test.only : test;

    isolatedTest('shows how to isolate one test with test.only during debugging @ui', async ({
      page,
      loginPage,
      inventoryPage,
    }) => {
      await loginPage.login(standardUser.username, standardUser.password);
      await inventoryPage.waitForURL('/inventory');

      await expect(page.locator('.title')).toHaveText(standardUser.expectedTitle ?? 'Products');
    });

    test('uses test.step to document an invalid login flow @regression @ui', async ({ page, loginPage }) => {
      await test.step('Assert the shared beforeAll setup completed', async () => {
        await expect(loginPageTitle).toContain('Swag Labs');
      });

      await test.step('Submit invalid credentials', async () => {
        await loginPage.login(invalidUser.username, invalidUser.password);
      });

      await test.step('Validate the visible error state', async () => {
        await expect(page.locator('[data-test="error"]')).toContainText(
          invalidUser.expectedError ?? 'Username and password do not match',
        );
        await expect(page).toHaveURL('https://www.saucedemo.com/');
      });
    });

    // `test.fail` marks a test as expected to fail while a known bug is still open.
    // Use it when you want the suite to keep tracking a bug without turning the whole run red.
    // Common mistake: leaving `test.fail` in place after the bug is fixed, which flips the test into failure.
    test('tracks a known-bad error-message expectation with test.fail @regression @ui', async ({
      page,
      loginPage,
    }) => {
      test.fail(true, 'Demo: this intentionally expects the wrong locked user message.');

      await loginPage.login(lockedUser.username, lockedUser.password);
      await expect(page.locator('[data-test="error"]')).toContainText('Service temporarily unavailable');
    });
  });

  test.describe('Inventory Patterns', () => {
    // A nested `beforeEach` lets a subgroup add extra setup on top of the parent `beforeEach`.
    // Use it when one feature area needs additional setup, such as logging in before inventory tests.
    // Common mistake: duplicating the same setup in every test instead of lifting it into a shared hook.
    test.beforeEach(async ({ loginPage, inventoryPage }) => {
      await loginPage.login(standardUser.username, standardUser.password);
      await inventoryPage.waitForURL('/inventory');
      inventoryCountSeenInSetup = await inventoryPage.getInventoryItemCount();
    });

    test('uses shared describe state set by hooks @smoke @ui', async ({ page, inventoryPage }) => {
      await test.step('Confirm the post-login page is ready', async () => {
        await expect(await inventoryPage.isInventoryPageVisible()).toBe(true);
        await expect(page.locator('.title')).toHaveText(standardUser.expectedTitle ?? 'Products');
      });

      await test.step('Assert data captured by setup hooks is available', async () => {
        await expect(inventoryCountSeenInSetup).toBeGreaterThan(0);
        await expect(lastVisitedUrl === '' || lastVisitedUrl.includes('saucedemo.com')).toBe(true);
      });
    });

    // `test.fixme` documents a scenario that is known broken or not ready to execute yet.
    // Use it when the test should exist for visibility, but running it right now would be noise.
    // Common mistake: using `fixme` as a permanent replacement for implementing the test properly.
    test.fixme('demonstrates test.fixme deferring a cart badge assertion until the feature is stable @ui', async ({ page }) => {
      await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });
  });
});
