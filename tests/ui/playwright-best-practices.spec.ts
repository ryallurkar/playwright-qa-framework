import { test, expect } from '@fixtures/customFixtures';

test.describe('Saucedemo Playwright Best Practices', () => {
  test('should login with resilient locators and web-first assertions @smoke @ui', async ({
    page,
    loginPage,
  }) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL('https://www.saucedemo.com/');
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });

    await test.step('Act', async () => {
      await page.getByPlaceholder('Username').fill('standard_user');
      await page.getByPlaceholder('Password').fill('secret_sauce');

      // Pair the click with navigation to avoid race conditions.
      await Promise.all([
        page.waitForURL('**/inventory.html'),
        page.getByRole('button', { name: 'Login' }).click(),
      ]);
    });

    await test.step('Assert', async () => {
      await expect(page).toHaveURL(/inventory/);
      await expect(page.getByText('Products')).toBeVisible();
      await expect(page.locator('.inventory_item')).toHaveCount(6);
    });
  });

  test('should validate product sorting with stable assertions @regression @ui', async ({
    page,
    authenticatedPage,
  }) => {
    await test.step('Arrange', async () => {
      await authenticatedPage.waitForURL('/inventory');
      await expect(page.getByText('Products')).toBeVisible();
      await expect(page.locator('[data-test="product-sort-container"]')).toBeVisible();
    });

    await test.step('Act', async () => {
      await page.locator('[data-test="product-sort-container"]').selectOption('za');
    });

    await test.step('Assert', async () => {
      const productNames = await page.locator('.inventory_item_name').allTextContents();
      const expectedNames = [...productNames].sort((a, b) => b.localeCompare(a));

      expect(productNames).toEqual(expectedNames);
      await expect(page).toHaveURL(/inventory/);
    });
  });

  test('should show deterministic error for locked user @regression @ui', async ({ page, loginPage }) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });

    await test.step('Act', async () => {
      await page.getByPlaceholder('Username').fill('locked_out_user');
      await page.getByPlaceholder('Password').fill('secret_sauce');
      await page.getByRole('button', { name: 'Login' }).click();
    });

    await test.step('Assert', async () => {
      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]')).toContainText('locked out');
      await expect(page).toHaveURL('https://www.saucedemo.com/');
    });
  });

  test('should add an item to cart and update badge @smoke @ui', async ({ page, authenticatedPage }) => {
    await test.step('Arrange', async () => {
      await authenticatedPage.waitForURL('/inventory');
      await expect(page.getByText('Products')).toBeVisible();
    });

    await test.step('Act', async () => {
      await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    });

    await test.step('Assert', async () => {
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
      await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
    });
  });

  test('should remove an added item and clear cart badge @regression @ui', async ({
    page,
    authenticatedPage,
  }) => {
    await test.step('Arrange', async () => {
      await authenticatedPage.waitForURL('/inventory');
      await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });

    await test.step('Act', async () => {
      await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    });

    await test.step('Assert', async () => {
      await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
      await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
    });
  });
});
