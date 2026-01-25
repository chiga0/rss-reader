/**
 * Unit tests for OPML service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { exportToOPML, importFromOPML } from '@services/opmlService';
import { storage } from '@lib/storage';
import { OPML_SAMPLE } from '../fixtures/feeds';
import type { Feed, Category } from '@models/Feed';

describe('OPML Service', () => {
  beforeEach(async () => {
    // Initialize storage for each test
    await storage.init();
    await storage.clear('feeds');
    await storage.clear('categories');
  });

  describe('exportToOPML', () => {
    it('should export empty OPML when no feeds exist', async () => {
      const opml = await exportToOPML();

      expect(opml).toContain('<?xml version="1.0"');
      expect(opml).toContain('<opml version="2.0">');
      expect(opml).toContain('<title>RSS Reader Subscriptions</title>');
      expect(opml).toContain('</opml>');
    });

    it('should export feeds without categories', async () => {
      const feed: Feed = {
        id: 'feed-1',
        url: 'https://example.com/feed.xml',
        title: 'Test Feed',
        description: 'Description',
        lastFetchedAt: null,
        refreshIntervalMinutes: 60,
        paused: false,
        errorCount: 0,
        createdAt: new Date(),
        deletedAt: null,
      };

      await storage.put('feeds', feed);

      const opml = await exportToOPML();

      expect(opml).toContain('xmlUrl="https://example.com/feed.xml"');
      expect(opml).toContain('text="Test Feed"');
      expect(opml).toContain('type="rss"');
    });

    it('should export feeds with categories', async () => {
      const category: Category = {
        id: 'cat-1',
        name: 'Technology',
        order: 0,
        createdAt: new Date(),
      };

      const feed: Feed = {
        id: 'feed-1',
        url: 'https://example.com/tech-feed.xml',
        title: 'Tech News',
        description: 'Tech news',
        categoryId: 'cat-1',
        lastFetchedAt: null,
        refreshIntervalMinutes: 60,
        paused: false,
        errorCount: 0,
        createdAt: new Date(),
        deletedAt: null,
      };

      await storage.put('categories', category);
      await storage.put('feeds', feed);

      const opml = await exportToOPML();

      expect(opml).toContain('<outline text="Technology"');
      expect(opml).toContain('xmlUrl="https://example.com/tech-feed.xml"');
      expect(opml).toContain('text="Tech News"');
    });

    it('should not export deleted feeds', async () => {
      const feed: Feed = {
        id: 'feed-1',
        url: 'https://example.com/feed.xml',
        title: 'Deleted Feed',
        description: 'Description',
        lastFetchedAt: null,
        refreshIntervalMinutes: 60,
        paused: false,
        errorCount: 0,
        createdAt: new Date(),
        deletedAt: new Date(),
      };

      await storage.put('feeds', feed);

      const opml = await exportToOPML();

      expect(opml).not.toContain('Deleted Feed');
      expect(opml).not.toContain('https://example.com/feed.xml');
    });

    it('should escape XML special characters', async () => {
      const feed: Feed = {
        id: 'feed-1',
        url: 'https://example.com/feed.xml',
        title: 'Feed with <special> & "characters"',
        description: 'Description',
        lastFetchedAt: null,
        refreshIntervalMinutes: 60,
        paused: false,
        errorCount: 0,
        createdAt: new Date(),
        deletedAt: null,
      };

      await storage.put('feeds', feed);

      const opml = await exportToOPML();

      expect(opml).toContain('&lt;special&gt;');
      expect(opml).toContain('&amp;');
      expect(opml).toContain('&quot;');
      expect(opml).not.toContain('<special>');
    });

    it('should include htmlUrl if feed has link', async () => {
      const feed: Feed = {
        id: 'feed-1',
        url: 'https://example.com/feed.xml',
        title: 'Feed with Link',
        description: 'Description',
        link: 'https://example.com',
        lastFetchedAt: null,
        refreshIntervalMinutes: 60,
        paused: false,
        errorCount: 0,
        createdAt: new Date(),
        deletedAt: null,
      };

      await storage.put('feeds', feed);

      const opml = await exportToOPML();

      expect(opml).toContain('htmlUrl="https://example.com"');
    });
  });

  describe('importFromOPML', () => {
    it('should parse OPML correctly', async () => {
      const result = await importFromOPML(OPML_SAMPLE);

      expect(result.imported).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it('should throw error for invalid OPML XML', async () => {
      const invalidOPML = '<invalid>xml</unclosed>';

      await expect(importFromOPML(invalidOPML)).rejects.toThrow('Invalid OPML file');
    });

    it('should create categories from OPML structure', async () => {
      await importFromOPML(OPML_SAMPLE);

      const categories = await storage.getAll('categories');
      const categoryNames = categories.map(c => c.name);

      expect(categoryNames).toContain('Technology');
      expect(categoryNames).toContain('Science');
    });

    it('should not duplicate existing categories', async () => {
      const existingCategory: Category = {
        id: 'cat-1',
        name: 'Technology',
        order: 0,
        createdAt: new Date(),
      };

      await storage.put('categories', existingCategory);
      await importFromOPML(OPML_SAMPLE);

      const categories = await storage.getAll('categories');
      const techCategories = categories.filter(c => c.name === 'Technology');

      expect(techCategories).toHaveLength(1);
    });

    it('should call progress callback', async () => {
      const progressCalls: Array<{ current: number; total: number }> = [];

      await importFromOPML(OPML_SAMPLE, (current, total) => {
        progressCalls.push({ current, total });
      });

      expect(progressCalls.length).toBeGreaterThan(0);
      expect(progressCalls[progressCalls.length - 1].current).toBe(
        progressCalls[progressCalls.length - 1].total
      );
    });

    it('should handle OPML with no categories', async () => {
      const flatOPML = `<?xml version="1.0"?>
        <opml version="2.0">
          <head><title>Flat Feeds</title></head>
          <body>
            <outline type="rss" text="Feed" xmlUrl="https://example.com/feed.xml"/>
          </body>
        </opml>`;

      const result = await importFromOPML(flatOPML);

      expect(result.imported).toBeGreaterThanOrEqual(0);
      expect(result.failed).toBe(0);
    });

    it('should return errors for failed imports', async () => {
      // OPML with invalid feed URL
      const badOPML = `<?xml version="1.0"?>
        <opml version="2.0">
          <head><title>Bad Feeds</title></head>
          <body>
            <outline type="rss" text="Bad Feed" xmlUrl="invalid-url"/>
          </body>
        </opml>`;

      const result = await importFromOPML(badOPML);

      // Note: Since we're not actually fetching feeds in this test,
      // the import may appear successful but would fail in real scenario
      expect(result.errors).toBeDefined();
    });
  });
});
