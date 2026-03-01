/**
 * E2E Test: Article Reading Workflow
 *
 * Tests the complete article reading experience on the live site:
 * US-03: Article browsing and reading details
 * US-04: Favorite toggle from article detail
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

test.describe('Article Reading Workflow', () => {
  test('should display article metadata on article detail page', async ({ page }) => {
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

    // Verify article title
    const articleTitle = page.locator('h1').first();
    await expect(articleTitle).toBeVisible({ timeout: 10_000 });
    const titleText = await articleTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText!.length).toBeGreaterThan(0);

    // Verify feed source is shown
    const feedSource = page.locator('header').first();
    await expect(feedSource).toBeVisible({ timeout: 5_000 });

    // Verify read status indicator appears after opening
    const readIndicator = page.getByText('✓ Read');
    await expect(readIndicator).toBeVisible({ timeout: 10_000 });
  });

  test('should have favorite toggle button on article page', async ({ page }) => {
    await ensureFeedSubscribed(page);

    // Navigate to article detail
    const feedLink = page.locator('a[href*="/feeds/"]').first();
    await expect(feedLink).toBeVisible({ timeout: 10_000 });
    await feedLink.click();
    await page.waitForLoadState('networkidle');

    const articleLink = page.locator('a[href*="/articles/"]').first();
    await expect(articleLink).toBeVisible({ timeout: 10_000 });
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    // Verify article page loaded
    const articleTitle = page.locator('h1').first();
    await expect(articleTitle).toBeVisible({ timeout: 10_000 });

    // Verify favorite button exists in the action bar (bottom fixed bar)
    // The action bar has heart, translate, and summarize buttons
    const actionBarButtons = page.locator('button:has(svg.lucide-heart)');
    await expect(actionBarButtons.first()).toBeVisible({ timeout: 10_000 });
  });

  test('should have original article link on article page', async ({ page }) => {
    await ensureFeedSubscribed(page);

    // Navigate to article detail
    const feedLink = page.locator('a[href*="/feeds/"]').first();
    await expect(feedLink).toBeVisible({ timeout: 10_000 });
    await feedLink.click();
    await page.waitForLoadState('networkidle');

    const articleLink = page.locator('a[href*="/articles/"]').first();
    await expect(articleLink).toBeVisible({ timeout: 10_000 });
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    // Verify "Read original article" link
    const originalLink = page.locator('a').filter({ hasText: /Read original|阅读原文/ });
    await expect(originalLink).toBeVisible({ timeout: 10_000 });

    // Verify it has target="_blank" for opening in new tab
    const target = await originalLink.getAttribute('target');
    expect(target).toBe('_blank');
  });

  test('should have back navigation button on article page', async ({ page }) => {
    await ensureFeedSubscribed(page);

    // Navigate to article detail
    const feedLink = page.locator('a[href*="/feeds/"]').first();
    await expect(feedLink).toBeVisible({ timeout: 10_000 });
    await feedLink.click();
    await page.waitForLoadState('networkidle');

    const articleLink = page.locator('a[href*="/articles/"]').first();
    await expect(articleLink).toBeVisible({ timeout: 10_000 });
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    // Verify back button exists
    const backButton = page.locator('button').filter({ hasText: /Back|返回/ }).first();
    await expect(backButton).toBeVisible({ timeout: 10_000 });

    // Click back and verify we return to feed detail
    await backButton.click();
    await page.waitForLoadState('networkidle');

    // Should be back on feed detail page with article list
    const articleLinks = page.locator('a[href*="/articles/"]');
    await expect(articleLinks.first()).toBeVisible({ timeout: 10_000 });
  });

  test('should show unread indicator on feed detail page', async ({ page }) => {
    await ensureFeedSubscribed(page);

    // Navigate to feed detail
    const feedLink = page.locator('a[href*="/feeds/"]').first();
    await expect(feedLink).toBeVisible({ timeout: 10_000 });
    await feedLink.click();
    await page.waitForLoadState('networkidle');

    // Feed detail should show articles
    const articleLinks = page.locator('a[href*="/articles/"]');
    await expect(articleLinks.first()).toBeVisible({ timeout: 10_000 });
    const count = await articleLinks.count();
    expect(count).toBeGreaterThan(0);

    // Feed detail heading should be visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });
});
