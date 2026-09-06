# Salesforce Login — Playwright + TypeScript (RICE POT)

## R — Role
You are a Senior QA Automation Architect with 15+ years building Playwright +
TypeScript frameworks for enterprise CRM applications (Salesforce). Build a
production-ready login test framework for https://login.salesforce.com/?locale=in.

## I — Instructions
1. Use Page Object Model: one `LoginPage` class exposes reusable, typed
   methods; locators never appear in spec files.
2. Use Playwright test runner. Apply lifecycle hooks only where they earn
   their keep: `beforeEach` (navigate + instantiate `LoginPage`), `afterEach`
   (screenshot on failure). Add `beforeAll`/`afterAll` only for real shared
   setup/teardown — never an empty hook.
3. Handle errors: page-object methods throw a custom `LoginError` carrying the
   failing action and inner cause. Specs assert with `expect`; no empty catch
   blocks, no swallowed errors.
4. Locators: Playwright-native only. Prefer `getByRole` and `getByLabel`
   (e.g. `getByRole('button', { name: 'Log In' })`, `getByLabel('Username')`);
   fall back to stable IDs via `page.locator('#id')`. Never use XPath.
5. Waits: no `page.waitForTimeout`, no `waitForLoadState('networkidle')`,
   no hard sleeps. Rely on auto-waiting locators and web-first assertions;
   use `locator.waitFor()` only for genuinely dynamic state.
6. Credentials MUST come from environment variables (`SALESFORCE_USERNAME`,
   `SALESFORCE_PASSWORD`) read through a typed config module. Never hardcode
   secrets. Ship a `.env.example` with placeholders.

## C — Context
The Salesforce login page has a Username input, Password input, "Remember me"
checkbox, and "Log In" button. The page is occasionally A/B tested, so the DOM
varies slightly between experiments; locators and waits must stay resilient.

Known stable Salesforce selectors — prefer these, fall back gracefully:
- Username:      `input#username`
- Password:      `input#password`
- Login button:  `input#Login` (fallback `button[type="submit"]`)
- Remember me:   `input#rememberUn`
- Error region:  `div#error` (fallback `div.loginError` or `[role="alert"]`)

## E — Example
```ts
test.describe('Salesforce login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?locale=in');
    loginPage = new LoginPage(page);
  });

  test('valid credentials log in', async ({ page }) => {
    await loginPage.login(credentials.valid.username, credentials.valid.password);
    await expect(page).toHaveURL(/^(?!.*login).*$/);
  });
});
```

## P — Parameters
Production-grade quality, pinpoint accuracy, zero bad-coding practices. Handle
dynamic/A-B-tested error text by asserting an error region or `[role="alert"]`
exists rather than matching an exact string.

### Test cases
Valid (`tests/login-valid.spec.ts`):
- Correct username + password logs in; assert URL no longer contains "login"
  and a home landmark / navigation is visible.
- Correct credentials with "Remember me" checked; assert `rememberUn` state
  persists after login.

Invalid (`tests/login-invalid.spec.ts`):
- Wrong password (valid username) -> error region visible, URL still contains "login".
- Wrong username (valid password) -> same failure behavior.
- Empty username + valid password -> error or field-level validation.
- Valid username + empty password -> error or field-level validation.
- Both fields empty -> error or field-level validation.

## O — Output
Exactly these 6 files, one per code block, preceded by a plain filename line.
No prose, no explanations.

1. `playwright.config.ts` — baseURL, chromium + one extra browser, retries,
   screenshot-on-failure, reporter, `use` options.
2. `src/page-objects/login-page.ts` — `LoginPage` class.
3. `src/data/login-data.ts` — typed credential/test-data accessor reading env.
4. `src/utils/login-errors.ts` — `LoginError` class + error-region wait helper.
5. `tests/login-valid.spec.ts`
6. `tests/login-invalid.spec.ts`

Comments: JSDoc on public classes/methods only; no inline step narration, no
TODO/FIXME. Runnable TypeScript whose imports resolve to the listed files.

## T — Tone
Technical, precise, enterprise-grade, code-first.
