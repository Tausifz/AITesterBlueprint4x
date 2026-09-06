import { expect, test } from '@playwright/test';
import { LoginPage } from '../src/page-objects/login-page';
import { loginData } from '../src/data/login-data';

test.describe('Salesforce login - invalid credentials', () => {
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

  test('rejects an incorrect password', async ({ page }) => {
    await loginPage.login(
      loginData.invalid.wrongPassword.username,
      loginData.invalid.wrongPassword.password,
    );

    await expect.poll(() => loginPage.isValidationMessageVisible()).toBe(true);
    await expect(page).toHaveURL(/login/i);
  });

  test('rejects an incorrect username', async ({ page }) => {
    await loginPage.login(
      loginData.invalid.wrongUsername.username,
      loginData.invalid.wrongUsername.password,
    );

    await expect.poll(() => loginPage.isValidationMessageVisible()).toBe(true);
    await expect(page).toHaveURL(/login/i);
  });

  test('rejects an empty username', async ({ page }) => {
    await loginPage.login(
      loginData.invalid.emptyUsername.username,
      loginData.invalid.emptyUsername.password,
    );

    await expect.poll(() => loginPage.isValidationMessageVisible()).toBe(true);
    await expect(page).toHaveURL(/login/i);
  });

  test('rejects an empty password', async ({ page }) => {
    await loginPage.login(
      loginData.invalid.emptyPassword.username,
      loginData.invalid.emptyPassword.password,
    );

    await expect.poll(() => loginPage.isValidationMessageVisible()).toBe(true);
    await expect(page).toHaveURL(/login/i);
  });

  test('rejects empty username and password', async ({ page }) => {
    await loginPage.login(
      loginData.invalid.emptyBoth.username,
      loginData.invalid.emptyBoth.password,
    );

    await expect.poll(() => loginPage.isValidationMessageVisible()).toBe(true);
    await expect(page).toHaveURL(/login/i);
  });
});
