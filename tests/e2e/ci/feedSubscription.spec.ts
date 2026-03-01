/**
 * E2E Test: RSS Feed Subscription
 *
 * Tests the complete feed subscription workflow on the live site:
 * 1. Open Add Feed dialog
 * 2. Enter RSS feed URL (https://tailwindcss.com/feeds/feed.xml)
 * 3. Subscribe to the feed
 * 4. Verify feed appears in the list with articles
 * 5. Navigate to feed detail and verify articles
 * 6. Open an article and verify content
 * 7. Clean up by unsubscribing
 */

import { test, expect } from '@playwright/test';

const TEST_FEED_URL = 'https://tailwindcss.com/feeds/feed.xml';

test.describe('RSS Feed Subscription', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/#\/feeds/, { timeout: 15_000 });
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should open and close the Add Feed dialog', async ({ page }) => {
    // Find and click the Add Feed button (supports en/zh)
    const addButton = page.locator('button').filter({ hasText: /Add Feed|添加订阅/ });
    // If no text button, try the FAB (floating action button with + icon)
    const fabButton = page.locator('button.fixed, button[class*="fixed"]').last();
    const targetButton = (await addButton.count()) > 0 ? addButton.first() : fabButton;

    await targetButton.click();

    // Verify dialog opens
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Verify the URL input field exists
    const urlInput = dialog.locator('input#feed-url');
    await expect(urlInput).toBeVisible();

    // Close dialog
    const cancelButton = dialog.locator('button').filter({ hasText: /Cancel|取消/ });
    await cancelButton.click();
    await expect(dialog).not.toBeVisible({ timeout: 3_000 });
  });

  test('should subscribe to Tailwind CSS feed and verify articles', async ({ page }) => {
    // Step 1: Click Add Feed button
    const addButton = page.locator('button').filter({ hasText: /Add Feed|添加订阅/ });
    const fabButton = page.locator('button.fixed, button[class*="fixed"]').last();
    const targetButton = (await addButton.count()) > 0 ? addButton.first() : fabButton;
    await targetButton.click();

    // Step 2: Fill in feed URL
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    const urlInput = dialog.locator('input#feed-url');
    await urlInput.fill(TEST_FEED_URL);

    // Step 3: Submit the form
    const submitButton = dialog.locator('button[type="submit"]');
    await submitButton.click();

    // Step 4: Wait for dialog to close (indicates success)
    await expect(dialog).not.toBeVisible({ timeout: 30_000 });

    // Step 5: Verify feed appears in the feed list
    // Look for the Tailwind CSS feed card
    const feedLink = page.locator('a[href*="/feeds/"]').filter({ hasText: /Tailwind/i });
    await expect(feedLink).toBeVisible({ timeout: 10_000 });

    // Step 6: Verify article count is shown
    const feedText = await feedLink.textContent();
    expect(feedText).toMatch(/articles|篇文章/);

    // Step 7: Navigate to feed detail
    await feedLink.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the feed detail page
    const detailHeading = page.locator('h1').first();
    await expect(detailHeading).toBeVisible({ timeout: 10_000 });

    // Verify articles are listed
    const articleLinks = page.locator('a[href*="/articles/"]');
    const articleCount = await articleLinks.count();
    expect(articleCount).toBeGreaterThan(0);

    // Step 8: Click the first article
    await articleLinks.first().click();
    await page.waitForLoadState('networkidle');

    // Verify article content page loads
    const articleTitle = page.locator('h1').first();
    await expect(articleTitle).toBeVisible({ timeout: 10_000 });
    const titleText = await articleTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText!.length).toBeGreaterThan(0);

    // Step 9: Verify "Read original article" link exists
    const originalLink = page.locator('a').filter({ hasText: /Read original|阅读原文/ });
    await expect(originalLink).toBeVisible({ timeout: 5_000 });
  });

  test('should show error for invalid feed URL', async ({ page }) => {
    // Open Add Feed dialog
    const addButton = page.locator('button').filter({ hasText: /Add Feed|添加订阅/ });
    const fabButton = page.locator('button.fixed, button[class*="fixed"]').last();
    const targetButton = (await addButton.count()) > 0 ? addButton.first() : fabButton;
    await targetButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Enter invalid URL
    const urlInput = dialog.locator('input#feed-url');
    await urlInput.fill('not-a-valid-url');

    // Submit
    const submitButton = dialog.locator('button[type="submit"]');
    await submitButton.click();

    // Should show an error message
    const errorText = dialog.locator('[class*="destructive"], [class*="error"], [role="alert"]');
    await expect(errorText).toBeVisible({ timeout: 5_000 });
  });

  test('should navigate back from article to feed detail to feeds list', async ({ page }) => {
    // First subscribe to the feed
    const addButton = page.locator('button').filter({ hasText: /Add Feed|添加订阅/ });
    const fabButton = page.locator('button.fixed, button[class*="fixed"]').last();
    const targetButton = (await addButton.count()) > 0 ? addButton.first() : fabButton;
    await targetButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.locator('input#feed-url').fill(TEST_FEED_URL);
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).not.toBeVisible({ timeout: 30_000 });

    // Navigate to feed detail
    const feedLink = page.locator('a[href*="/feeds/"]').filter({ hasText: /Tailwind/i });
    await expect(feedLink).toBeVisible({ timeout: 10_000 });
    await feedLink.click();

    // Verify feed detail page
    await page.waitForLoadState('networkidle');
    const feedHeading = page.locator('h1').first();
    await expect(feedHeading).toBeVisible({ timeout: 10_000 });

    // Click on the first article
    const articleLinks = page.locator('a[href*="/articles/"]');
    await expect(articleLinks.first()).toBeVisible({ timeout: 10_000 });
    await articleLinks.first().click();

    // Verify article page
    await page.waitForLoadState('networkidle');
    const articleTitle = page.locator('h1').first();
    await expect(articleTitle).toBeVisible({ timeout: 10_000 });

    // Navigate back to feed detail
    const backButton = page.locator('button').filter({ hasText: /Back|返回/ }).first();
    await backButton.click();
    await page.waitForLoadState('networkidle');

    // Verify we're back at feed detail
    await expect(page.locator('a[href*="/articles/"]').first()).toBeVisible({ timeout: 10_000 });

    // Navigate back to feeds list
    const backToFeedsButton = page.locator('button').filter({ hasText: /Back to Feeds|返回订阅列表/ }).first();
    await backToFeedsButton.click();
    await page.waitForLoadState('networkidle');

    // Verify we're back at feeds list
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible({ timeout: 10_000 });
    const text = await mainHeading.textContent();
    expect(text).toMatch(/Feeds|订阅源/);
  });

  test('should handle duplicate feed subscription', async ({ page }) => {
    // Subscribe to the feed
    const addButton = page.locator('button').filter({ hasText: /Add Feed|添加订阅/ });
    const fabButton = page.locator('button.fixed, button[class*="fixed"]').last();
    const targetButton = (await addButton.count()) > 0 ? addButton.first() : fabButton;

    await targetButton.click();
    let dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.locator('input#feed-url').fill(TEST_FEED_URL);
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).not.toBeVisible({ timeout: 30_000 });

    // Wait for feed to appear
    const feedLink = page.locator('a[href*="/feeds/"]').filter({ hasText: /Tailwind/i });
    await expect(feedLink).toBeVisible({ timeout: 10_000 });

    // Try to add the same feed again
    const addButton2 = page.locator('button').filter({ hasText: /Add Feed|添加订阅/ });
    const targetButton2 = (await addButton2.count()) > 0 ? addButton2.first() : fabButton;
    await targetButton2.click();

    dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await dialog.locator('input#feed-url').fill(TEST_FEED_URL);
    await dialog.locator('button[type="submit"]').click();

    // Should show an error about duplicate
    const errorText = dialog.locator('[class*="destructive"], [class*="error"], [role="alert"]');
    await expect(errorText).toBeVisible({ timeout: 15_000 });
  });
});
