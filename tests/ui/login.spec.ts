import { test, expect } from '@fixtures/customFixtures';
import users from '@test-data/static/users.json';

type SauceUser = {
  username: string;
  password: string;
  role: string;
  expectedTitle?: string;
  expectedError?: string;
};

const [standardUser, lockedUser, invalidUser] = users as SauceUser[];

test.describe('Saucedemo Login', () => {
  test('should login successfully with valid credentials @smoke @ui', async ({
    loginPage,
    inventoryPage,
  }) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    await test.step('Act', async () => {
      await loginPage.login(standardUser.username, standardUser.password);
    });

    await test.step('Assert', async () => {
      await inventoryPage.waitForURL('/inventory');
      await expect(inventoryPage.getCurrentUrl()).toContain('/inventory');
      await expect(await inventoryPage.getPageTitle()).toBe(standardUser.expectedTitle);
      await expect(await inventoryPage.isInventoryPageVisible()).toBe(true);
      await expect(await inventoryPage.getInventoryItemCount()).toBeGreaterThan(0);
    });
  });

  test('should show error for locked out user @regression @ui', async ({ loginPage }) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    await test.step('Act', async () => {
      await loginPage.login(lockedUser.username, lockedUser.password);
    });

    await test.step('Assert', async () => {
      const errorMessage = await loginPage.getErrorMessage();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
      await expect(errorMessage).toContain(lockedUser.expectedError ?? 'locked out');
      await expect(loginPage.getCurrentUrl()).not.toContain('/inventory');
    });
  });

  test('should show error for invalid credentials @regression @ui', async ({ loginPage }) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    await test.step('Act', async () => {
      await loginPage.login(invalidUser.username, invalidUser.password);
    });

    await test.step('Assert', async () => {
      const errorMessage = await loginPage.getErrorMessage();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
      await expect(errorMessage).toContain(invalidUser.expectedError ?? 'do not match');
    });
  });

  test('should show error when username is empty @regression @ui', async ({ loginPage }) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    await test.step('Act', async () => {
      await loginPage.login('', standardUser.password);
    });

    await test.step('Assert', async () => {
      const errorMessage = await loginPage.getErrorMessage();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
      await expect(errorMessage).toContain('Username is required');
    });
  });

  test('should show error when password is empty @regression @ui', async ({ loginPage }) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    await test.step('Act', async () => {
      await loginPage.login(standardUser.username, '');
    });

    await test.step('Assert', async () => {
      const errorMessage = await loginPage.getErrorMessage();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
      await expect(errorMessage).toContain('Password is required');
    });
  });

  test('should logout successfully after login @smoke @ui', async ({ loggedInPage, loginPage }) => {
    await test.step('Arrange', async () => {
      await expect(await loggedInPage.inventoryPage.isInventoryPageVisible()).toBe(true);
    });

    await test.step('Act', async () => {
      await loggedInPage.inventoryPage.logout();
    });

    await test.step('Assert', async () => {
      await loginPage.waitForURL('saucedemo.com');
      await expect(loginPage.getCurrentUrl()).toBe('https://www.saucedemo.com/');
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });
  });
});
