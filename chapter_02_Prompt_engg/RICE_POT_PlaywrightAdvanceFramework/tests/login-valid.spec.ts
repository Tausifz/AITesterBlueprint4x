import { expect, test } from '@playwright/test';
import { LoginPage } from '../src/page-objects/login-page';
import { loginData } from '../src/data/login-data';

test.describe('Salesforce login - valid credentials', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      await page.screenshot({ path: testInfo.outputPath('failure.png'), fullPage: true });
    }
  });

  test('logs in with correct username and password', async ({ page }) => {
    if (!loginData.valid.username || !loginData.valid.password) {
      throw new Error(
        'SALESFORCE_USERNAME and SALESFORCE_PASSWORD must be set in the environment.',
      );
    }

    await loginPage.login(loginData.valid.username, loginData.valid.password);

    await expect(page).not.toHaveURL(/login/i);
    await expect.poll(() => loginPage.isAuthenticatedHomeVisible()).toBe(true);
  });

  test('remember me state persists after login', async ({ page }) => {
    if (!loginData.valid.username || !loginData.valid.password) {
      throw new Error(
        'SALESFORCE_USERNAME and SALESFORCE_PASSWORD must be set in the environment.',
      );
    }

    await loginPage.checkRememberMe();
    await expect.poll(() => loginPage.isRememberMeChecked()).toBe(true);

    await loginPage.login(loginData.valid.username, loginData.valid.password);

    await expect(page).not.toHaveURL(/login/i);
  });
});
