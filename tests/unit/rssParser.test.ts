/**
 * Unit tests for RSS/Atom parser
 */

import { describe, it, expect } from 'vitest';
import { parseFeed } from '@lib/rssParser';
import {
  RSS2_SAMPLE,
  ATOM_SAMPLE,
  INVALID_XML,
  NOT_A_FEED,
  RSS_WITH_CONTENT_ENCODED,
  ATOM_WITH_MEDIA,
  EMPTY_FEED,
  ATOM_WITH_XHTML_CONTENT,
} from '../fixtures/feeds';

describe('RSS Parser', () => {
  describe('RSS 2.0 Parsing', () => {
    it('should parse RSS 2.0 feed correctly', () => {
      const result = parseFeed(RSS2_SAMPLE, 'https://example.com/feed.xml');

      expect(result.format).toBe('RSS 2.0');
      expect(result.feed.title).toBe('Sample RSS Feed');
      expect(result.feed.description).toBe('A sample RSS 2.0 feed for testing');
      expect(result.feed.link).toBe('https://example.com');
      expect(result.feed.iconUrl).toBe('https://example.com/icon.png');
    });

    it('should parse RSS articles correctly', () => {
      const result = parseFeed(RSS2_SAMPLE, 'https://example.com/feed.xml');

      expect(result.articles).toHaveLength(2);
      
      const first = result.articles[0];
      expect(first.title).toBe('First Article');
      expect(first.link).toBe('https://example.com/article-1');
      expect(first.summary).toBe('This is the first article description');
      expect(first.author).toBe('john@example.com (John Doe)');
      expect(first.publishedAt).toBeInstanceOf(Date);
    });

    it('should extract image from enclosure', () => {
      const result = parseFeed(RSS2_SAMPLE, 'https://example.com/feed.xml');
      
      const second = result.articles[1];
      expect(second.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should handle HTML in description', () => {
      const result = parseFeed(RSS2_SAMPLE, 'https://example.com/feed.xml');
      
      const second = result.articles[1];
      expect(second.summary).toContain('HTML content');
    });

    it('should prefer content:encoded over description', () => {
      const result = parseFeed(RSS_WITH_CONTENT_ENCODED, 'https://example.com/feed.xml');

      expect(result.articles).toHaveLength(1);
      const article = result.articles[0];
      expect(article.content).toContain('full article content');
      expect(article.content).toContain('<strong>HTML formatting</strong>');
      expect(article.summary).toBe('Short description');
    });

    it('should extract first image from HTML content', () => {
      const result = parseFeed(RSS_WITH_CONTENT_ENCODED, 'https://example.com/feed.xml');
      
      const article = result.articles[0];
      expect(article.imageUrl).toBe('https://example.com/inline-image.jpg');
    });

    it('should handle feed with no articles', () => {
      const result = parseFeed(EMPTY_FEED, 'https://example.com/feed.xml');

      expect(result.format).toBe('RSS 2.0');
      expect(result.articles).toHaveLength(0);
    });
  });

  describe('Atom 1.0 Parsing', () => {
    it('should parse Atom 1.0 feed correctly', () => {
      const result = parseFeed(ATOM_SAMPLE, 'https://example.com/feed.xml');

      expect(result.format).toBe('Atom 1.0');
      expect(result.feed.title).toBe('Sample Atom Feed');
      expect(result.feed.description).toBe('A sample Atom 1.0 feed for testing');
      expect(result.feed.link).toBe('https://example.com');
      expect(result.feed.iconUrl).toBe('https://example.com/icon.png');
    });

    it('should parse Atom entries correctly', () => {
      const result = parseFeed(ATOM_SAMPLE, 'https://example.com/feed.xml');

      expect(result.articles).toHaveLength(2);
      
      const first = result.articles[0];
      expect(first.title).toBe('Atom Article One');
      expect(first.link).toBe('https://example.com/atom-1');
      expect(first.summary).toBe('Summary of the first Atom article');
      expect(first.content).toContain('Full HTML content here');
      expect(first.author).toBe('Jane Smith');
    });

    it('should handle Atom without author', () => {
      const result = parseFeed(ATOM_SAMPLE, 'https://example.com/feed.xml');
      
      const second = result.articles[1];
      expect(second.author).toBeUndefined();
    });

    it('should extract media:content from Atom', () => {
      const result = parseFeed(ATOM_WITH_MEDIA, 'https://example.com/feed.xml');

      expect(result.articles).toHaveLength(1);
      const article = result.articles[0];
      expect(article.imageUrl).toBe('https://example.com/featured-image.jpg');
    });

    it('should use published date for Atom entries', () => {
      const result = parseFeed(ATOM_SAMPLE, 'https://example.com/feed.xml');
      
      const first = result.articles[0];
      expect(first.publishedAt).toBeInstanceOf(Date);
      expect(first.publishedAt.getTime()).toBeGreaterThan(0);
    });

    it('should preserve HTML structure in XHTML content type', () => {
      const result = parseFeed(ATOM_WITH_XHTML_CONTENT, 'https://example.com/feed.xml');

      expect(result.articles).toHaveLength(1);
      const article = result.articles[0];
      // Content should preserve HTML tags, not just plain text
      expect(article.content).toContain('<strong>');
      expect(article.content).toContain('<a');
      expect(article.content).toContain('full article');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid XML', () => {
      expect(() => {
        parseFeed(INVALID_XML, 'https://example.com/feed.xml');
      }).toThrow('Failed to parse XML');
    });

    it('should throw error for non-feed content', () => {
      expect(() => {
        parseFeed(NOT_A_FEED, 'https://example.com/feed.xml');
      }).toThrow('Unsupported feed format');
    });

    it('should throw error for missing channel in RSS', () => {
      const invalidRSS = `<?xml version="1.0"?><rss version="2.0"></rss>`;
      
      expect(() => {
        parseFeed(invalidRSS, 'https://example.com/feed.xml');
      }).toThrow('Invalid RSS 2.0 feed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional fields gracefully', () => {
      const minimalRSS = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <title>Minimal Feed</title>
            <item>
              <title>Minimal Article</title>
            </item>
          </channel>
        </rss>`;

      const result = parseFeed(minimalRSS, 'https://example.com/feed.xml');

      expect(result.feed.title).toBe('Minimal Feed');
      expect(result.feed.description).toBe('');
      expect(result.articles[0].link).toBe('');
      expect(result.articles[0].summary).toBe('');
    });

    it('should use feed URL as fallback link', () => {
      const noLinkRSS = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <title>No Link Feed</title>
          </channel>
        </rss>`;

      const result = parseFeed(noLinkRSS, 'https://example.com/feed.xml');
      expect(result.feed.link).toBe('https://example.com/feed.xml');
    });

    it('should default to current date for missing publish dates', () => {
      const noDateRSS = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <title>Feed</title>
            <item>
              <title>Article</title>
            </item>
          </channel>
        </rss>`;

      const result = parseFeed(noDateRSS, 'https://example.com/feed.xml');
      const now = new Date();
      const articleDate = result.articles[0].publishedAt;

      // Should be within 1 second of now
      expect(Math.abs(now.getTime() - articleDate.getTime())).toBeLessThan(1000);
    });

    it('should initialize article flags correctly', () => {
      const result = parseFeed(RSS2_SAMPLE, 'https://example.com/feed.xml');
      
      const article = result.articles[0];
      expect(article.readAt).toBeNull();
      expect(article.isFavorite).toBe(false);
    });
  });
});
