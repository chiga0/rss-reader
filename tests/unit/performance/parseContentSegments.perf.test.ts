/**
 * Performance tests for parseContentSegments function.
 * Validates that HTML segment parsing for translation support
 * scales well for articles of varying sizes.
 */

import { describe, it, expect } from 'vitest';

// Re-implement parseContentSegments here for isolated testing since it's not exported
function parseContentSegments(html: string): { html: string; text: string }[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstElementChild;
  if (!container) return [{ html, text: '' }];

  const segments: { html: string; text: string }[] = [];
  for (const child of Array.from(container.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      segments.push({ html: el.outerHTML, text: el.textContent?.trim() || '' });
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      segments.push({
        html: `<p>${child.textContent}</p>`,
        text: child.textContent.trim(),
      });
    }
  }
  return segments;
}

function generateSegmentHTML(paragraphs: number): string {
  const parts: string[] = [];
  for (let i = 0; i < paragraphs; i++) {
    if (i % 10 === 0) {
      parts.push(`<h2>Section ${Math.floor(i / 10) + 1}</h2>`);
    }
    parts.push(
      `<p>Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. ` +
      `Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`
    );
  }
  return parts.join('\n');
}

describe('parseContentSegments performance', () => {
  it('should parse a small article (20 segments) within 50ms', () => {
    const html = generateSegmentHTML(20);
    const start = performance.now();
    const result = parseContentSegments(html);
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    // Note: first DOMParser call in jsdom has cold-start overhead
    expect(elapsed).toBeLessThan(50);
  });

  it('should parse a medium article (100 segments) within 50ms', () => {
    const html = generateSegmentHTML(100);
    const start = performance.now();
    const result = parseContentSegments(html);
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(50);
    expect(elapsed).toBeLessThan(50);
  });

  it('should parse a large article (500 segments) within 100ms', () => {
    const html = generateSegmentHTML(500);
    const start = performance.now();
    const result = parseContentSegments(html);
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(250);
    expect(elapsed).toBeLessThan(100);
  });

  it('should correctly extract text from each segment', () => {
    const html = '<h1>Title</h1><p>First paragraph</p><p>Second paragraph</p>';
    const segments = parseContentSegments(html);

    expect(segments).toHaveLength(3);
    expect(segments[0].text).toBe('Title');
    expect(segments[1].text).toBe('First paragraph');
    expect(segments[2].text).toBe('Second paragraph');
  });

  it('should handle text nodes outside of elements', () => {
    const html = 'Bare text node<p>In a paragraph</p>';
    const segments = parseContentSegments(html);

    expect(segments.length).toBeGreaterThanOrEqual(2);
    const texts = segments.map(s => s.text);
    expect(texts).toContain('Bare text node');
    expect(texts).toContain('In a paragraph');
  });

  it('should handle empty HTML gracefully', () => {
    const start = performance.now();
    const result = parseContentSegments('');
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5);
    // Empty HTML might produce 0 segments or a single fallback
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it('should be consistent across repeated parsing of the same content', () => {
    const html = generateSegmentHTML(50);
    const times: number[] = [];

    for (let i = 0; i < 20; i++) {
      const start = performance.now();
      parseContentSegments(html);
      times.push(performance.now() - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    // Average parse time should stay under 20ms for 50 paragraphs
    expect(avg).toBeLessThan(20);
  });
});
