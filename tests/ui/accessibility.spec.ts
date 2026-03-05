import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@fixtures/customFixtures';

test.describe('Saucedemo Login Accessibility', () => {
  test('should have no critical accessibility violations on the login page @ui', async ({
    loginPage,
    page,
  }) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    await test.step('Assert', async () => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
