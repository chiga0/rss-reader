/**
 * Performance tests for HTML sanitization utility.
 * Ensures sanitizeHTML completes within acceptable time budgets
 * even for large or complex article content.
 */

import { describe, it, expect } from 'vitest';
import { sanitizeHTML } from '@utils/sanitize';

/** Generate a realistic article HTML string with the given number of paragraphs. */
function generateArticleHTML(paragraphs: number): string {
  const parts: string[] = [];
  parts.push('<h1>Test Article Title</h1>');
  for (let i = 0; i < paragraphs; i++) {
    if (i % 5 === 0) {
      parts.push(`<h2>Section ${Math.floor(i / 5) + 1}</h2>`);
    }
    parts.push(
      `<p>This is paragraph ${i + 1} with <strong>bold text</strong>, <em>italic text</em>, ` +
      `and a <a href="https://example.com/link-${i}">link</a>. ` +
      `It also contains an <img src="https://example.com/image-${i}.jpg" alt="image ${i}" /> tag.</p>`
    );
  }
  parts.push('<table><thead><tr><th>Col A</th><th>Col B</th></tr></thead>');
  parts.push('<tbody><tr><td>Data 1</td><td>Data 2</td></tr></tbody></table>');
  return parts.join('\n');
}

describe('sanitizeHTML performance', () => {
  // Note: jsdom's DOMParser is significantly slower than browser DOMParser.
  // Thresholds are calibrated for CI/jsdom. Real browser perf is ~10x faster.

  it('should sanitize a small article (10 paragraphs) within 200ms', () => {
    const html = generateArticleHTML(10);
    const start = performance.now();
    const result = sanitizeHTML(html);
    const elapsed = performance.now() - start;

    expect(result).toContain('paragraph');
    expect(elapsed).toBeLessThan(200);
  });

  it('should sanitize a medium article (100 paragraphs) within 2000ms', () => {
    const html = generateArticleHTML(100);
    const start = performance.now();
    const result = sanitizeHTML(html);
    const elapsed = performance.now() - start;

    expect(result).toContain('paragraph');
    expect(elapsed).toBeLessThan(2000);
  });

  it('should sanitize a large article (200 paragraphs) within 10000ms', () => {
    const html = generateArticleHTML(200);
    const start = performance.now();
    const result = sanitizeHTML(html);
    const elapsed = performance.now() - start;

    expect(result).toContain('paragraph');
    expect(elapsed).toBeLessThan(10000);
  }, 15000);

  it('should strip dangerous content without significant overhead', () => {
    const dangerousHtml =
      '<script>alert("xss")</script>' +
      '<p onclick="steal()">Safe text</p>' +
      '<iframe src="evil.com"></iframe>' +
      '<img src="x" onerror="alert(1)" />' +
      generateArticleHTML(50);

    const start = performance.now();
    const result = sanitizeHTML(dangerousHtml);
    const elapsed = performance.now() - start;

    expect(result).not.toContain('<script');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('onerror');
    expect(result).toContain('Safe text');
    expect(elapsed).toBeLessThan(1000);
  });

  it('should have consistent performance across repeated calls', () => {
    const html = generateArticleHTML(50);
    const times: number[] = [];

    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      sanitizeHTML(html);
      times.push(performance.now() - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);

    // Average should be under 500ms in jsdom, no single call should spike beyond 2s
    expect(avg).toBeLessThan(500);
    expect(max).toBeLessThan(2000);
  });
});
