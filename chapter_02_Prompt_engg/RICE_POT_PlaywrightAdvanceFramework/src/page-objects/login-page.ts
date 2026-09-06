import { type Locator, type Page } from '@playwright/test';
import { LoginError } from '../utils/login-errors';

export class LoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly authenticatedHome: Locator;
  private readonly errorRegion: Locator;
  private readonly fieldValidation: Locator;

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
    this.authenticatedHome = page
      .getByRole('navigation')
      .or(page.locator('[class*="appLauncher"]'))
      .first();
    this.errorRegion = page
      .locator('div#error, div.loginError, [role="alert"]')
      .first();
    this.fieldValidation = page.locator(
      'input[aria-invalid="true"], [aria-describedby*="error"], .errorMsg',
    ).first();
  }

  /** Opens the Salesforce login page and waits for the username field. */
  async open(): Promise<void> {
    try {
      await this.page.goto('/?locale=in');
      await this.usernameInput.waitFor({ state: 'visible' });
    } catch (cause) {
      throw new LoginError('opening the Salesforce login page', cause);
    }
  }

  /** Enters credentials and submits the login form. */
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Enters the supplied username. */
  async fillUsername(username: string): Promise<void> {
    try {
      await this.usernameInput.fill(username);
    } catch (cause) {
      throw new LoginError('filling the username field', cause);
    }
  }

  /** Enters the supplied password. */
  async fillPassword(password: string): Promise<void> {
    try {
      await this.passwordInput.fill(password);
    } catch (cause) {
      throw new LoginError('filling the password field', cause);
    }
  }

  /** Submits the login form. */
  async submit(): Promise<void> {
    try {
      await this.loginButton.click();
    } catch (cause) {
      throw new LoginError('clicking the login button', cause);
    }
  }

  /** Checks the Remember Me option. */
  async checkRememberMe(): Promise<void> {
    try {
      await this.rememberMeCheckbox.check();
    } catch (cause) {
      throw new LoginError('checking the remember me option', cause);
    }
  }

  /** Returns whether the Remember Me option is selected. */
  async isRememberMeChecked(): Promise<boolean> {
    try {
      return await this.rememberMeCheckbox.isChecked();
    } catch (cause) {
      throw new LoginError('reading the remember me state', cause);
    }
  }

  /** Returns whether the authenticated home landmark is visible. */
  async isAuthenticatedHomeVisible(): Promise<boolean> {
    try {
      return await this.authenticatedHome.isVisible();
    } catch (cause) {
      throw new LoginError('reading the authenticated home state', cause);
    }
  }

  /** Returns whether a form-level or field-level validation message is visible. */
  async isValidationMessageVisible(): Promise<boolean> {
    try {
      return (await this.errorRegion.isVisible()) || (await this.fieldValidation.isVisible());
    } catch (cause) {
      throw new LoginError('reading the login validation state', cause);
    }
  }
}
