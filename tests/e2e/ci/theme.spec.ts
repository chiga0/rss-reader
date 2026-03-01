/**
 * E2E Test: Theme Switching
 *
 * Verifies theme switching functionality on the live site:
 * 1. Theme can be changed in settings via select dropdown
 * 2. Theme persists across page reloads
 * 3. System theme preference is respected
 */

import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    // Clear any stored theme preference
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should load settings page with theme selector', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Theme selector should be visible
    const themeSelector = page.locator('select#theme-selector, [data-testid="theme-selector"]');
    await expect(themeSelector).toBeVisible({ timeout: 5_000 });
  });

  test('should switch to dark theme and persist', async ({ page }) => {
    const themeSelector = page.locator('select#theme-selector, [data-testid="theme-selector"]');
    await expect(themeSelector).toBeVisible({ timeout: 5_000 });

    // Select dark theme
    await themeSelector.selectOption('dark');

    // Wait for dark class to be applied
    await expect(page.locator('html.dark')).toBeAttached({ timeout: 5_000 });

    // Reload and verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    const isDarkAfterReload = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDarkAfterReload).toBe(true);

    // Verify localStorage
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
  });

  test('should switch to light theme', async ({ page }) => {
    const themeSelector = page.locator('select#theme-selector, [data-testid="theme-selector"]');
    await expect(themeSelector).toBeVisible({ timeout: 5_000 });

    // Set to dark first
    await themeSelector.selectOption('dark');
    await expect(page.locator('html.dark')).toBeAttached({ timeout: 5_000 });

    // Switch to light
    await themeSelector.selectOption('light');
    await expect(page.locator('html:not(.dark)')).toBeAttached({ timeout: 5_000 });

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(false);

    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('light');
  });

  test('should respect system theme preference', async ({ page }) => {
    // emulateMedia is on page, not context
    await page.emulateMedia({ colorScheme: 'dark' });

    const themeSelector = page.locator('select#theme-selector, [data-testid="theme-selector"]');
    await expect(themeSelector).toBeVisible({ timeout: 5_000 });

    // Set to system
    await themeSelector.selectOption('system');

    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    // With system set to dark, page should have dark class
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);

    // Switch system to light
    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const isDarkAfterLight = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDarkAfterLight).toBe(false);
  });
});
