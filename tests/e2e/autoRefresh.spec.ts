/**
 * E2E Test: Feed Auto-Refresh Workflow
 * Tests automatic feed refresh functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Feed Auto-Refresh', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173');
    await page.waitForSelector('text=My Feeds', { timeout: 10000 });
  });

  test('should manually refresh all feeds', async ({ page }) => {
    // Add a feed first
    await page.click('button:has-text("Add Feed")');
    await page.fill('input[placeholder*="RSS"]', 'https://hnrss.org/frontpage');
    await page.click('button:has-text("Subscribe")');
    await page.waitForSelector('article', { timeout: 15000 });
    
    // Find and click refresh button
    const refreshButton = page.locator('button:has-text("刷新"), button[title*="刷新"]');
    await expect(refreshButton).toBeVisible();
    
    // Click refresh
    await refreshButton.click();
    
    // Verify loading state appears
    await page.waitForSelector('button:has-text("刷新中"), .animate-spin', { timeout: 2000 });
    
    // Wait for refresh to complete
    await page.waitForSelector('button:has-text("刷新")', { timeout: 10000 });
    
    // Verify refresh button is clickable again
    await expect(refreshButton).toBeEnabled();
  });

  test('should configure auto-refresh interval in settings', async ({ page }) => {
    // Navigate to settings
    const settingsButton = page.locator('button:has-text("设置"), a:has-text("Settings")');
    await settingsButton.click();
    
    // Wait for settings page to load
    await page.waitForSelector('text=/刷新设置|Refresh/i', { timeout: 5000 });
    
    // Find refresh interval selector
    const intervalSelector = page.locator('select#refresh-interval, select[id*="interval"]');
    await expect(intervalSelector).toBeVisible();
    
    // Change interval to 30 minutes
    await intervalSelector.selectOption('30');
    
    // Verify save indicator appears
    await page.waitForSelector('text=/保存|saved/i', { timeout: 5000 });
    
    // Verify interval is saved
    const selectedValue = await intervalSelector.inputValue();
    expect(selectedValue).toBe('30');
  });

  test('should display last refresh timestamp on feed cards', async ({ page }) => {
    // Add a feed
    await page.click('button:has-text("Add Feed")');
    await page.fill('input[placeholder*="RSS"]', 'https://hnrss.org/frontpage');
    await page.click('button:has-text("Subscribe")');
    await page.waitForSelector('article', { timeout: 15000 });
    
    // Check for timestamp on feed card
    const feedCard = page.locator('article').first();
    const timestamp = feedCard.locator('text=/ago|updated|刷新/i');
    
    // Timestamp should exist (might be "just now" or relative time)
    await expect(timestamp).toBeVisible({ timeout: 5000 });
  });

  test('should show refresh progress for multiple feeds', async ({ page }) => {
    // Add multiple feeds
    const feeds = [
      'https://hnrss.org/frontpage',
      'https://hnrss.org/newest',
    ];
    
    for (const feedUrl of feeds) {
      await page.click('button:has-text("Add Feed")');
      await page.fill('input[placeholder*="RSS"]', feedUrl);
      await page.click('button:has-text("Subscribe")');
      await page.waitForSelector('article', { timeout: 15000 });
      
      // Close dialog if still open
      const closeButton = page.locator('button[aria-label="Close"], button:has-text("✕")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
    
    // Trigger manual refresh
    const refreshButton = page.locator('button:has-text("刷新"), button[title*="刷新"]');
    await refreshButton.click();
    
    // Verify loading state
    await page.waitForSelector('button:has-text("刷新中"), .animate-spin', { timeout: 2000 });
    
    // Wait for refresh to complete
    await page.waitForSelector('button:has-text("刷新")', { timeout: 20000 });
  });

  test('should toggle background sync in settings', async ({ page }) => {
    // Navigate to settings
    const settingsButton = page.locator('button:has-text("设置"), a:has-text("Settings")');
    await settingsButton.click();
    
    // Wait for settings page
    await page.waitForSelector('text=/后台同步|Background/i', { timeout: 5000 });
    
    // Find background sync toggle
    const syncToggle = page.locator('input[type="checkbox"]:near(:text("后台同步"))');
    await expect(syncToggle).toBeVisible();
    
    // Get initial state
    const initialState = await syncToggle.isChecked();
    
    // Toggle it
    await syncToggle.click();
    
    // Wait for save
    await page.waitForSelector('text=/保存|saved/i', { timeout: 5000 });
    
    // Verify state changed
    const newState = await syncToggle.isChecked();
    expect(newState).toBe(!initialState);
    
    // Toggle back
    await syncToggle.click();
    await page.waitForSelector('text=/保存|saved/i', { timeout: 5000 });
    
    // Verify reverted
    const finalState = await syncToggle.isChecked();
    expect(finalState).toBe(initialState);
  });

  test('should persist refresh settings across page reloads', async ({ page }) => {
    // Navigate to settings
    const settingsButton = page.locator('button:has-text("设置"), a:has-text("Settings")');
    await settingsButton.click();
    
    // Change interval
    const intervalSelector = page.locator('select#refresh-interval, select[id*="interval"]');
    await intervalSelector.selectOption('120'); // 2 hours
    await page.waitForSelector('text=/保存|saved/i', { timeout: 5000 });
    
    // Reload page
    await page.reload();
    await page.waitForSelector('text=My Feeds', { timeout: 10000 });
    
    // Go back to settings
    await page.locator('button:has-text("设置"), a:has-text("Settings")').click();
    
    // Verify setting persisted
    const persistedValue = await page.locator('select#refresh-interval, select[id*="interval"]').inputValue();
    expect(persistedValue).toBe('120');
  });

  test('should handle refresh errors gracefully', async ({ page }) => {
    // Add a feed
    await page.click('button:has-text("Add Feed")');
    await page.fill('input[placeholder*="RSS"]', 'https://hnrss.org/frontpage');
    await page.click('button:has-text("Subscribe")');
    await page.waitForSelector('article', { timeout: 15000 });
    
    // Simulate offline mode (if browser supports it)
    await page.context().setOffline(true);
    
    // Try to refresh
    const refreshButton = page.locator('button:has-text("刷新"), button[title*="刷新"]');
    await refreshButton.click();
    
    // Should show error or complete silently
    // Wait for button to become enabled again
    await expect(refreshButton).toBeEnabled({ timeout: 10000 });
    
    // Restore online mode
    await page.context().setOffline(false);
  });
});

test.describe('Auto-Refresh Behavior', () => {
  test('should respect manual refresh-only setting', async ({ page }) => {
    // Navigate to settings
    await page.goto('http://localhost:5173');
    const settingsButton = page.locator('button:has-text("设置"), a:has-text("Settings")');
    await settingsButton.click();
    
    // Set to manual refresh only (0 value)
    const intervalSelector = page.locator('select#refresh-interval, select[id*="interval"]');
    await intervalSelector.selectOption('0');
    await page.waitForSelector('text=/保存|saved/i', { timeout: 5000 });
    
    // Verify description shows manual-only message
    await page.waitForSelector('text=/手动刷新|manual/i', { timeout: 5000 });
  });

  test('should disable background sync when interval is 0', async ({ page }) => {
    // Navigate to settings
    await page.goto('http://localhost:5173');
    const settingsButton = page.locator('button:has-text("设置"), a:has-text("Settings")');
    await settingsButton.click();
    
    // Disable background sync
    const syncToggle = page.locator('input[type="checkbox"]:near(:text("后台同步"))');
    if (await syncToggle.isChecked()) {
      await syncToggle.click();
      await page.waitForSelector('text=/保存|saved/i', { timeout: 5000 });
    }
    
    // Verify manual refresh still works
    await page.locator('button:has-text("阅读器"), a:has-text("Reader")').click();
    
    // Add a feed if none exists
    const feedCount = await page.locator('article').count();
    if (feedCount === 0) {
      await page.click('button:has-text("Add Feed")');
      await page.fill('input[placeholder*="RSS"]', 'https://hnrss.org/frontpage');
      await page.click('button:has-text("Subscribe")');
      await page.waitForSelector('article', { timeout: 15000 });
    }
    
    // Manual refresh should still work
    const refreshButton = page.locator('button:has-text("刷新"), button[title*="刷新"]');
    await refreshButton.click();
    await page.waitForSelector('button:has-text("刷新中"), .animate-spin', { timeout: 2000 });
  });
});
