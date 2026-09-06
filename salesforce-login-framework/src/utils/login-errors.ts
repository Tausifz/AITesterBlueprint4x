import { expect, type Locator, type Page } from '@playwright/test';

export class LoginError extends Error {
  readonly action: string;
  readonly cause?: unknown;

  constructor(action: string, cause?: unknown) {
    super(`Login action failed: ${action}`);
    this.name = 'LoginError';
    this.action = action;
    this.cause = cause;
  }
}

export async function expectErrorRegionVisible(page: Page): Promise<Locator> {
  const errorLocator = page
    .locator('div#error, div.loginError, [role="alert"]')
    .first();

  try {
    await expect(errorLocator).toBeVisible();
  } catch (cause) {
    throw new LoginError('waiting for error region to be visible', cause);
  }

  return errorLocator;
}
