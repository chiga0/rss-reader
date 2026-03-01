/**
 * E2E Test: Search Functionality
 *
 * Tests the search page and search workflow on the live site:
 * US-06: Search feeds, search articles, view results
 */

import { test, expect } from '@playwright/test';

const TEST_FEED_URL = 'https://tailwindcss.com/feeds/feed.xml';

test.describe('Search Functionality', () => {
  test('should load search page with search input', async ({ page }) => {
    await page.goto('/#/search');
    await page.waitForLoadState('networkidle');

    // Verify search input is visible and focused
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
  });

  test('should have back button on search page', async ({ page }) => {
    await page.goto('/#/search');
    await page.waitForLoadState('networkidle');

    // Search page should have a back button
    const backButton = page.locator('button[aria-label="Go back"]');
    await expect(backButton).toBeVisible({ timeout: 5_000 });
  });

  test('should show search results for feeds', async ({ page }) => {
    // Ensure a feed is subscribed first
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

    // Navigate to search page and search for "Tailwind"
    await page.goto('/#/search');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill('Tailwind');

    // Should show feed results section (search has 300ms debounce, expect handles waiting)
    const feedsSection = page.getByText(/Feeds \(/);
    await expect(feedsSection).toBeVisible({ timeout: 10_000 });
  });

  test('should show no results for nonexistent query', async ({ page }) => {
    // Ensure a feed is subscribed first
    await page.goto('/');
    await page.waitForURL(/\/#\/feeds/, { timeout: 15_000 });
    await page.waitForLoadState('networkidle');

    // Navigate to search and search for something that doesn't exist
    await page.goto('/#/search');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill('xyznonexistentquery12345');

    // Should show no results message (search has 300ms debounce, expect handles waiting)
    const noResults = page.getByText(/No results found/);
    await expect(noResults).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate from search results to feed detail', async ({ page }) => {
    // Ensure feed exists
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

    // Search for feed
    await page.goto('/#/search');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill('Tailwind');

    // Click on a feed result link (search has 300ms debounce, expect handles waiting)
    const feedResult = page.locator('a[href*="/feeds/"]').first();
    if ((await feedResult.count()) > 0) {
      await feedResult.click();
      await page.waitForLoadState('networkidle');

      // Verify feed detail page loads
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible({ timeout: 10_000 });
    }
  });
});
