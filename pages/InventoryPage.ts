import { BasePage } from '@pages/BasePage';

export class InventoryPage extends BasePage {
  private readonly pageTitle = '.title';
  private readonly inventoryList = '.inventory_list';
  private readonly inventoryItems = '.inventory_item';
  private readonly shoppingCartBadge = '.shopping_cart_badge';
  private readonly burgerMenu = '#react-burger-menu-btn';
  private readonly logoutLink = '#logout_sidebar_link';

  async getPageTitle(): Promise<string> {
    return this.getText(this.pageTitle);
  }

  async getInventoryItemCount(): Promise<number> {
    return this.page.locator(this.inventoryItems).count();
  }

  async isInventoryPageVisible(): Promise<boolean> {
    return this.isVisible(this.inventoryList);
  }

  async logout(): Promise<void> {
    await this.clickElement(this.burgerMenu);
    const logoutLink = this.page.locator(this.logoutLink);
    await logoutLink.waitFor({ state: 'visible' });
    await logoutLink.click();
  }

  async isCartBadgeVisible(): Promise<boolean> {
    return this.isVisible(this.shoppingCartBadge);
  }
}
