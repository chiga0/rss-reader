/**
 * E2E Test: RSS Feed Subscription and Browsing Verification
 *
 * Verifies the complete flow:
 * 1. Adding a valid RSS feed subscription
 * 2. Feed appears in the feed list with articles
 * 3. Navigating to feed detail shows article list
 * 4. Clicking an article shows its content
 *
 * Uses Playwright route interception to mock the CORS proxy,
 * ensuring reliable tests without external network dependencies.
 */

import { test, expect, type Page } from '@playwright/test';

// Sample RSS 2.0 feed XML for mocking
const MOCK_RSS_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tech Blog</title>
    <link>https://techblog.example.com</link>
    <description>A technology blog with latest updates</description>
    <language>en-us</language>
    <lastBuildDate>Mon, 24 Feb 2026 12:00:00 GMT</lastBuildDate>
    <item>
      <title>Understanding WebAssembly</title>
      <link>https://techblog.example.com/webassembly</link>
      <description>WebAssembly is a binary instruction format for a stack-based virtual machine.</description>
      <author>alice@example.com (Alice Chen)</author>
      <pubDate>Mon, 24 Feb 2026 10:00:00 GMT</pubDate>
      <guid>https://techblog.example.com/webassembly</guid>
    </item>
    <item>
      <title>Getting Started with Rust</title>
      <link>https://techblog.example.com/rust-intro</link>
      <description>Rust is a systems programming language focused on safety and performance.</description>
      <author>bob@example.com (Bob Smith)</author>
      <pubDate>Sun, 23 Feb 2026 15:30:00 GMT</pubDate>
      <guid>https://techblog.example.com/rust-intro</guid>
    </item>
    <item>
      <title>Modern CSS Techniques</title>
      <link>https://techblog.example.com/modern-css</link>
      <description>Explore the latest CSS features including container queries and cascade layers.</description>
      <pubDate>Sat, 22 Feb 2026 08:00:00 GMT</pubDate>
      <guid>https://techblog.example.com/modern-css</guid>
    </item>
  </channel>
