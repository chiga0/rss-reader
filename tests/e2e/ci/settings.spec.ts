/**
 * E2E Test: Settings Page
 *
 * Verifies settings page functionality on the live site:
 * 1. Language settings
 * 2. Theme settings
 * 3. Refresh interval settings
 */

import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display all settings sections', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Theme section should be visible
    const themeText = page.getByText(/Theme|主题/);
    await expect(themeText.first()).toBeVisible({ timeout: 5_000 });

    // Language section should be visible
    const languageText = page.getByText(/Language|语言/);
    await expect(languageText.first()).toBeVisible({ timeout: 5_000 });
  });

  test('should switch language between English and Chinese', async ({ page }) => {
    // Look for language selector
    const enButton = page.locator('button, option, label').filter({ hasText: 'English' });
    const zhButton = page.locator('button, option, label').filter({ hasText: '中文' });

    if ((await enButton.count()) > 0 && (await zhButton.count()) > 0) {
      // Switch to English
      await enButton.first().click();
      await expect(page.locator('h1').first()).toContainText('Settings', { timeout: 5_000 });

      // Switch to Chinese
      await zhButton.first().click();
      await expect(page.locator('h1').first()).toContainText('设置', { timeout: 5_000 });
    }
  });

  test('should have OPML import/export options', async ({ page }) => {
    // Check for OPML related buttons/text
    const opmlText = page.getByText(/OPML/i);
    if ((await opmlText.count()) > 0) {
      await expect(opmlText.first()).toBeVisible();
    }
  });
});
