/**
 * Example unit test for feed validation
 * Demonstrates test-first approach for services
 */

import { describe, it, expect } from 'vitest';
import { validateRssUrl } from '@services/feedService';

describe('feedService - validateRssUrl', () => {
  it('should accept valid HTTP URLs', () => {
    expect(validateRssUrl('http://example.com/feed.xml')).toBe(true);
  });

  it('should accept valid HTTPS URLs', () => {
    expect(validateRssUrl('https://example.com/feed.xml')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(validateRssUrl('not-a-url')).toBe(false);
  });

  it('should reject URLs without protocol', () => {
    expect(validateRssUrl('example.com/feed.xml')).toBe(false);
  });

  it('should reject URLs with wrong protocol', () => {
    expect(validateRssUrl('ftp://example.com/feed.xml')).toBe(false);
  });

  it('should reject empty strings', () => {
    expect(validateRssUrl('')).toBe(false);
  });
});
