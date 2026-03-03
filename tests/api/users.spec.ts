import { test, expect } from '@fixtures/customFixtures';
import { APIClient } from '@helpers/apiClient';
import { randomUser } from '@test-data/dynamic/randomData';
import staticUsers from '@test-data/static/users.json';

type StaticUser = {
  id: number;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
};

const referenceUser = staticUsers[0] as StaticUser;

test.describe('Users API coverage', () => {
  test('GET users returns 200 and array @api @regression', async ({ apiContext }) => {
    // Arrange
    const client = new APIClient(apiContext);

    // Act
    const response = await client.get('/users');
    const body = (await response.json()) as unknown[];

    // Assert
    await client.expectStatus(response, 200);
    await expect(Array.isArray(body)).toBe(true);
  });

  test('GET user by ID returns correct user @api @regression', async ({ apiContext }) => {
    // Arrange
    const client = new APIClient(apiContext);

    // Act
    const response = await client.get(`/users/${referenceUser.id}`);

    // Assert
    await client.expectStatus(response, 200);
    await client.expectBodyContains(response, {
      id: referenceUser.id,
      email: referenceUser.email,
    });
  });

  test('POST create user returns 201 @api @regression', async ({ apiContext }) => {
    // Arrange
    const client = new APIClient(apiContext);
    const newUser = randomUser();

    // Act
    const response = await client.post('/users', { data: newUser });

    // Assert
    await client.expectStatus(response, 201);
    await client.expectBodyContains(response, {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    });
  });

  test('DELETE user returns 204 @api @regression', async ({ apiContext }) => {
    // Arrange
    const client = new APIClient(apiContext);
    const deletionCandidate = referenceUser.id;

    // Act
    const response = await client.delete(`/users/${deletionCandidate}`);

    // Assert
    await client.expectStatus(response, 204);
    await expect(response.ok()).toBe(true);
  });
});
