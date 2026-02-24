/**
 * Integration test: Auto Mark-as-Read on Article Open
 * Tests the loader marks articles as read when opened
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@lib/storage';
import { subscribeFeed, getArticleById } from '@services/feedService';
import { loadArticleDetail } from '@lib/router/loaders';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { RSS2_SAMPLE } from '../fixtures/feeds';
import type { Article } from '@models/Feed';

describe('Auto Mark-as-Read on Article Open', () => {
  let testArticles: Article[];

  beforeEach(async () => {
    await storage.init();
    await storage.clear('feeds');
    await storage.clear('articles');

    server.use(
      http.get('https://example.com/feed.xml', () => {
        return HttpResponse.text(RSS2_SAMPLE, {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
      })
    );

    const result = await subscribeFeed('https://example.com/feed.xml');
    expect(result.success).toBe(true);
    testArticles = await storage.getAll('articles');
    expect(testArticles.length).toBeGreaterThan(0);
  });

  it('should mark article as read when loader loads it', async () => {
    const article = testArticles[0];
    expect(article.readAt).toBeNull();

    // Simulate navigating to article detail
    const result = await loadArticleDetail({
      params: { articleId: article.id },
    });

    // Article in loader response should be marked as read
    expect(result.article.readAt).toBeDefined();
    expect(result.article.readAt).not.toBeNull();

    // Article in storage should also be marked as read
    const stored = await getArticleById(article.id);
    expect(stored?.readAt).toBeDefined();
  });

  it('should not change readAt if article was already read', async () => {
    const article = testArticles[0];

    // Mark as read first
    article.readAt = new Date('2026-01-01');
    await storage.put('articles', article);

    // Load article again
    const result = await loadArticleDetail({
      params: { articleId: article.id },
    });

    // readAt should remain the original time
    expect(new Date(result.article.readAt!).getTime()).toBe(new Date('2026-01-01').getTime());
  });

  it('should return both article and feed data', async () => {
    const article = testArticles[0];

    const result = await loadArticleDetail({
      params: { articleId: article.id },
    });

    expect(result.article).toBeDefined();
    expect(result.feed).toBeDefined();
    expect(result.article.id).toBe(article.id);
    expect(result.feed.id).toBe(article.feedId);
  });

  it('should throw 404 for non-existent article', async () => {
    try {
      await loadArticleDetail({
        params: { articleId: 'non-existent-id' },
      });
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
      expect((error as Response).status).toBe(404);
    }
  });
});
