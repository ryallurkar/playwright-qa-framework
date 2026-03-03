import { Page } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async fillInput(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).fill(value);
  }

  async clickElement(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  async getText(selector: string): Promise<string> {
    const text = await this.page.locator(selector).innerText();
    return text.trim();
  }

  async isVisible(selector: string): Promise<boolean> {
    return this.page.locator(selector).isVisible();
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async waitForURL(url: string): Promise<void> {
    await this.page.waitForURL((currentUrl) => currentUrl.href.includes(url));
  }

  async takeScreenshot(name: string): Promise<void> {
    const fileName = name.replace(/\s+/g, '-').toLowerCase();
    await this.page.screenshot({
      path: `test-results/${fileName}.png`,
      fullPage: true,
    });
  }
}
