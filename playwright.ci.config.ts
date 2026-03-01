import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for CI E2E tests
 * Runs against the live site at reader.chigao.site
 *
 * Override the base URL with the BASE_URL environment variable:
 *   BASE_URL=https://localhost:4173 npx playwright test --config=playwright.ci.config.ts
 */
export default defineConfig({
  testDir: './tests/e2e/ci',
  fullyParallel: false,
  forbidOnly: true,
  retries: 2,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60_000,

  use: {
    baseURL: process.env.BASE_URL || 'https://reader.chigao.site',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
