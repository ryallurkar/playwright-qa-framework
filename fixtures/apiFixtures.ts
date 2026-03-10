import { APIRequestContext, request, test as base, expect } from '@playwright/test';

type ApiFixtures = {
  apiContext: APIRequestContext;
};

const getRequiredEnv = (name: 'API_BASE_URL'): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} is required for this test run.`);
  }

  return value;
};

export const test = base.extend<ApiFixtures>({
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
