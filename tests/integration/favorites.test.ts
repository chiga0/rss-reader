/**
 * Integration test: Favorites Workflow
 * Tests marking articles as favorites and loading favorite list
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@lib/storage';
import { subscribeFeed, getArticleById } from '@services/feedService';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { RSS2_SAMPLE } from '../fixtures/feeds';
import type { Article } from '@models/Feed';

describe('Favorites Workflow', () => {
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

  it('should mark article as favorite', async () => {
    const article = testArticles[0];
    expect(article.isFavorite).toBe(false);

    // Toggle favorite
    article.isFavorite = true;
    await storage.put('articles', article);

    const updated = await getArticleById(article.id);
    expect(updated?.isFavorite).toBe(true);
  });

  it('should unfavorite article', async () => {
    const article = testArticles[0];

    // Favorite first
    article.isFavorite = true;
    await storage.put('articles', article);

    // Then unfavorite
    article.isFavorite = false;
    await storage.put('articles', article);

    const updated = await getArticleById(article.id);
    expect(updated?.isFavorite).toBe(false);
  });

  it('should retrieve all favorite articles', async () => {
    // Favorite first article
    testArticles[0].isFavorite = true;
    await storage.put('articles', testArticles[0]);

    const allArticles = await storage.getAll('articles');
    const favorites = allArticles.filter(a => a.isFavorite);

    expect(favorites.length).toBe(1);
    expect(favorites[0].id).toBe(testArticles[0].id);
  });

  it('should keep favorites when article is read', async () => {
    const article = testArticles[0];

    // Mark as favorite and read
    article.isFavorite = true;
    article.readAt = new Date();
    await storage.put('articles', article);

    const updated = await getArticleById(article.id);
    expect(updated?.isFavorite).toBe(true);
    expect(updated?.readAt).toBeDefined();
  });

  it('should handle toggling favorite on multiple articles', async () => {
    // Favorite all articles
    for (const article of testArticles) {
      article.isFavorite = true;
      await storage.put('articles', article);
    }

    const allArticles = await storage.getAll('articles');
    const favorites = allArticles.filter(a => a.isFavorite);
    expect(favorites.length).toBe(testArticles.length);
  });
});
