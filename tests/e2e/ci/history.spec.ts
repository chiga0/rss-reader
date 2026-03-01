/**
 * E2E Test: History Page
 *
 * Tests the reading history workflow on the live site:
 * US-05: View reading history, navigate to articles from history
 */

import { test, expect } from '@playwright/test';

const TEST_FEED_URL = 'https://tailwindcss.com/feeds/feed.xml';

test.describe('Reading History', () => {
  test('should display history page with heading', async ({ page }) => {
    await page.goto('/#/history');
    await page.waitForLoadState('networkidle');

    // Verify page heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const headingText = await heading.textContent();
    expect(headingText).toMatch(/History|历史|Reading History/);
  });

  test('should show articles in history after reading them', async ({ page }) => {
    // Step 1: Go to feeds page
    await page.goto('/');
    await page.waitForURL(/\/#\/feeds/, { timeout: 15_000 });
    await page.waitForLoadState('networkidle');

    // Ensure feed is subscribed
    const existingFeed = page.locator('a[href*="/feeds/"]').first();
    if (!(await existingFeed.isVisible({ timeout: 3_000 }).catch(() => false))) {
      const addButton = page.locator('button').filter({ hasText: /Add Feed|添加订阅/ });
      const fabButton = page.locator('button.fixed, button[class*="fixed"]').last();
      const targetButton = (await addButton.count()) > 0 ? addButton.first() : fabButton;
      await targetButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5_000 });
      await dialog.locator('input#feed-url').fill(TEST_FEED_URL);
      await dialog.locator('button[type="submit"]').click();
      await expect(dialog).not.toBeVisible({ timeout: 30_000 });
    }

    // Step 2: Navigate to a feed and read an article
    const feedLink = page.locator('a[href*="/feeds/"]').first();
    await expect(feedLink).toBeVisible({ timeout: 10_000 });
    await feedLink.click();
    await page.waitForLoadState('networkidle');

    const articleLink = page.locator('a[href*="/articles/"]').first();
    await expect(articleLink).toBeVisible({ timeout: 10_000 });
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    // Verify article page loaded (reading it auto-marks as read)
    const articleTitle = page.locator('h1').first();
    await expect(articleTitle).toBeVisible({ timeout: 10_000 });

    // Step 3: Navigate to history page
    await page.goto('/#/history');
    await page.waitForLoadState('networkidle');

    // Step 4: Verify history page shows the read article
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const headingText = await heading.textContent();
    expect(headingText).toMatch(/History|历史|Reading History/);

    // Should have at least one article in history (the one we just read)
    const historyArticles = page.locator('a[href*="/articles/"]');
    await expect(historyArticles.first()).toBeVisible({ timeout: 10_000 });
    const count = await historyArticles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate from history to article detail', async ({ page }) => {
    await page.goto('/#/history');
    await page.waitForLoadState('networkidle');

    // Check if there are history articles
    const articleLinks = page.locator('a[href*="/articles/"]');
    if ((await articleLinks.count()) > 0) {
      // Click the first article
      await articleLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Verify article detail page loads
      const articleTitle = page.locator('h1').first();
      await expect(articleTitle).toBeVisible({ timeout: 10_000 });
      const titleText = await articleTitle.textContent();
      expect(titleText).toBeTruthy();
      expect(titleText!.length).toBeGreaterThan(0);
    }
  });

  test('should display read time information for history articles', async ({ page }) => {
    await page.goto('/#/history');
    await page.waitForLoadState('networkidle');

    // Check if there are history articles with read time info
    const articleLinks = page.locator('a[href*="/articles/"]');
    if ((await articleLinks.count()) > 0) {
      // History items should show read time like "Read Xm ago", "Just now", etc.
      const bodyText = await page.textContent('body');
      // The history page shows "Read" followed by relative time
      expect(bodyText).toMatch(/Read|Just now|ago|历史/);
    }
  });
});
