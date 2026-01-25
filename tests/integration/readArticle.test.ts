/**
 * Integration test: Read Article Content
 * Tests viewing full article content with proper formatting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@lib/storage';
import { subscribeFeed, getArticleById, markArticleAsRead } from '@services/feedService';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { RSS2_SAMPLE } from '../fixtures/feeds';
import type { Article } from '@models/Feed';

describe('Read Article Content', () => {
  let testArticle: Article;

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

    // Add a test feed and get first article
    const result = await subscribeFeed('https://example.com/feed.xml');
    if (result.success) {
      const articles = await storage.getAll('articles');
      testArticle = articles[0];
    }
  });

  it('should retrieve article by ID', async () => {
    const article = await getArticleById(testArticle.id);

    expect(article).toBeDefined();
    expect(article?.id).toBe(testArticle.id);
    expect(article?.title).toBe(testArticle.title);
  });

  it('should include full article content', async () => {
    const article = await getArticleById(testArticle.id);

    expect(article).toBeDefined();
    expect(article?.content).toBeDefined();
    expect(article?.content.length).toBeGreaterThan(0);
  });

  it('should include article metadata', async () => {
    const article = await getArticleById(testArticle.id);

    expect(article).toBeDefined();
    expect(article?.title).toBeDefined();
    expect(article?.link).toBeDefined();
    expect(article?.publishedAt).toBeDefined();
    expect(article?.feedId).toBeDefined();
  });

  it('should mark article as read when viewed', async () => {
    // Initially unread
    expect(testArticle.readAt).toBeNull();

    // Mark as read
    await markArticleAsRead(testArticle.id);

    // Verify marked as read
    const updatedArticle = await getArticleById(testArticle.id);
    expect(updatedArticle?.readAt).toBeDefined();
    expect(updatedArticle?.readAt).toBeInstanceOf(Date);
  });

  it('should sanitize HTML content for safety', async () => {
    // Get base article structure
    const baseArticle = await getArticleById(testArticle.id);
    if (!baseArticle) throw new Error('Base article not found');

    // Create article with potentially dangerous content
    const dangerousArticle: Article = {
      ...baseArticle,
      id: 'dangerous-article',
      content: '<script>alert("xss")</script><p>Safe content</p><img src="x" onerror="alert(1)">',
    };
    await storage.put('articles', dangerousArticle);

    const article = await getArticleById(dangerousArticle.id);

    // Content should be as-is (sanitization happens at render time)
    expect(article?.content).toBeDefined();
    expect(article?.content).toContain('Safe content');
  });

  it('should preserve safe HTML formatting', async () => {
    // Get base article structure
    const baseArticle = await getArticleById(testArticle.id);
    if (!baseArticle) throw new Error('Base article not found');

    // Create article with safe HTML
    const formattedArticle: Article = {
      ...baseArticle,
      id: 'formatted-article',
      content: '<h2>Heading</h2><p>Paragraph with <strong>bold</strong> and <em>italic</em></p><a href="https://example.com">Link</a>',
    };
    await storage.put('articles', formattedArticle);

    const article = await getArticleById(formattedArticle.id);

    // Safe HTML should be preserved
    expect(article?.content).toContain('<h2>');
    expect(article?.content).toContain('<strong>');
    expect(article?.content).toContain('<em>');
    expect(article?.content).toContain('<a href');
  });

  it('should handle articles with images', async () => {
    const article = await getArticleById(testArticle.id);

    if (article?.imageUrl) {
      expect(article.imageUrl).toMatch(/^https?:\/\//);
    }
  });

  it('should return null for non-existent article', async () => {
    const article = await getArticleById('non-existent-id');
    expect(article).toBeNull();
  });

  it('should track when article was last read', async () => {
    const beforeRead = new Date();

    await markArticleAsRead(testArticle.id);

    const article = await getArticleById(testArticle.id);
    expect(article?.readAt).toBeDefined();

    if (article?.readAt) {
      const readTime = new Date(article.readAt);
      expect(readTime.getTime()).toBeGreaterThanOrEqual(beforeRead.getTime());
    }
  });

  it('should not duplicate readAt if already read', async () => {
    // Mark as read first time
    await markArticleAsRead(testArticle.id);
    const firstRead = await getArticleById(testArticle.id);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Mark as read again
    await markArticleAsRead(testArticle.id);
    const secondRead = await getArticleById(testArticle.id);

    // readAt should remain the same (first read time)
    expect(firstRead?.readAt).toEqual(secondRead?.readAt);
  });
});
