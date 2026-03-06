/**
 * Unit tests for readingTime utilities
 */

import { describe, it, expect } from 'vitest';
import { calculateReadingTime, formatReadingTime, detectCjkRatio } from '@utils/readingTime';

describe('calculateReadingTime', () => {
  it('returns 1 minute for empty input', () => {
    const result = calculateReadingTime('');
    expect(result.minutes).toBe(1);
    expect(result.cjkCharCount).toBe(0);
    expect(result.wordCount).toBe(0);
    expect(result.isCjkDominant).toBe(false);
  });

  it('returns 1 minute for whitespace-only input', () => {
    const result = calculateReadingTime('   ');
    expect(result.minutes).toBe(1);
  });

  it('strips HTML tags before counting words', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    const result = calculateReadingTime(html);
    expect(result.minutes).toBe(1);
    expect(result.wordCount).toBe(2);
  });

  it('returns 1 for exactly 200 words', () => {
    const words = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(words).minutes).toBe(1);
  });

  it('returns 2 for 201 words', () => {
    const words = Array(201).fill('word').join(' ');
    expect(calculateReadingTime(words).minutes).toBe(2);
  });

  it('handles complex HTML with nested tags', () => {
    const html = '<div><ul>' + Array(400).fill('<li>word</li>').join('') + '</ul></div>';
    expect(calculateReadingTime(html).minutes).toBe(2);
  });

  // CJK-specific tests
  it('detects CJK characters and calculates at 400 CPM', () => {
    // 400 CJK chars → 1 minute
    const cjkText = '这'.repeat(400);
    const result = calculateReadingTime(cjkText);
    expect(result.minutes).toBe(1);
    expect(result.cjkCharCount).toBe(400);
    expect(result.isCjkDominant).toBe(true);
  });

  it('handles 800 CJK characters (2 min)', () => {
    const cjkText = '文'.repeat(800);
    const result = calculateReadingTime(cjkText);
    expect(result.minutes).toBe(2);
    expect(result.cjkCharCount).toBe(800);
    expect(result.isCjkDominant).toBe(true);
  });

  it('handles mixed CJK and Latin content', () => {
    // 400 CJK chars (1 min) + 200 English words (1 min) = 2 min
    const mixed = '这'.repeat(400) + ' ' + Array(200).fill('word').join(' ');
    const result = calculateReadingTime(mixed);
    expect(result.minutes).toBe(2);
    expect(result.cjkCharCount).toBe(400);
    expect(result.wordCount).toBe(200);
  });

  it('detects isCjkDominant for majority CJK content', () => {
    const result = calculateReadingTime('这是一个中文测试 hello');
    expect(result.isCjkDominant).toBe(true);
  });

  it('detects isCjkDominant as false for majority Latin content', () => {
    const result = calculateReadingTime('This is an English test with one 字');
    expect(result.isCjkDominant).toBe(false);
  });

  it('handles Japanese hiragana/katakana', () => {
    const japanese = 'こんにちはカタカナ'.repeat(50);
    const result = calculateReadingTime(japanese);
    expect(result.cjkCharCount).toBeGreaterThan(0);
    expect(result.isCjkDominant).toBe(true);
  });

  it('handles Korean hangul', () => {
    const korean = '한국어'.repeat(100);
    const result = calculateReadingTime(korean);
    expect(result.cjkCharCount).toBeGreaterThan(0);
    expect(result.isCjkDominant).toBe(true);
  });
});

describe('detectCjkRatio', () => {
  it('returns 0 for empty string', () => {
    expect(detectCjkRatio('')).toBe(0);
  });

  it('returns 0 for pure Latin text', () => {
    expect(detectCjkRatio('Hello World')).toBe(0);
  });

  it('returns 1 for pure CJK text', () => {
    expect(detectCjkRatio('你好世界')).toBe(1);
  });

  it('returns ratio for mixed content', () => {
    const ratio = detectCjkRatio('你好 Hello');
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThan(1);
  });
});

describe('formatReadingTime', () => {
  it('returns English format by default', () => {
    expect(formatReadingTime(5)).toBe('5 min read');
  });

  it('returns English format when lang is undefined', () => {
    expect(formatReadingTime(3, undefined)).toBe('3 min read');
  });

  it('returns Chinese format for zh lang', () => {
    expect(formatReadingTime(5, 'zh')).toBe('5 分钟阅读');
  });

  it('returns Chinese format for zh-CN lang', () => {
    expect(formatReadingTime(5, 'zh-CN')).toBe('5 分钟阅读');
  });

  it('returns English format for en lang', () => {
    expect(formatReadingTime(10, 'en')).toBe('10 min read');
  });
});
