/**
 * Unit tests for readingTime utility
 */

import { describe, it, expect } from 'vitest';
import { calculateReadingTime, formatReadingTime } from '@utils/readingTime';

describe('calculateReadingTime', () => {
  it('should return 1 for empty content', () => {
    expect(calculateReadingTime('')).toBe(1);
  });

  it('should return 1 for very short content', () => {
    expect(calculateReadingTime('Hello world')).toBe(1);
  });

  it('should return 1 for content with fewer than 200 words', () => {
    const text = 'word '.repeat(199);
    expect(calculateReadingTime(text)).toBe(1);
  });

  it('should return 1 for exactly 200 words', () => {
    const text = 'word '.repeat(200);
    expect(calculateReadingTime(text)).toBe(1);
  });

  it('should return 2 for 201 words', () => {
    const text = 'word '.repeat(201);
    expect(calculateReadingTime(text)).toBe(2);
  });

  it('should return 5 for 1000 words', () => {
    const text = 'word '.repeat(1000);
    expect(calculateReadingTime(text)).toBe(5);
  });

  it('should strip HTML tags before counting words', () => {
    // 400 words wrapped in HTML — should be 2 minutes
    const words = 'word '.repeat(400);
    const html = `<p>${words}</p>`;
    expect(calculateReadingTime(html)).toBe(2);
  });

  it('should handle content with only HTML tags and no words', () => {
    expect(calculateReadingTime('<p></p><br/>')).toBe(1);
  });

  it('should handle complex HTML with mixed content', () => {
    const html = '<h1>Title</h1><p>Some <strong>bold</strong> text</p>';
    // "Title Some bold text" = 4 words → 1 min
    expect(calculateReadingTime(html)).toBe(1);
  });
});

describe('formatReadingTime', () => {
  it('should format 1 minute correctly', () => {
    expect(formatReadingTime(1)).toBe('1 min read');
  });

  it('should format multiple minutes correctly', () => {
    expect(formatReadingTime(5)).toBe('5 min read');
    expect(formatReadingTime(12)).toBe('12 min read');
  });
});
