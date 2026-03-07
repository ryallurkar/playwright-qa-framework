import { test, expect } from '@playwright/test';


test.describe('Catalog Validation Suite', () => {
  test('Verify listing includes target keyword', async ({ page }) => {
    const careersUrl = process.env.LISTING_URL;
    expect(careersUrl, 'Required target URL is not configured').toBeTruthy();
    await page.goto(careersUrl!, { waitUntil: 'domcontentloaded' });

    const cookieButton = page.getByRole('button', { name: 'Reject all' });
    if (await cookieButton.isVisible().catch(() => false)) {
      await cookieButton.click();
    }
    const jobTitleLinks = page.locator('a[href*="/postings/"]');
    await jobTitleLinks.first().waitFor({ state: 'visible', timeout: 20_000 });
    await page.locator('span').filter({ hasText: 'View Jobs' }).getByRole('link').click();
    await jobTitleLinks.first().waitFor({ state: 'visible', timeout: 20_000 });
    const jobsCount = await jobTitleLinks.count();
    const uniqueJobsCount = Math.ceil(jobsCount / 2);
    console.log(`Open listings: ${uniqueJobsCount}`);
    expect(uniqueJobsCount, 'Expected at least one listing').toBeGreaterThan(0);
    const keyword = 'Quality';
    await page.waitForTimeout(500);
    const filteredJobTitles = await jobTitleLinks.allTextContents();
    const titles = filteredJobTitles
      .map((t) => t.trim())
      .filter(Boolean)
      .filter((title, index, self) => self.indexOf(title) === index);

    const matchingTitles = titles.filter((title) =>
      title.toLowerCase().includes(keyword.toLowerCase())
    );
    console.log(
      `Entries matching "${keyword}":\n` +
      (matchingTitles.length > 0
        ? matchingTitles.map((t) => `  • ${t}`).join('\n')
        : '  (none)')
    );
    const hasQualityJob = matchingTitles.length > 0;
    expect(
      hasQualityJob,
      `No entries found matching "${keyword}".`
    ).toBeTruthy();
  });
});
