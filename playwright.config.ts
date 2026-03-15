import dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

dotenv.config();

const isCI = process.env.CI === 'true';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        outputFolder: 'allure-results',
        suiteTitle: false,
      },
    ],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    // Runs once before UI projects — logs in and saves session to .auth/user.json.
    // UI tests that need pre-authenticated state use the preAuthPage fixture,
    // which restores this session instead of logging in per test.
    {
      name: 'setup',
      testMatch: '**/setup/auth.setup.ts',
    },
    {
      name: 'chromium',
      testDir: './tests/ui',
      testMatch: '**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        baseURL: process.env.BASE_URL,
      },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      testMatch: '**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        browserName: 'firefox',
        baseURL: process.env.BASE_URL,
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: '**/*.spec.ts',
      use: {
        baseURL: process.env.API_BASE_URL,
      },
    },
  ],
});
