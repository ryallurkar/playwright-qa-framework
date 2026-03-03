import { BasePage } from '@pages/BasePage';

export class LoginPage extends BasePage {
  private readonly baseUrl = 'https://www.saucedemo.com';
  private readonly usernameInput = '#user-name';
  private readonly passwordInput = '#password';
  private readonly loginButton = '#login-button';
  private readonly errorMessage = '[data-test="error"]';
  private readonly loginLogo = '.login_logo';

  async goto(): Promise<void> {
    await this.navigate(this.baseUrl);
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickElement(this.loginButton);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isLoginPageVisible(): Promise<boolean> {
    return this.isVisible(this.loginLogo);
  }
}
