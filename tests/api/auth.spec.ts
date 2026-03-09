import { test, expect } from '@fixtures/apiFixtures';
import { APIClient } from '@helpers/apiClient';
import { parseJwt } from '@helpers/utils';

test.describe('Authentication API coverage', () => {
  test('POST login returns 200 and token @api', async ({ apiContext }) => {
    // Arrange
    const client = new APIClient(apiContext);
    const payload = {
      email: process.env.TEST_USER_EMAIL ?? '',
      password: process.env.TEST_USER_PASSWORD ?? '',
    };

    // Act
    const response = await client.post('/auth/login', { data: payload });
    const body = (await response.json()) as Record<string, unknown>;

    // Assert
    await client.expectStatus(response, 200);
    await expect(typeof body.token).toBe('string');
  });

  test('POST login with wrong credentials returns 401 @api @regression', async ({ apiContext }) => {
    // Arrange
    const client = new APIClient(apiContext);
    const payload = {
      email: process.env.TEST_USER_EMAIL ?? '',
      password: 'invalid-password',
    };

    // Act
    const response = await client.post('/auth/login', { data: payload });

    // Assert
    await client.expectStatus(response, 401);
  });

  test('token payload contains expected user fields @api @regression', async ({ apiContext }) => {
    // Arrange
    const client = new APIClient(apiContext);
    const payload = {
      email: process.env.TEST_USER_EMAIL ?? '',
      password: process.env.TEST_USER_PASSWORD ?? '',
    };

    // Act
    const response = await client.post('/auth/login', { data: payload });
    const body = (await response.json()) as Record<string, unknown>;
    const token = `${body.token ?? ''}`;
    const decodedToken = parseJwt(token);

    // Assert
    await client.expectStatus(response, 200);
    await expect(decodedToken).not.toBeNull();
    await expect(decodedToken).toMatchObject({
      email: process.env.TEST_USER_EMAIL ?? '',
    });
    await expect(decodedToken).toHaveProperty('sub');
  });
});
