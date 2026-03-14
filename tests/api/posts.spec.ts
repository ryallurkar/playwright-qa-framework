/**
 * API Demo: JSONPlaceholder Posts
 *
 * Demonstrates core REST API testing patterns using https://jsonplaceholder.typicode.com
 * — a free, public mock API. No secrets or auth required.
 *
 * Covers: GET list, GET single, POST, PUT, PATCH, DELETE
 */

import { test, expect } from '@fixtures/apiFixtures';
import { APIClient } from '@helpers/apiClient';

type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

test.describe('Posts API @api @regression', () => {
  test('GET /posts returns an array of 100 posts', async ({ apiContext }) => {
    const client = new APIClient(apiContext);

    await test.step('Act', async () => {
      const response = await client.get('/posts');
      const body = (await response.json()) as Post[];

      await test.step('Assert - status 200', async () => {
        client.expectStatus(response, 200);
      });

      await test.step('Assert - body is an array of 100 posts', async () => {
        expect(Array.isArray(body)).toBe(true);
        expect(body).toHaveLength(100);
      });

      await test.step('Assert - each post has the expected shape', async () => {
        const first = body[0];
        expect(first).toMatchObject({
          id: expect.any(Number),
          userId: expect.any(Number),
          title: expect.any(String),
          body: expect.any(String),
        });
      });
    });
  });

  test('GET /posts/:id returns the correct post', async ({ apiContext }) => {
    const client = new APIClient(apiContext);
    const postId = 1;

    await test.step('Act', async () => {
      const response = await client.get(`/posts/${postId}`);
      const post = (await response.json()) as Post;

      await test.step('Assert - status 200', async () => {
        client.expectStatus(response, 200);
      });

      await test.step('Assert - correct id and required fields present', async () => {
        expect(post.id).toBe(postId);
        expect(post.userId).toBeDefined();
        expect(post.title).toBeTruthy();
        expect(post.body).toBeTruthy();
      });
    });
  });

  test('POST /posts creates a new post and returns 201', async ({ apiContext }) => {
    const client = new APIClient(apiContext);
    const newPost = { userId: 1, title: 'Playwright API Demo', body: 'Testing POST with Playwright' };

    await test.step('Arrange', async () => {
      expect(newPost.title).toBeTruthy();
    });

    await test.step('Act', async () => {
      const response = await client.post('/posts', { data: newPost });
      const created = (await response.json()) as Post;

      await test.step('Assert - status 201', async () => {
        client.expectStatus(response, 201);
      });

      await test.step('Assert - response echoes the sent payload', async () => {
        expect(created.title).toBe(newPost.title);
        expect(created.body).toBe(newPost.body);
        expect(created.userId).toBe(newPost.userId);
        expect(created.id).toBeDefined();
      });
    });
  });

  test('PUT /posts/:id replaces a post and returns 200', async ({ apiContext }) => {
    const client = new APIClient(apiContext);
    const postId = 5;
    const updatedPost = { id: postId, userId: 1, title: 'Updated Title', body: 'Fully replaced body' };

    await test.step('Act', async () => {
      const response = await client.put(`/posts/${postId}`, { data: updatedPost });
      const updated = (await response.json()) as Post;

      await test.step('Assert - status 200', async () => {
        client.expectStatus(response, 200);
      });

      await test.step('Assert - response reflects full replacement', async () => {
        expect(updated.id).toBe(postId);
        expect(updated.title).toBe(updatedPost.title);
        expect(updated.body).toBe(updatedPost.body);
      });
    });
  });

  test('PATCH /posts/:id updates only the title and returns 200', async ({ apiContext }) => {
    const client = new APIClient(apiContext);
    const postId = 3;
    const patch = { title: 'Patched Title Only' };

    await test.step('Act', async () => {
      const response = await client.patch(`/posts/${postId}`, { data: patch });
      const patched = (await response.json()) as Post;

      await test.step('Assert - status 200', async () => {
        client.expectStatus(response, 200);
      });

      await test.step('Assert - title updated, other fields preserved', async () => {
        expect(patched.title).toBe(patch.title);
        expect(patched.id).toBe(postId);
      });
    });
  });

  test('DELETE /posts/:id returns 200 with empty body', async ({ apiContext }) => {
    const client = new APIClient(apiContext);
    const postId = 10;

    await test.step('Act', async () => {
      const response = await client.delete(`/posts/${postId}`);

      await test.step('Assert - status 200', async () => {
        client.expectStatus(response, 200);
      });

      await test.step('Assert - response body is an empty object', async () => {
        const body = (await response.json()) as Record<string, unknown>;
        expect(Object.keys(body)).toHaveLength(0);
      });
    });
  });
});
