/**
 * E2E Test: Feed Management Page
 *
 * Tests the feed management functionality on the live site:
 * US-07: View, edit, and delete subscriptions
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

test.describe('Feed Management', () => {
  test('should load feed management page', async ({ page }) => {
    await page.goto('/#/feed-management');
    await page.waitForLoadState('networkidle');

    // Verify page heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const headingText = await heading.textContent();
    expect(headingText).toMatch(/Manage|管理/);
  });

  test('should display subscribed feeds in management page', async ({ page }) => {
    await ensureFeedSubscribed(page);

    // Navigate to feed management
    await page.goto('/#/feed-management');
    await page.waitForLoadState('networkidle');

    // Should show the feed in the management list
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Feed items should be visible with edit/delete buttons
    const feedItems = page.locator('[class*="rounded-lg"][class*="border"][class*="bg-card"]');
    await expect(feedItems.first()).toBeVisible({ timeout: 10_000 });
  });

  test('should have edit and delete buttons for each feed', async ({ page }) => {
    await ensureFeedSubscribed(page);

    await page.goto('/#/feed-management');
    await page.waitForLoadState('networkidle');

    // Verify edit button exists (Pencil icon with "Edit" title)
    const editButton = page.locator('button[title="Edit"]');
    await expect(editButton.first()).toBeVisible({ timeout: 10_000 });

    // Verify delete button exists (Trash icon with "Delete" title)
    const deleteButton = page.locator('button[title="Delete"]');
    await expect(deleteButton.first()).toBeVisible({ timeout: 10_000 });
  });

  test('should enter edit mode and cancel', async ({ page }) => {
    await ensureFeedSubscribed(page);

    await page.goto('/#/feed-management');
    await page.waitForLoadState('networkidle');

    // Click edit button
    const editButton = page.locator('button[title="Edit"]').first();
    await expect(editButton).toBeVisible({ timeout: 10_000 });
    await editButton.click();

    // Should show edit form with input fields
    const titleInput = page.locator('input[placeholder="Feed title"]');
    await expect(titleInput).toBeVisible({ timeout: 5_000 });

    const urlInput = page.locator('input[placeholder="Feed URL"]');
    await expect(urlInput).toBeVisible({ timeout: 5_000 });

    // Should show Save and Cancel buttons
    const saveButton = page.locator('button').filter({ hasText: /Save|保存/ });
    await expect(saveButton).toBeVisible({ timeout: 5_000 });

    const cancelButton = page.locator('button').filter({ hasText: /Cancel|取消/ });
    await expect(cancelButton).toBeVisible({ timeout: 5_000 });

    // Click cancel
    await cancelButton.click();

    // Should exit edit mode - edit/delete buttons should be visible again
    await expect(editButton).toBeVisible({ timeout: 5_000 });
  });

  test('should have add feed button on management page', async ({ page }) => {
    await page.goto('/#/feed-management');
    await page.waitForLoadState('networkidle');

    // Should have an "Add Feed" button
    const addButton = page.locator('button').filter({ hasText: /Add Feed|添加/ });
    await expect(addButton.first()).toBeVisible({ timeout: 10_000 });
  });
});
