import { type Locator, type Page } from '@playwright/test';
import { LoginError } from '../utils/login-errors';

export class LoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username').or(page.locator('#username'));
    this.passwordInput = page.getByLabel('Password').or(page.locator('#password'));
    this.loginButton = page
      .getByRole('button', { name: 'Log In' })
      .or(page.locator('input#Login'))
      .or(page.locator('button[type="submit"]'));
    this.rememberMeCheckbox = page
      .getByRole('checkbox', { name: 'Remember me' })
      .or(page.locator('#rememberUn'));
  }

  async open(): Promise<void> {
    try {
      await this.page.goto('/?locale=in');
      await this.usernameInput.waitFor({ state: 'visible' });
    } catch (cause) {
      throw new LoginError('opening the Salesforce login page', cause);
    }
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }

  async fillUsername(username: string): Promise<void> {
    try {
      await this.usernameInput.fill(username);
    } catch (cause) {
      throw new LoginError('filling the username field', cause);
    }
  }

  async fillPassword(password: string): Promise<void> {
    try {
      await this.passwordInput.fill(password);
    } catch (cause) {
      throw new LoginError('filling the password field', cause);
    }
  }

  async submit(): Promise<void> {
    try {
      await this.loginButton.click();
    } catch (cause) {
      throw new LoginError('clicking the login button', cause);
    }
  }

  async checkRememberMe(): Promise<void> {
    try {
      await this.rememberMeCheckbox.check();
    } catch (cause) {
      throw new LoginError('checking the remember me option', cause);
    }
  }

  async isRememberMeChecked(): Promise<boolean> {
    try {
      return await this.rememberMeCheckbox.isChecked();
    } catch (cause) {
      throw new LoginError('reading the remember me state', cause);
    }
  }
}
