/**
 * Unit tests for validators
 */

import { describe, it, expect } from 'vitest';
import {
  isValidURL,
  validateFeedURL,
  validateFeedTitle,
  validateCategoryName,
  validateRefreshInterval,
  sanitizeString,
  looksLikeFeed,
} from '@utils/validators';

describe('Validators', () => {
  describe('isValidURL', () => {
    it('should accept valid HTTP URLs', () => {
      expect(isValidURL('http://example.com')).toBe(true);
      expect(isValidURL('http://example.com/feed.xml')).toBe(true);
    });

    it('should accept valid HTTPS URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('https://example.com/path/to/feed')).toBe(true);
    });

    it('should reject non-HTTP(S) protocols', () => {
      expect(isValidURL('ftp://example.com')).toBe(false);
      expect(isValidURL('file:///path/to/file')).toBe(false);
      expect(isValidURL('javascript:alert(1)')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('')).toBe(false);
      expect(isValidURL('example.com')).toBe(false); // No protocol
    });
  });

  describe('validateFeedURL', () => {
    it('should normalize URLs without protocol', () => {
      expect(validateFeedURL('example.com')).toBe('https://example.com');
      expect(validateFeedURL('example.com/feed.xml')).toBe('https://example.com/feed.xml');
    });

    it('should return normalized valid URLs', () => {
      expect(validateFeedURL('https://example.com')).toBe('https://example.com');
      expect(validateFeedURL('http://example.com')).toBe('http://example.com');
    });

    it('should return null for empty strings', () => {
      expect(validateFeedURL('')).toBe(null);
      expect(validateFeedURL('   ')).toBe(null);
    });

    it('should return null for invalid URLs', () => {
      expect(validateFeedURL('not@valid')).toBe(null);
      expect(validateFeedURL('javascript:alert(1)')).toBe(null);
    });

    it('should trim whitespace', () => {
      expect(validateFeedURL('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('validateFeedTitle', () => {
    it('should accept valid titles', () => {
      expect(validateFeedTitle('My Feed')).toBe(true);
      expect(validateFeedTitle('A'.repeat(200))).toBe(true);
    });

    it('should reject empty titles', () => {
      expect(validateFeedTitle('')).toBe(false);
      expect(validateFeedTitle('   ')).toBe(false);
    });

    it('should reject titles exceeding max length', () => {
      expect(validateFeedTitle('A'.repeat(201))).toBe(false);
    });
  });

  describe('validateCategoryName', () => {
    it('should accept valid category names', () => {
      expect(validateCategoryName('Technology')).toBe(true);
      expect(validateCategoryName('A'.repeat(50))).toBe(true);
    });

    it('should reject empty names', () => {
      expect(validateCategoryName('')).toBe(false);
      expect(validateCategoryName('  ')).toBe(false);
    });

    it('should reject names exceeding max length', () => {
      expect(validateCategoryName('A'.repeat(51))).toBe(false);
    });
  });

  describe('validateRefreshInterval', () => {
    it('should accept valid intervals', () => {
      expect(validateRefreshInterval(5)).toBe(true); // Min
      expect(validateRefreshInterval(60)).toBe(true); // Common
      expect(validateRefreshInterval(1440)).toBe(true); // Max (24 hours)
    });

    it('should reject intervals below minimum', () => {
      expect(validateRefreshInterval(4)).toBe(false);
      expect(validateRefreshInterval(0)).toBe(false);
      expect(validateRefreshInterval(-1)).toBe(false);
    });

    it('should reject intervals above maximum', () => {
      expect(validateRefreshInterval(1441)).toBe(false);
      expect(validateRefreshInterval(10000)).toBe(false);
    });

    it('should reject non-integer values', () => {
      expect(validateRefreshInterval(5.5)).toBe(false);
      expect(validateRefreshInterval(NaN)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('\n\ttext\n\t')).toBe('text');
    });

    it('should enforce max length', () => {
      const long = 'A'.repeat(2000);
      const result = sanitizeString(long, 1000);
      expect(result.length).toBe(1000);
    });

    it('should use default max length', () => {
      const long = 'A'.repeat(2000);
      const result = sanitizeString(long);
      expect(result.length).toBe(1000);
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });
  });

  describe('looksLikeFeed', () => {
    it('should detect RSS/Atom content types', () => {
      expect(looksLikeFeed('application/rss+xml', '')).toBe(true);
      expect(looksLikeFeed('application/atom+xml', '')).toBe(true);
      expect(looksLikeFeed('application/xml', '')).toBe(true);
      expect(looksLikeFeed('text/xml', '')).toBe(true);
    });

    it('should detect RSS markers in content', () => {
      const rss = '<rss version="2.0"><channel></channel></rss>';
      expect(looksLikeFeed(null, rss)).toBe(true);
    });

    it('should detect Atom markers in content', () => {
      const atom = '<feed xmlns="http://www.w3.org/2005/Atom"></feed>';
      expect(looksLikeFeed(null, atom)).toBe(true);
    });

    it('should reject non-feed content', () => {
      const html = '<!DOCTYPE html><html><body>Not a feed</body></html>';
      expect(looksLikeFeed('text/html', html)).toBe(false);
    });

    it('should handle null content type', () => {
      expect(looksLikeFeed(null, '<rss></rss>')).toBe(true);
      expect(looksLikeFeed(null, 'random text')).toBe(false);
    });

    it('should be case-insensitive for content type', () => {
      expect(looksLikeFeed('APPLICATION/RSS+XML', '')).toBe(true);
      expect(looksLikeFeed('text/XML', '')).toBe(true);
    });
  });
});
