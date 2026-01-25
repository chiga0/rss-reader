/**
 * Integration test: Add Feed Workflow
 * Tests the complete flow of adding a new RSS feed subscription
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@lib/storage';
import { subscribeFeed } from '@services/feedService';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { RSS2_SAMPLE } from '../fixtures/feeds';

describe('Add Feed Workflow', () => {
  beforeEach(async () => {
    await storage.init();
    await storage.clear('feeds');
    await storage.clear('articles');
    await storage.clear('categories');
  });

  it('should successfully add a valid RSS feed', async () => {
    // Setup mock response
    server.use(
      http.get('https://example.com/feed.xml', () => {
        return HttpResponse.text(RSS2_SAMPLE, {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
      })
    );

    // Add feed
    const result = await subscribeFeed('https://example.com/feed.xml');

    // Verify feed was added
    expect(result.success).toBe(true);
    expect(result.feed).toBeDefined();
    expect(result.feed?.title).toBe('Sample RSS Feed');
    expect(result.feed?.url).toBe('https://example.com/feed.xml');

    // Verify feed exists in storage
    const feeds = await storage.getAll('feeds');
    expect(feeds).toHaveLength(1);
    expect(feeds[0].title).toBe('Sample RSS Feed');
  });

  it('should fetch and store articles when adding feed', async () => {
    // Setup mock response
    server.use(
      http.get('https://example.com/feed.xml', () => {
        return HttpResponse.text(RSS2_SAMPLE, {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
      })
    );

    // Add feed
    const result = await subscribeFeed('https://example.com/feed.xml');
    expect(result.success).toBe(true);

    // Verify articles were stored
    const articles = await storage.getAll('articles');
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0].feedId).toBe(result.feed?.id);
  });

  it('should reject invalid feed URLs', async () => {
    const result = await subscribeFeed('not-a-valid-url');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Invalid');
  });

  it('should handle network errors gracefully', async () => {
    // Setup mock to return network error
    server.use(
      http.get('https://example.com/unreachable-feed.xml', () => {
        return HttpResponse.error();
      })
    );

    const result = await subscribeFeed('https://example.com/unreachable-feed.xml');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle malformed XML gracefully', async () => {
    // Setup mock to return invalid XML
    server.use(
      http.get('https://example.com/bad-feed.xml', () => {
        return HttpResponse.text('<invalid><xml>', {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
      })
    );

    const result = await subscribeFeed('https://example.com/bad-feed.xml');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should detect duplicate feed subscriptions', async () => {
    // Setup mock response
    server.use(
      http.get('https://example.com/feed.xml', () => {
        return HttpResponse.text(RSS2_SAMPLE, {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
      })
    );

    // Add feed first time
    const result1 = await subscribeFeed('https://example.com/feed.xml');
    expect(result1.success).toBe(true);

    // Try to add same feed again
    const result2 = await subscribeFeed('https://example.com/feed.xml');
    expect(result2.success).toBe(false);
    expect(result2.error).toContain('already subscribed');

    // Verify only one feed in storage
    const feeds = await storage.getAll('feeds');
    expect(feeds).toHaveLength(1);
  });

  it('should add feed with optional category', async () => {
    // Setup mock response
    server.use(
      http.get('https://example.com/feed.xml', () => {
        return HttpResponse.text(RSS2_SAMPLE, {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
      })
    );

    // Create category first
    const category = await storage.put('categories', {
      id: 'cat-1',
      name: 'Technology',
      order: 0,
      createdAt: new Date(),
    });

    // Add feed with category
    const result = await subscribeFeed('https://example.com/feed.xml', category.id);
    expect(result.success).toBe(true);
    expect(result.feed?.categoryId).toBe(category.id);
  });
});
