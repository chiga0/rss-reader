/**
 * Unit tests for code block copy functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Code block copy functionality', () => {
  let originalClipboard: Clipboard;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
  });

  it('copies code text to clipboard using Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    await navigator.clipboard.writeText('const x = 1;');
    expect(writeText).toHaveBeenCalledWith('const x = 1;');
  });

  it('handles clipboard API failure gracefully', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    await expect(navigator.clipboard.writeText('code')).rejects.toThrow('Permission denied');
  });

  it('extracts code text from pre>code elements', () => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = 'function hello() { return "world"; }';
    pre.appendChild(code);

    const codeElement = pre.querySelector('code');
    expect(codeElement?.textContent).toBe('function hello() { return "world"; }');
  });

  it('handles pre elements without code child', () => {
    const pre = document.createElement('pre');
    pre.textContent = 'plain preformatted text';

    const codeElement = pre.querySelector('code');
    expect(codeElement).toBeNull();
    // Should fall back to pre.textContent
    expect(pre.textContent).toBe('plain preformatted text');
  });
});
