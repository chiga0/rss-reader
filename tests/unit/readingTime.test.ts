/**
 * Unit tests for readingTime utilities
 */

import { describe, it, expect } from 'vitest';
import { calculateReadingTime, formatReadingTime } from '@utils/readingTime';

describe('calculateReadingTime', () => {
  it('returns 1 for empty input', () => {
    expect(calculateReadingTime('')).toBe(1);
  });

  it('returns 1 for whitespace-only input', () => {
    expect(calculateReadingTime('   ')).toBe(1);
  });

  it('strips HTML tags before counting words', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    expect(calculateReadingTime(html)).toBe(1);
  });

  it('returns 1 for exactly 200 words', () => {
    const words = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(1);
  });

  it('returns 2 for 201 words', () => {
    const words = Array(201).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(2);
  });

  it('handles complex HTML with nested tags', () => {
    const html = '<div><ul>' + Array(400).fill('<li>word</li>').join('') + '</ul></div>';
    expect(calculateReadingTime(html)).toBe(2);
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
