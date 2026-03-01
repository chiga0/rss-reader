/**
 * E2E Test: AI Features (Translation & Summarization)
 *
 * Tests AI feature UI elements on the live site:
 * US-17: AI Translation button and action bar
 * US-18: AI Summarization button and action bar
 *
 * Note: Full AI workflow tests (streaming, error handling, timeout) depend on
 * the /api/chat backend and are best covered in integration tests with mock API.
 * These E2E tests verify UI button visibility and action bar layout.
 */

import { test, expect } from '@playwright/test';

const TEST_FEED_URL = 'https://tailwindcss.com/feeds/feed.xml';

/**
 * Helper to navigate to an article detail page, ensuring a feed is subscribed.
 */
async function navigateToArticleDetail(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForURL(/\/#\/feeds/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');

  // Subscribe to feed if none exists
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

  // Navigate to feed → article
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
}

test.describe('AI Features - Translation & Summarization', () => {
  test('should display action bar with translate and summarize buttons', async ({ page }) => {
    await navigateToArticleDetail(page);

    // The action bar should be a fixed bottom bar
    const actionBar = page.locator('.fixed.bottom-0');
    await expect(actionBar).toBeVisible({ timeout: 5_000 });

    // Should have 3 buttons: Favorite, Translate, AI Summary
    const buttons = actionBar.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(3);
  });

  test('should display translate button with correct label', async ({ page }) => {
    await navigateToArticleDetail(page);

    // Look for translate button with "翻译" text
    const translateButton = page.locator('button').filter({ hasText: '翻译' });
    await expect(translateButton).toBeVisible({ timeout: 5_000 });

    // Button should have the Languages icon (svg.lucide-languages)
    const translateIcon = translateButton.locator('svg.lucide-languages');
    await expect(translateIcon).toBeVisible({ timeout: 5_000 });
  });

  test('should display AI summarize button with correct label', async ({ page }) => {
    await navigateToArticleDetail(page);

    // Look for AI summary button with "AI 总结" text
    const summarizeButton = page.locator('button').filter({ hasText: 'AI 总结' });
    await expect(summarizeButton).toBeVisible({ timeout: 5_000 });

    // Button should have the Sparkles icon (svg.lucide-sparkles)
    const sparklesIcon = summarizeButton.locator('svg.lucide-sparkles');
    await expect(sparklesIcon).toBeVisible({ timeout: 5_000 });
  });

  test('should display favorite button in action bar', async ({ page }) => {
    await navigateToArticleDetail(page);

    // Look for favorite button with heart icon
    const favoriteButton = page.locator('button').filter({ hasText: /Favorite|收藏|Favorited|已收藏|favorite|favorited/ });
    await expect(favoriteButton).toBeVisible({ timeout: 5_000 });

    // Button should have the Heart icon
    const heartIcon = favoriteButton.locator('svg.lucide-heart');
    await expect(heartIcon).toBeVisible({ timeout: 5_000 });
  });

  test('should have all three action bar buttons clickable', async ({ page }) => {
    await navigateToArticleDetail(page);

    // Verify translate button is clickable (not disabled)
    const translateButton = page.locator('button').filter({ hasText: '翻译' });
    await expect(translateButton).toBeVisible({ timeout: 5_000 });
    await expect(translateButton).toBeEnabled();

    // Verify AI summary button is clickable (not disabled)
    const summarizeButton = page.locator('button').filter({ hasText: 'AI 总结' });
    await expect(summarizeButton).toBeVisible({ timeout: 5_000 });
    await expect(summarizeButton).toBeEnabled();

    // Verify favorite button is clickable (not disabled)
    const favoriteButton = page.locator('button').filter({ hasText: /Favorite|收藏|Favorited|已收藏|favorite|favorited/ });
    await expect(favoriteButton).toBeVisible({ timeout: 5_000 });
    await expect(favoriteButton).toBeEnabled();
  });
});
