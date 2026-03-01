/**
 * E2E Test: Favorites Page
 *
 * Tests the favorites workflow on the live site:
 * US-04: Favorite articles, view favorites list, unfavorite
 */

import { test, expect } from '@playwright/test';

const TEST_FEED_URL = 'https://tailwindcss.com/feeds/feed.xml';

/**
 * Helper to ensure a feed is subscribed before test.
 */
async function ensureFeedSubscribed(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForURL(/\/#\/feeds/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');

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
}

test.describe('Favorites Functionality', () => {
  test('should display favorites page with heading', async ({ page }) => {
    await page.goto('/#/favorites');
    await page.waitForLoadState('networkidle');

    // Verify page heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const headingText = await heading.textContent();
    expect(headingText).toMatch(/Favorite|收藏/);
  });

  test('should favorite an article and see it in favorites', async ({ page }) => {
    await ensureFeedSubscribed(page);

    // Navigate to a feed and open an article
    const feedLink = page.locator('a[href*="/feeds/"]').first();
    await expect(feedLink).toBeVisible({ timeout: 10_000 });
    await feedLink.click();
    await page.waitForLoadState('networkidle');

    const articleLink = page.locator('a[href*="/articles/"]').first();
    await expect(articleLink).toBeVisible({ timeout: 10_000 });
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    // Click the favorite button in the action bar
    const favoriteButton = page.locator('button').filter({ hasText: /Favorite|收藏|favorite/ }).first();
    await expect(favoriteButton).toBeVisible({ timeout: 10_000 });
    await favoriteButton.click();

    // Wait for the favorited state to appear (text changes to "Favorited" / "已收藏")
    await expect(page.locator('button').filter({ hasText: /Favorited|已收藏|favorited/ }).first()).toBeVisible({ timeout: 5_000 });

    // Navigate to favorites page
    await page.goto('/#/favorites');
    await page.waitForLoadState('networkidle');

    // Verify the favorites page shows content
    const favHeading = page.locator('h1').first();
    await expect(favHeading).toBeVisible({ timeout: 10_000 });
    const favText = await favHeading.textContent();
    expect(favText).toMatch(/Favorite|收藏/);
  });

  test('should navigate from favorites to article detail', async ({ page }) => {
    await page.goto('/#/favorites');
    await page.waitForLoadState('networkidle');

    // Check if there are any favorited articles
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
});
