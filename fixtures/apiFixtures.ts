import { APIRequestContext, request, test as base, expect } from '@playwright/test';

type ApiFixtures = {
  apiContext: APIRequestContext;
};

const DEFAULT_API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const test = base.extend<ApiFixtures>({
  // Playwright fixture callbacks require object destructuring for the first parameter.
  // eslint-disable-next-line no-empty-pattern
  apiContext: async ({}, use) => {
    const baseURL = process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
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
