/**
 * Integration test: View Articles Workflow
 * Tests viewing article list from a subscribed feed
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@lib/storage';
import { subscribeFeed, getArticlesForFeed } from '@services/feedService';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { RSS2_SAMPLE } from '../fixtures/feeds';
import type { Feed } from '@models/Feed';

describe('View Articles Workflow', () => {
  let testFeed: Feed;

  beforeEach(async () => {
    await storage.init();
    await storage.clear('feeds');
    await storage.clear('articles');

    // Setup mock response
    server.use(
      http.get('https://example.com/feed.xml', () => {
        return HttpResponse.text(RSS2_SAMPLE, {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
      })
    );

    // Add a test feed
    const result = await subscribeFeed('https://example.com/feed.xml');
    if (result.success && result.feed) {
      testFeed = result.feed;
    }
  });

  it('should retrieve articles for a subscribed feed', async () => {
    const articles = await getArticlesForFeed(testFeed.id);

    expect(articles).toBeDefined();
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0].feedId).toBe(testFeed.id);
  });

  it('should return articles sorted by publish date (newest first)', async () => {
    const articles = await getArticlesForFeed(testFeed.id);

    expect(articles.length).toBeGreaterThan(1);

    // Verify articles are sorted by publishedAt desc
    for (let i = 0; i < articles.length - 1; i++) {
      const currentDate = new Date(articles[i].publishedAt).getTime();
      const nextDate = new Date(articles[i + 1].publishedAt).getTime();
      expect(currentDate).toBeGreaterThanOrEqual(nextDate);
    }
  });

  it('should include article metadata (title, summary, author)', async () => {
    const articles = await getArticlesForFeed(testFeed.id);

    expect(articles.length).toBeGreaterThan(0);
    const article = articles[0];

    expect(article.title).toBeDefined();
    expect(article.title.length).toBeGreaterThan(0);
    expect(article.summary).toBeDefined();
    expect(article.link).toBeDefined();
  });

  it('should mark all articles as unread initially', async () => {
    const articles = await getArticlesForFeed(testFeed.id);

    articles.forEach((article) => {
      expect(article.readAt).toBeNull();
    });
  });

  it('should return empty array for feed with no articles', async () => {
    // Create a feed without articles
    const emptyFeed: Feed = {
      id: 'feed-empty',
      url: 'https://example.com/empty.xml',
      title: 'Empty Feed',
      description: '',
      link: 'https://example.com',
      lastFetchedAt: new Date(),
      refreshIntervalMinutes: 60,
      paused: false,
      errorCount: 0,
      createdAt: new Date(),
      deletedAt: null,
    };
    await storage.put('feeds', emptyFeed);

    const articles = await getArticlesForFeed(emptyFeed.id);
    expect(articles).toEqual([]);
  });

  it('should filter out articles from deleted feeds', async () => {
    // Mark feed as deleted
    const deletedFeed = { ...testFeed, deletedAt: new Date() };
    await storage.put('feeds', deletedFeed);

    const articles = await getArticlesForFeed(deletedFeed.id, { includeDeleted: false });
    expect(articles).toEqual([]);
  });

  it('should support pagination with limit parameter', async () => {
    const allArticles = await getArticlesForFeed(testFeed.id);
    const limitedArticles = await getArticlesForFeed(testFeed.id, { limit: 1 });

    expect(limitedArticles.length).toBe(1);
    expect(limitedArticles[0].id).toBe(allArticles[0].id);
  });

  it('should include image URLs if available', async () => {
    const articles = await getArticlesForFeed(testFeed.id);
    const articlesWithImages = articles.filter((a) => a.imageUrl);

    // RSS2_SAMPLE has at least one article with an enclosure
    expect(articlesWithImages.length).toBeGreaterThan(0);
  });
});
