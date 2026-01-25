/**
 * E2E Test: Add Feed and Read Article Journey
 * Tests complete user workflow from adding a feed to reading an article
 */

import { test, expect } from '@playwright/test';

test.describe('Add Feed and Read Article Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173');
    
    // Wait for app to initialize
    await page.waitForSelector('text=My Feeds', { timeout: 10000 });
  });

  test('should complete full journey: add feed → view articles → read content', async ({ page }) => {
    // Step 1: Click Add Feed button
    await page.click('button:has-text("Add Feed")');
    
    // Step 2: Fill in feed URL
    const feedUrl = 'https://hnrss.org/frontpage';
    await page.fill('input[placeholder*="RSS"]', feedUrl);
    
    // Step 3: Submit form
    await page.click('button:has-text("Subscribe")');
    
    // Step 4: Wait for feed to be added (look for success message or feed card)
    await page.waitForSelector('article', { timeout: 15000 });
    
    // Step 5: Verify feed appears in list
    const feedCard = page.locator('article').first();
    await expect(feedCard).toBeVisible();
    
    // Step 6: Click on feed to view articles
    await feedCard.click();
    
    // Step 7: Wait for articles to load
    await page.waitForSelector('[data-testid="article-item"], article', { timeout: 10000 });
    
    // Step 8: Verify articles are displayed
    const articleCount = await page.locator('[data-testid="article-item"], article').count();
    expect(articleCount).toBeGreaterThan(0);
    
    // Step 9: Click first article to read
    await page.locator('[data-testid="article-item"], article').first().click();
    
    // Step 10: Verify article content is displayed
    await page.waitForSelector('[data-testid="article-content"], .article-content', { timeout: 5000 });
    const articleContent = page.locator('[data-testid="article-content"], .article-content').first();
    await expect(articleContent).toBeVisible();
    
    // Step 11: Verify article has title
    const articleTitle = page.locator('h1, h2').first();
    await expect(articleTitle).toBeVisible();
    const titleText = await articleTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText?.length).toBeGreaterThan(0);
  });

  test('should show error for invalid feed URL', async ({ page }) => {
    // Click Add Feed button
    await page.click('button:has-text("Add Feed")');
    
    // Fill in invalid URL
    await page.fill('input[placeholder*="RSS"]', 'not-a-valid-url');
    
    // Submit form
    await page.click('button:has-text("Subscribe")');
    
    // Verify error message appears
    await page.waitForSelector('text=/invalid|error/i', { timeout: 5000 });
    const errorMessage = page.locator('text=/invalid|error/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should prevent duplicate feeds', async ({ page }) => {
    const feedUrl = 'https://hnrss.org/frontpage';
    
    // Add feed first time
    await page.click('button:has-text("Add Feed")');
    await page.fill('input[placeholder*="RSS"]', feedUrl);
    await page.click('button:has-text("Subscribe")');
    await page.waitForSelector('article', { timeout: 15000 });
    
    // Try to add same feed again
    await page.click('button:has-text("Add Feed")');
    await page.fill('input[placeholder*="RSS"]', feedUrl);
    await page.click('button:has-text("Subscribe")');
    
    // Verify duplicate error message
    await page.waitForSelector('text=/already|duplicate/i', { timeout: 5000 });
    const errorMessage = page.locator('text=/already|duplicate/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should navigate back and forth between views', async ({ page }) => {
    // Assume a feed already exists or add one
    await page.click('button:has-text("Add Feed")');
    await page.fill('input[placeholder*="RSS"]', 'https://hnrss.org/frontpage');
    await page.click('button:has-text("Subscribe")');
    await page.waitForSelector('article', { timeout: 15000 });
    
    // Click feed
    await page.locator('article').first().click();
    await page.waitForSelector('[data-testid="article-item"], article', { timeout: 10000 });
    
    // Click article
    await page.locator('[data-testid="article-item"], article').first().click();
    await page.waitForSelector('[data-testid="article-content"], .article-content', { timeout: 5000 });
    
    // Navigate back (depends on implementation - button or browser back)
    // If there's a back button in UI, click it
    const backButton = page.locator('button[aria-label="Back"], button:has-text("Back")');
    if (await backButton.isVisible()) {
      await backButton.click();
    }
    
    // Verify back at article list
    await page.waitForSelector('[data-testid="article-item"], article', { timeout: 5000 });
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    
    // Verify app loads
    await page.waitForSelector('text=My Feeds', { timeout: 10000 });
    
    // Verify Add Feed button is visible and clickable
    const addButton = page.locator('button:has-text("Add Feed")');
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Verify dialog opens
    await page.waitForSelector('input[placeholder*="RSS"]', { timeout: 5000 });
  });

  test('should work on tablet viewport (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:5173');
    
    // Verify app loads
    await page.waitForSelector('text=My Feeds', { timeout: 10000 });
    
    // Verify layout adapts to tablet size
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('should work on desktop viewport (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('http://localhost:5173');
    
    // Verify app loads
    await page.waitForSelector('text=My Feeds', { timeout: 10000 });
    
    // Verify desktop layout
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });
});
