import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@fixtures/customFixtures';

test.describe('Saucedemo Login Accessibility', () => {
  test('logs accessibility violations on the login page @ui', async ({
    loginPage,
    page,
  }) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    await test.step('Assert', async () => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Accessibility violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2),
        );
      }
    });
  });
});
