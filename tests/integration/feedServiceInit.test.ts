/**
 * Integration test: Feed Service with auto-initialization
 * Ensures subscribeFeed and getArticlesForFeed work without explicit storage.init()
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@lib/storage';
import { subscribeFeed, getArticlesForFeed } from '@services/feedService';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { RSS2_SAMPLE } from '../fixtures/feeds';

describe('Feed Service auto-initialization', () => {
  beforeEach(async () => {
    // Only clear data, relying on auto-init inside storage methods
    await storage.clear('feeds');
    await storage.clear('articles');
  });

  it('should subscribe to a feed without explicit storage.init()', async () => {
    server.use(
      http.get('https://example.com/feed.xml', () => {
        return HttpResponse.text(RSS2_SAMPLE, {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
      })
    );

    const result = await subscribeFeed('https://example.com/feed.xml');

    expect(result.success).toBe(true);
    expect(result.feed).toBeDefined();
    expect(result.feed?.title).toBe('Sample RSS Feed');

    // Verify persistence
    const feeds = await storage.getAll('feeds');
    expect(feeds).toHaveLength(1);
  });

  it('should load articles for a feed without explicit storage.init()', async () => {
    server.use(
      http.get('https://example.com/feed.xml', () => {
        return HttpResponse.text(RSS2_SAMPLE, {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
      })
    );

    const result = await subscribeFeed('https://example.com/feed.xml');
    expect(result.success).toBe(true);

    const articles = await getArticlesForFeed(result.feed!.id);
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0].feedId).toBe(result.feed!.id);
  });
});
