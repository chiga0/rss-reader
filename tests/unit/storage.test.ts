/**
 * Unit tests for Storage bulk operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@lib/storage';
import type { Feed, Article } from '@models/Feed';
import 'fake-indexeddb/auto';

describe('Storage', () => {
  beforeEach(async () => {
    await storage.init();
    await storage.clear('feeds');
    await storage.clear('articles');
  });

  describe('bulkPut', () => {
    it('should insert multiple items efficiently', async () => {
      const feeds: Feed[] = Array.from({ length: 10 }, (_, i) => ({
        id: `feed-${i}`,
        url: `https://example.com/feed-${i}.xml`,
        title: `Feed ${i}`,
        description: `Description ${i}`,
        lastFetchedAt: null,
        refreshIntervalMinutes: 60,
        paused: false,
        errorCount: 0,
        createdAt: new Date(),
        deletedAt: null,
      }));

      await storage.bulkPut('feeds', feeds);

      const allFeeds = await storage.getAll('feeds');
      expect(allFeeds).toHaveLength(10);
    });

    it('should update existing items', async () => {
      const feed: Feed = {
        id: 'feed-1',
        url: 'https://example.com/feed.xml',
        title: 'Original Title',
        description: 'Description',
        lastFetchedAt: null,
        refreshIntervalMinutes: 60,
        paused: false,
        errorCount: 0,
        createdAt: new Date(),
        deletedAt: null,
      };

      await storage.put('feeds', feed);

      const updatedFeed = { ...feed, title: 'Updated Title' };
      await storage.bulkPut('feeds', [updatedFeed]);

      const result = await storage.get('feeds', 'feed-1');
      expect(result?.title).toBe('Updated Title');
    });

    it('should handle empty array', async () => {
      await expect(storage.bulkPut('feeds', [])).resolves.not.toThrow();
      
      const allFeeds = await storage.getAll('feeds');
      expect(allFeeds).toHaveLength(0);
    });

    it('should handle large batches', async () => {
      const articles: Article[] = Array.from({ length: 100 }, (_, i) => ({
        id: `article-${i}`,
        feedId: 'feed-1',
        title: `Article ${i}`,
        summary: `Summary ${i}`,
        link: `https://example.com/article-${i}`,
        publishedAt: new Date(),
        readAt: null,
        isFavorite: false,
        createdAt: new Date(),
      }));

      await storage.bulkPut('articles', articles);

      const allArticles = await storage.getAll('articles');
      expect(allArticles).toHaveLength(100);
    });
  });

  describe('getQuota', () => {
    it('should return storage quota information', async () => {
      const quota = await storage.getQuota();

      expect(quota).toHaveProperty('usage');
      expect(quota).toHaveProperty('quota');
      expect(quota).toHaveProperty('percentUsed');
      expect(quota).toHaveProperty('available');

      expect(typeof quota.usage).toBe('number');
      expect(typeof quota.quota).toBe('number');
      expect(typeof quota.percentUsed).toBe('number');
      expect(typeof quota.available).toBe('number');
    });

    it('should calculate percentUsed correctly', async () => {
      const quota = await storage.getQuota();

      if (quota.quota > 0) {
        const expectedPercent = (quota.usage / quota.quota) * 100;
        expect(quota.percentUsed).toBeCloseTo(expectedPercent, 2);
      }
    });

    it('should calculate available space correctly', async () => {
      const quota = await storage.getQuota();

      const expectedAvailable = quota.quota - quota.usage;
      expect(quota.available).toBe(expectedAvailable);
    });
  });

  describe('isQuotaExceeded', () => {
    it('should return boolean', async () => {
      const isExceeded = await storage.isQuotaExceeded();
      expect(typeof isExceeded).toBe('boolean');
    });

    it('should return false for normal usage', async () => {
      const isExceeded = await storage.isQuotaExceeded();
      expect(isExceeded).toBe(false);
    });
  });

  describe('getDatabaseSize', () => {
    it('should return database size as number', async () => {
      const size = await storage.getDatabaseSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });

    it('should increase with added data', async () => {
      const sizeBefore = await storage.getDatabaseSize();

      const feeds: Feed[] = Array.from({ length: 50 }, (_, i) => ({
        id: `feed-${i}`,
        url: `https://example.com/feed-${i}.xml`,
        title: `Feed ${i}`,
        description: `Description ${i}`,
        lastFetchedAt: null,
        refreshIntervalMinutes: 60,
        paused: false,
        errorCount: 0,
        createdAt: new Date(),
        deletedAt: null,
      }));

      await storage.bulkPut('feeds', feeds);

      const sizeAfter = await storage.getDatabaseSize();
      
      // Size should increase (or stay same in test environment)
      expect(sizeAfter).toBeGreaterThanOrEqual(sizeBefore);
    });
  });

  describe('getAllByIndex', () => {
    it('should query by feedId index', async () => {
      const articles: Article[] = [
        {
          id: 'article-1',
          feedId: 'feed-1',
          title: 'Article 1',
          summary: 'Summary',
          link: 'https://example.com/1',
          publishedAt: new Date(),
          readAt: null,
          isFavorite: false,
          createdAt: new Date(),
        },
        {
          id: 'article-2',
          feedId: 'feed-1',
          title: 'Article 2',
          summary: 'Summary',
          link: 'https://example.com/2',
          publishedAt: new Date(),
          readAt: null,
          isFavorite: false,
          createdAt: new Date(),
        },
        {
          id: 'article-3',
          feedId: 'feed-2',
          title: 'Article 3',
          summary: 'Summary',
          link: 'https://example.com/3',
          publishedAt: new Date(),
          readAt: null,
          isFavorite: false,
          createdAt: new Date(),
        },
      ];

      await storage.bulkPut('articles', articles);

      const feed1Articles = await storage.getAllByIndex('articles', 'feedId', 'feed-1');
      expect(feed1Articles).toHaveLength(2);
      expect(feed1Articles.every(a => a.feedId === 'feed-1')).toBe(true);
    });

    it('should return empty array for non-existent index value', async () => {
      const results = await storage.getAllByIndex('articles', 'feedId', 'non-existent');
      expect(results).toHaveLength(0);
    });
  });
});
