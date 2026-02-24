/**
 * Integration test: Reading History Workflow
 * Tests mark-as-read behavior and reading history
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@lib/storage';
import { subscribeFeed, markArticleAsRead, getArticleById } from '@services/feedService';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { RSS2_SAMPLE } from '../fixtures/feeds';
import type { Article } from '@models/Feed';

describe('Reading History Workflow', () => {
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

  it('should mark article as read with timestamp', async () => {
    const article = testArticles[0];
    expect(article.readAt).toBeNull();

    const beforeRead = new Date();
    await markArticleAsRead(article.id);
    const afterRead = new Date();

    const updated = await getArticleById(article.id);
    expect(updated?.readAt).toBeDefined();
    expect(updated?.readAt).not.toBeNull();

    const readTime = new Date(updated!.readAt!);
    expect(readTime.getTime()).toBeGreaterThanOrEqual(beforeRead.getTime());
    expect(readTime.getTime()).toBeLessThanOrEqual(afterRead.getTime());
  });

  it('should not update readAt if already read', async () => {
    await markArticleAsRead(testArticles[0].id);
    const firstRead = await getArticleById(testArticles[0].id);
    const firstReadAt = firstRead!.readAt;

    // Wait and try marking again
    await new Promise(r => setTimeout(r, 10));
    await markArticleAsRead(testArticles[0].id);
    const secondRead = await getArticleById(testArticles[0].id);

    expect(firstReadAt).toEqual(secondRead!.readAt);
  });

  it('should show read articles in history list', async () => {
    // Read first article
    await markArticleAsRead(testArticles[0].id);

    const allArticles = await storage.getAll('articles');
    const readArticles = allArticles.filter(a => a.readAt);

    expect(readArticles.length).toBe(1);
    expect(readArticles[0].id).toBe(testArticles[0].id);
  });

  it('should order history by read time (newest first)', async () => {
    // Read articles with a delay
    await markArticleAsRead(testArticles[0].id);
    await new Promise(r => setTimeout(r, 10));
    await markArticleAsRead(testArticles[1].id);

    const allArticles = await storage.getAll('articles');
    const readArticles = allArticles
      .filter(a => a.readAt)
      .sort((a, b) => {
        const aTime = a.readAt ? new Date(a.readAt).getTime() : 0;
        const bTime = b.readAt ? new Date(b.readAt).getTime() : 0;
        return bTime - aTime;
      });

    expect(readArticles.length).toBe(2);
    // Most recently read should be first
    expect(readArticles[0].id).toBe(testArticles[1].id);
  });

  it('should preserve favorite status when marking as read', async () => {
    // Favorite article first
    testArticles[0].isFavorite = true;
    await storage.put('articles', testArticles[0]);

    // Mark as read
    await markArticleAsRead(testArticles[0].id);

    const updated = await getArticleById(testArticles[0].id);
    expect(updated?.readAt).toBeDefined();
    expect(updated?.isFavorite).toBe(true);
  });

  it('should handle reading all articles', async () => {
    for (const article of testArticles) {
      await markArticleAsRead(article.id);
    }

    const allArticles = await storage.getAll('articles');
    const unreadArticles = allArticles.filter(a => !a.readAt);

    expect(unreadArticles.length).toBe(0);
  });
});