</rss>`;

const FEED_URL = 'https://techblog.example.com/feed.xml';

/**
 * Set up route interception to mock the CORS proxy responses.
 * The app in dev mode fetches via: https://api.allorigins.win/get?url=<encoded_url>
 */
async function mockCorsProxy(page: Page) {
  await page.route('**/api.allorigins.win/get**', async (route) => {
    const url = new URL(route.request().url());
    const targetUrl = url.searchParams.get('url');

    if (targetUrl && targetUrl.includes('techblog.example.com')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          contents: MOCK_RSS_FEED,
          status: {
            url: targetUrl,
            content_type: 'application/rss+xml',
            http_code: 200,
          },
        }),
      });
    } else {
      // Let other requests pass through or return error
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not found' }),
      });
    }
  });
}

test.describe('RSS Feed Subscription and Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the CORS proxy before navigating
    await mockCorsProxy(page);

    // Navigate to the app
    await page.goto('/');
    // Wait for the app to initialize (hash router redirects / -> #/feeds)
    await page.waitForSelector('h1:has-text("Feeds")', { timeout: 15000 });
  });

  test('should add a valid RSS feed and display it in the feed list', async ({ page }) => {
    // Step 1: Click the "Add Feed" button
    await page.click('button:has-text("Add Feed")');

    // Step 2: Verify the Add Feed dialog opens
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
    await expect(dialog.locator('h2')).toContainText('Add RSS Feed');

    // Step 3: Enter the feed URL
    const urlInput = dialog.locator('input#feed-url');
    await expect(urlInput).toBeVisible();
    await urlInput.fill(FEED_URL);

    // Step 4: Submit the form by clicking "Add Feed"
    await dialog.locator('button[type="submit"]').click();

    // Step 5: Wait for the dialog to close (indicates success)
    await expect(dialog).not.toBeVisible({ timeout: 15000 });

    // Step 6: Verify the feed appears in the feed list
    const feedLink = page.locator('a[href*="/feeds/"]').filter({ hasText: 'Tech Blog' });
    await expect(feedLink).toBeVisible({ timeout: 5000 });

    // Step 7: Verify article count is shown
    await expect(feedLink).toContainText('articles');
  });

  test('should navigate to feed detail and show article list', async ({ page }) => {
    // First, add the feed
    await page.click('button:has-text("Add Feed")');
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#feed-url').fill(FEED_URL);
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).not.toBeVisible({ timeout: 15000 });

    // Wait for the feed to appear
    const feedLink = page.locator('a[href*="/feeds/"]').filter({ hasText: 'Tech Blog' });
    await expect(feedLink).toBeVisible({ timeout: 5000 });

    // Click on the feed to navigate to the detail page
    await feedLink.click();

    // Verify we're on the feed detail page
    await expect(page.locator('h1')).toContainText('Tech Blog', { timeout: 5000 });

    // Verify the "Back to Feeds" button is visible
    await expect(page.locator('button:has-text("Back to Feeds")')).toBeVisible();

    // Verify articles are listed
    const articleLinks = page.locator('a[href*="/articles/"]');
    const articleCount = await articleLinks.count();
    expect(articleCount).toBe(3); // Our mock feed has 3 articles

    // Verify specific article titles are visible
    await expect(page.getByText('Understanding WebAssembly')).toBeVisible();
    await expect(page.getByText('Getting Started with Rust')).toBeVisible();
    await expect(page.getByText('Modern CSS Techniques')).toBeVisible();
  });

  test('should open an article and display its content', async ({ page }) => {
    // Add the feed
    await page.click('button:has-text("Add Feed")');
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#feed-url').fill(FEED_URL);
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).not.toBeVisible({ timeout: 15000 });

    // Navigate to the feed detail
    const feedLink = page.locator('a[href*="/feeds/"]').filter({ hasText: 'Tech Blog' });
    await feedLink.click();
    await expect(page.locator('h1')).toContainText('Tech Blog', { timeout: 5000 });

    // Click on the first article
    const firstArticle = page.locator('a[href*="/articles/"]').first();
    await firstArticle.click();

    // Verify we're on the article detail page
    await expect(page.locator('h1')).toContainText('Understanding WebAssembly', { timeout: 5000 });

    // Verify article metadata
    await expect(page.getByText('Tech Blog')).toBeVisible(); // Feed title shown above article
    await expect(page.getByText(/alice/i)).toBeVisible(); // Author

    // Verify article content/description is rendered
    await expect(page.getByText(/binary instruction format/i)).toBeVisible();

    // Verify the "Read original article" link is present
    const originalLink = page.locator('a:has-text("Read original article")');
    await expect(originalLink).toBeVisible();
    await expect(originalLink).toHaveAttribute('href', 'https://techblog.example.com/webassembly');
    await expect(originalLink).toHaveAttribute('target', '_blank');

    // Verify the "Back" button exists
    await expect(page.locator('button:has-text("Back")')).toBeVisible();

    // Verify the "Favorite" button exists
    await expect(page.locator('button:has-text("Favorite")')).toBeVisible();
  });

  test('should mark article as read when opened', async ({ page }) => {
    // Add the feed
    await page.click('button:has-text("Add Feed")');
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#feed-url').fill(FEED_URL);
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).not.toBeVisible({ timeout: 15000 });

    // Navigate to the feed detail
    const feedLink = page.locator('a[href*="/feeds/"]').filter({ hasText: 'Tech Blog' });
    await feedLink.click();
    await expect(page.locator('h1')).toContainText('Tech Blog', { timeout: 5000 });

    // Verify unread indicators exist (dot indicators for unread articles)
    const unreadDots = page.locator('.rounded-full.bg-primary');
    const initialUnread = await unreadDots.count();
    expect(initialUnread).toBeGreaterThan(0);

    // Click on the first article (this triggers mark-as-read via the loader)
    await page.locator('a[href*="/articles/"]').first().click();
    await expect(page.locator('h1')).toContainText('Understanding WebAssembly', { timeout: 5000 });

    // Verify "✓ Read" marker is displayed
    await expect(page.getByText('✓ Read')).toBeVisible();

    // Navigate back
    await page.locator('button:has-text("Back")').click();

    // The article we just read should no longer have an unread dot
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('Tech Blog', { timeout: 5000 });
  });

  test('should show article count and unread count on feeds page', async ({ page }) => {
    // Add the feed
    await page.click('button:has-text("Add Feed")');
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#feed-url').fill(FEED_URL);
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).not.toBeVisible({ timeout: 15000 });

    // Verify the feed card shows article count
    const feedLink = page.locator('a[href*="/feeds/"]').filter({ hasText: 'Tech Blog' });
    await expect(feedLink).toBeVisible({ timeout: 5000 });

    // Should show "3 articles" (our mock feed has 3 items)
    await expect(feedLink).toContainText('3 articles', { timeout: 5000 });

    // Should show unread badge (3 unread)
    const unreadBadge = feedLink.locator('span.rounded-full');
    await expect(unreadBadge).toContainText('3', { timeout: 5000 });
  });

  test('should navigate back from article to feed detail to feeds list', async ({ page }) => {
    // Add the feed
    await page.click('button:has-text("Add Feed")');
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#feed-url').fill(FEED_URL);
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).not.toBeVisible({ timeout: 15000 });

    // Navigate: Feeds → Feed Detail
    const feedLink = page.locator('a[href*="/feeds/"]').filter({ hasText: 'Tech Blog' });
    await feedLink.click();
    await expect(page.locator('h1')).toContainText('Tech Blog', { timeout: 5000 });

    // Navigate: Feed Detail → Article
    await page.locator('a[href*="/articles/"]').first().click();
    await expect(page.locator('h1')).toContainText('Understanding WebAssembly', { timeout: 5000 });

    // Navigate back: Article → Feed Detail
    await page.locator('button:has-text("Back")').click();
    await expect(page.locator('h1')).toContainText('Tech Blog', { timeout: 5000 });

    // Navigate back: Feed Detail → Feeds List
    await page.locator('button:has-text("Back to Feeds")').click();
    await expect(page.locator('h1')).toContainText('Feeds', { timeout: 5000 });

    // Feed should still be listed
    await expect(page.locator('a[href*="/feeds/"]').filter({ hasText: 'Tech Blog' })).toBeVisible();
  });
});
