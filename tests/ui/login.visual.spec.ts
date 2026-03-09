import { test, expect } from '@fixtures/customFixtures';

test.describe('Saucedemo Login Visual Regression', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'WebKit is unavailable on this host.');

  test('should capture the baseline login page @ui @visual', async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(await loginPage.isLoginPageVisible()).toBe(true);

    await expect(page).toHaveScreenshot('saucedemo-login-page.png', {
      fullPage: true,
    });
  });

  test('should demonstrate a login page visual regression @ui @visual', async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(await loginPage.isLoginPageVisible()).toBe(true);

    // Simulate a visible regression so the screenshot diff is obvious and repeatable.
    await page.addStyleTag({
      content: `
        .login_wrapper {
          transform: translateY(24px);
        }

        .login_logo {
          color: #b91c1c !important;
          letter-spacing: 0.2rem;
        }

        .submit-button.btn_action {
          background: #111827 !important;
          border-color: #111827 !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot('saucedemo-login-page.png', {
      fullPage: true,
    });
  });
});
