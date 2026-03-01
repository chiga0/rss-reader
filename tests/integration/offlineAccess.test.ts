/**
 * Integration Test: Offline Article Access
 * Tests that users can access previously loaded articles when offline
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@lib/storage';
import type { Feed, Article } from '@models/Feed';

describe('Offline Article Access', () => {
  beforeEach(async () => {
    await storage.init();
    await storage.clear('feeds');
    await storage.clear('articles');
  });

  it('should access cached articles when offline', async () => {
    // Setup: Store articles while online
    const feed: Feed = {
      id: 'feed-1',
      url: 'https://example.com/feed.xml',
      title: 'Test Feed',
      description: 'Test',
      link: 'https://example.com',
      lastFetchedAt: new Date(),
      articleCount: 2,
      unreadCount: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const articles: Article[] = [
      {
        id: 'article-1',
        feedId: 'feed-1',
        title: 'Article 1',
        link: 'https://example.com/article-1',
        content: 'Content 1',
        publishedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'article-2',
        feedId: 'feed-1',
        title: 'Article 2',
        link: 'https://example.com/article-2',
        content: 'Content 2',
        publishedAt: new Date(),
        createdAt: new Date(),
      },
    ];

    await storage.put('feeds', feed);
    for (const article of articles) {
      await storage.put('articles', article);
    }

    // Simulate offline: articles should still be accessible
    const cachedArticles = await storage.getAll('articles');
    expect(cachedArticles).toHaveLength(2);
    expect(cachedArticles[0].title).toBe('Article 1');
    expect(cachedArticles[1].title).toBe('Article 2');
  });

  it('should retrieve articles within 2 seconds', async () => {
    // Store multiple articles
    const articles: Article[] = Array.from({ length: 50 }, (_, i) => ({
      id: `article-${i}`,
      feedId: 'feed-1',
      title: `Article ${i}`,
      link: `https://example.com/article-${i}`,
      content: `Content ${i}`,
      publishedAt: new Date(),
      createdAt: new Date(),
    }));

    for (const article of articles) {
      await storage.put('articles', article);
    }

    // Measure retrieval time
    const startTime = performance.now();
    const cachedArticles = await storage.getAll('articles');
    const duration = performance.now() - startTime;

    expect(cachedArticles).toHaveLength(50);
    expect(duration).toBeLessThan(2000); // Must be < 2s
  });

  it('should filter articles by feedId efficiently', async () => {
    // Store articles from multiple feeds
    const feeds = ['feed-1', 'feed-2', 'feed-3'];
    for (const feedId of feeds) {
      for (let i = 0; i < 20; i++) {
        await storage.put('articles', {
          id: `${feedId}-article-${i}`,
          feedId,
          title: `Article ${i}`,
          link: `https://example.com/${feedId}/article-${i}`,
          content: `Content ${i}`,
          publishedAt: new Date(),
          createdAt: new Date(),
        });
      }
    }

    // Query articles for specific feed
    const startTime = performance.now();
    const allArticles = await storage.getAll('articles');
    const feed1Articles = allArticles.filter(a => a.feedId === 'feed-1');
    const duration = performance.now() - startTime;

    expect(feed1Articles).toHaveLength(20);
    expect(duration).toBeLessThan(200); // < 200ms as per SC-009
  });

  it('should handle empty cache gracefully', async () => {
    // No articles stored
    const cachedArticles = await storage.getAll('articles');
    
    expect(cachedArticles).toHaveLength(0);
    expect(Array.isArray(cachedArticles)).toBe(true);
  });

  it('should preserve article content when offline', async () => {
    const article: Article = {
      id: 'article-1',
      feedId: 'feed-1',
      title: 'Test Article',
      link: 'https://example.com/article',
      content: '<p>This is <strong>HTML</strong> content</p>',
      description: 'Article description',
      author: 'Test Author',
      publishedAt: new Date('2026-01-25'),
      createdAt: new Date(),
    };

    await storage.put('articles', article);

    // Retrieve and verify all fields preserved
    const cached = await storage.get('articles', 'article-1');
    
    expect(cached).toBeDefined();
    expect(cached?.title).toBe('Test Article');
    expect(cached?.content).toBe('<p>This is <strong>HTML</strong> content</p>');
    expect(cached?.description).toBe('Article description');
    expect(cached?.author).toBe('Test Author');
  });
});
