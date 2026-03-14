import { test, expect } from '@fixtures/customFixtures';
import users from '@test-data/static/users.json';

type SauceUser = {
  username: string;
  password: string;
};

const [standardUser] = users as SauceUser[];

test.describe('Playwright Network Interception And API Mocking', () => {
  test('should observe post-login inventory asset traffic @smoke @ui', async ({
    page,
    loginPage,
    inventoryPage,
  }, testInfo) => {
    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    const inventoryImageRequestPromise = page.waitForRequest((request) => {
      return request.url().includes('sauce-backpack') && request.resourceType() === 'image';
    });

    const inventoryImageResponsePromise = page.waitForResponse((response) => {
      return (
        response.url().includes('sauce-backpack') && response.request().resourceType() === 'image'
      );
    });

    await test.step('Act', async () => {
      await loginPage.login(standardUser.username, standardUser.password);
    });

    await test.step('Assert', async () => {
      const inventoryImageRequest = await inventoryImageRequestPromise;
      const inventoryImageResponse = await inventoryImageResponsePromise;

      await inventoryPage.waitForURL('/inventory');
      await expect(await inventoryPage.isInventoryPageVisible()).toBe(true);
      await expect(inventoryImageRequest.method()).toBe('GET');
      await expect(inventoryImageResponse.status()).toBe(200);
      await expect(inventoryImageRequest.resourceType()).toBe('image');

      await testInfo.attach('inventory-image-network.json', {
        body: Buffer.from(
          JSON.stringify(
            {
              request: {
                method: inventoryImageRequest.method(),
                url: inventoryImageRequest.url(),
                resourceType: inventoryImageRequest.resourceType(),
              },
              response: {
                status: inventoryImageResponse.status(),
                ok: inventoryImageResponse.ok(),
                url: inventoryImageResponse.url(),
              },
            },
            null,
            2,
          ),
        ),
        contentType: 'application/json',
      });
    });
  });

  test('should block an inventory image request with route.abort @regression', async ({
    page,
    loginPage,
    inventoryPage,
  }, testInfo) => {
    let abortedImageUrl = '';
    let hasAbortedOneImage = false;

    await page.route(/.*\/static\/media\/.*\.(jpg|png|jpeg)$/, async (route) => {
      if (hasAbortedOneImage) {
        await route.continue();
        return;
      }

      hasAbortedOneImage = true;
      abortedImageUrl = route.request().url();
      await route.abort('failed');
    });

    await test.step('Arrange', async () => {
      await loginPage.goto();
      await expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    await test.step('Act', async () => {
      await loginPage.login(standardUser.username, standardUser.password);
    });

    await test.step('Assert', async () => {
      await inventoryPage.waitForURL('/inventory');
      await expect(await inventoryPage.isInventoryPageVisible()).toBe(true);
      await expect(abortedImageUrl).toContain('/static/media/');

      const imageState = await page
        .locator('.inventory_item img')
        .evaluateAll((images, expectedUrl) => {
          const matchingImage = images.find(
            (image) => (image as HTMLImageElement).currentSrc === expectedUrl,
          ) as HTMLImageElement | undefined;

          return {
            found: Boolean(matchingImage),
            currentSrc: matchingImage?.currentSrc ?? '',
            naturalWidth: matchingImage?.naturalWidth ?? -1,
          };
        }, abortedImageUrl);

      await expect(imageState.found).toBe(true);
      await expect(imageState.currentSrc).toContain('static/media');
      await expect(imageState.naturalWidth).toBe(0);

      await testInfo.attach('aborted-image-request.json', {
        body: Buffer.from(
          JSON.stringify(
            {
              abortedImageUrl,
              imageState,
            },
            null,
            2,
          ),
        ),
        contentType: 'application/json',
      });
    });
  });

  test('should mock a JSON API endpoint with route.fulfill @regression @ui', async ({
    page,
    loginPage,
  }, testInfo) => {
    await page.route('**/api/demo/inventory-summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          source: 'playwright-mock',
          itemCount: 6,
          highlightedItem: 'Sauce Labs Backpack',
        }),
      });
    });

    await loginPage.goto();
    await expect(await loginPage.isLoginPageVisible()).toBe(true);

    const mockedApiResponse = await page.evaluate(async () => {
      const response = await fetch('/api/demo/inventory-summary');
      const body = await response.json();

      return {
        status: response.status,
        ok: response.ok,
        body,
      };
    });

    await expect(mockedApiResponse.status).toBe(200);
    await expect(mockedApiResponse.ok).toBe(true);
    await expect(mockedApiResponse.body).toEqual({
      source: 'playwright-mock',
      itemCount: 6,
      highlightedItem: 'Sauce Labs Backpack',
    });

    await testInfo.attach('mocked-inventory-summary.json', {
      body: Buffer.from(JSON.stringify(mockedApiResponse, null, 2)),
      contentType: 'application/json',
    });
  });
});
