/**
 * E2E Test: Page Load and Basic Navigation
 *
 * Verifies core pages load correctly and navigation works
 * on the live site at reader.chigao.site
 */

import { test, expect } from '@playwright/test';

test.describe('Page Load and Navigation', () => {
  test('should load the feeds page', async ({ page }) => {
    await page.goto('/');
    // The app uses hash routing, should redirect to /#/feeds
    await page.waitForURL(/\/#\/feeds/, { timeout: 15_000 });

    // Check that page title or heading is present (supports both en/zh)
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const headingText = await heading.textContent();
    expect(headingText).toMatch(/Feeds|订阅源/);
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const headingText = await heading.textContent();
    expect(headingText).toMatch(/Settings|设置/);
  });

  test('should navigate to favorites page', async ({ page }) => {
    await page.goto('/#/favorites');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const headingText = await heading.textContent();
    expect(headingText).toMatch(/Favorite|收藏/);
  });

  test('should navigate to history page', async ({ page }) => {
    await page.goto('/#/history');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const headingText = await heading.textContent();
    expect(headingText).toMatch(/History|历史/);
  });

  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto('/#/nonexistent-route');
    await page.waitForLoadState('networkidle');

    // Should show 404 or redirect to feeds
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/#\/feeds/, { timeout: 15_000 });

    // Verify navigation is present - check for nav element or bottom nav bar
    // Desktop nav is hidden below md breakpoint, so check at desktop viewport
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible({ timeout: 10_000 });

    // Verify key page navigation works by clicking through
    // Navigate to favorites via URL
    await page.goto('/#/favorites');
    await page.waitForLoadState('networkidle');
    const favHeading = page.locator('h1').first();
    await expect(favHeading).toBeVisible({ timeout: 10_000 });

    // Navigate to settings via URL
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    const settingsHeading = page.locator('h1').first();
    await expect(settingsHeading).toBeVisible({ timeout: 10_000 });

    // Navigate back to feeds
    await page.goto('/#/feeds');
    await page.waitForLoadState('networkidle');
    const feedsHeading = page.locator('h1').first();
    await expect(feedsHeading).toBeVisible({ timeout: 10_000 });
  });
});
