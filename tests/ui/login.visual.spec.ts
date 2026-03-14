import { test, expect, type Locator, type Page } from '@playwright/test';
import users from '@test-data/static/users.json';

type SauceUser = {
  username: string;
  password: string;
  expectedError?: string;
};

const [standardUser, lockedUser, invalidUser] = users as SauceUser[];

const selectors = {
  loginLogo: '.login_logo',
  loginBox: '.login-box',
  loginForm: '.login-box form',
  usernameInput: '#user-name',
  passwordInput: '#password',
  loginButton: '#login-button',
  credentialsPanel: '[data-test="login-credentials"]',
  passwordHint: '[data-test="login-password"]',
  errorBanner: '[data-test="error"]',
};

async function gotoLogin(page: Page): Promise<void> {
  await page.goto('https://www.saucedemo.com', { waitUntil: 'domcontentloaded' });
  await expect(page.locator(selectors.loginLogo)).toBeVisible();
}

async function login(page: Page, username: string, password: string): Promise<void> {
  await page.locator(selectors.usernameInput).fill(username);
  await page.locator(selectors.passwordInput).fill(password);
  await page.locator(selectors.loginButton).click();
}

function loginForm(page: Page): Locator {
  return page.locator(selectors.loginForm);
}

test.describe('Saucedemo Login Visual Regression', () => {
  test('captures the full login page baseline @ui @visual', async ({ page }) => {
    await gotoLogin(page);

    await expect(page).toHaveScreenshot('login-page-full.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('captures just the login form component @ui @visual', async ({ page }) => {
    await gotoLogin(page);

    await expect(loginForm(page)).toHaveScreenshot('login-form.png', {
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('captures masked credentials for a populated form @ui @visual', async ({ page }) => {
    await gotoLogin(page);
    await page.locator(selectors.usernameInput).fill(standardUser.username);
    await page.locator(selectors.passwordInput).fill(standardUser.password);

    await expect(loginForm(page)).toHaveScreenshot('login-form-masked-fields.png', {
      animations: 'disabled',
      caret: 'hide',
      mask: [page.locator(selectors.usernameInput), page.locator(selectors.passwordInput)],
      maskColor: '#111827',
    });
  });

  test('captures the locked user error state @ui @visual', async ({ page }) => {
    await gotoLogin(page);
    await login(page, lockedUser.username, lockedUser.password);
    await expect(page.locator(selectors.errorBanner)).toContainText(lockedUser.expectedError ?? 'locked out');

    await expect(loginForm(page)).toHaveScreenshot('login-form-locked-user-error.png', {
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('captures the invalid credentials error banner in isolation @ui @visual', async ({ page }) => {
    await gotoLogin(page);
    await login(page, invalidUser.username, invalidUser.password);

    await expect(page.locator(selectors.errorBanner)).toContainText(
      invalidUser.expectedError ?? 'Username and password do not match',
    );

    await expect(page.locator(selectors.errorBanner)).toHaveScreenshot('login-error-banner.png', {
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('masks static helper content to focus on the form shell @ui @visual', async ({ page }) => {
    await gotoLogin(page);

    await expect(page.locator(selectors.loginBox)).toHaveScreenshot('login-box-with-masked-helper-panels.png', {
      animations: 'disabled',
      caret: 'hide',
      mask: [page.locator(selectors.credentialsPanel), page.locator(selectors.passwordHint)],
      maskColor: '#d1d5db',
    });
  });

  test('flags a layout regression against the baseline @ui @visual @visual-demo', async ({ page }) => {
    test.skip(process.env.RUN_VISUAL_REGRESSION_DEMO !== '1', 'Set RUN_VISUAL_REGRESSION_DEMO=1 to run the diff demo.');
    test.fail(true, 'This test intentionally demonstrates a visual regression diff.');

    await gotoLogin(page);
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

    await expect(page).toHaveScreenshot('login-page-full.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });
});
