import { test as setup } from '@playwright/test';
import { AUTH_FILE } from '@test-data/static/authPaths';

setup('authenticate as standard_user and persist session', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();
  await page.waitForURL('**/inventory.html');
  await page.context().storageState({ path: AUTH_FILE });
});
