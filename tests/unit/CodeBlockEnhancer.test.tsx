/**
 * Unit tests for CodeBlockEnhancer component
 * Tests DOM scanning, copy button creation, clipboard operations,
 * hover visibility, cleanup, and re-scanning behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useRef } from 'react';
import { CodeBlockEnhancer } from '@components/ArticleView/CodeBlockEnhancer';

// Helper wrapper to provide a ref with pre-populated HTML
function TestWrapper({ html, deps = [] }: { html: string; deps?: unknown[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
      <CodeBlockEnhancer containerRef={containerRef} deps={deps} />
    </div>
  );
}

describe('CodeBlockEnhancer', () => {
  let originalClipboard: Clipboard;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(<TestWrapper html="<p>no code blocks</p>" />);
    // CodeBlockEnhancer returns null, so only the wrapper div and content div exist
    const enhancerOutput = container.children[0].children;
    // Should have just the content div (CodeBlockEnhancer renders null)
    expect(enhancerOutput.length).toBe(1);
  });

  it('adds copy button to pre elements', () => {
    const html = '<pre><code>const x = 1;</code></pre>';
    render(<TestWrapper html={html} />);
    const button = document.querySelector('.code-copy-btn');
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Copy');
    expect(button?.getAttribute('aria-label')).toBe('Copy code to clipboard');
  });

  it('adds copy buttons to multiple pre elements', () => {
    const html = `
      <pre><code>const a = 1;</code></pre>
      <pre><code>const b = 2;</code></pre>
      <pre><code>const c = 3;</code></pre>
    `;
    render(<TestWrapper html={html} />);
    const buttons = document.querySelectorAll('.code-copy-btn');
    expect(buttons.length).toBe(3);
  });

  it('sets position:relative on pre elements', () => {
    const html = '<pre><code>code</code></pre>';
    render(<TestWrapper html={html} />);
    const pre = document.querySelector('pre');
    expect(pre?.style.position).toBe('relative');
  });

  it('adds group class to pre elements for hover styling', () => {
    const html = '<pre><code>code</code></pre>';
    render(<TestWrapper html={html} />);
    const pre = document.querySelector('pre');
    expect(pre?.classList.contains('group')).toBe(true);
  });

  it('skips pre elements that already have copy button', () => {
    const html =
      '<pre class="group"><code>code</code><button class="code-copy-btn">Copy</button></pre>';
    render(<TestWrapper html={html} />);
    const buttons = document.querySelectorAll('.code-copy-btn');
    // Should not add a duplicate
    expect(buttons.length).toBe(1);
  });

  it('shows copy button on mouseenter', () => {
    const html = '<pre><code>code</code></pre>';
    render(<TestWrapper html={html} />);
    const button = document.querySelector('.code-copy-btn') as HTMLElement;
    const pre = document.querySelector('pre') as HTMLElement;

    expect(button.style.opacity).toBe('');
    fireEvent.mouseEnter(pre);
    expect(button.style.opacity).toBe('1');
  });

  it('hides copy button on mouseleave', () => {
    const html = '<pre><code>code</code></pre>';
    render(<TestWrapper html={html} />);
    const button = document.querySelector('.code-copy-btn') as HTMLElement;
    const pre = document.querySelector('pre') as HTMLElement;

    fireEvent.mouseEnter(pre);
    expect(button.style.opacity).toBe('1');

    fireEvent.mouseLeave(pre);
    expect(button.style.opacity).toBe('0');
  });

  it('keeps button visible during "Copied!" feedback', () => {
    const html = '<pre><code>code</code></pre>';
    render(<TestWrapper html={html} />);
    const button = document.querySelector('.code-copy-btn') as HTMLElement;
    const pre = document.querySelector('pre') as HTMLElement;

    // Simulate copied state
    button.textContent = 'Copied!';
    fireEvent.mouseLeave(pre);
    // Should not hide when showing "Copied!" feedback
    expect(button.style.opacity).not.toBe('0');
  });

  it('copies code text via clipboard API on button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const html = '<pre><code>const x = 42;</code></pre>';
    render(<TestWrapper html={html} />);
    const button = document.querySelector('.code-copy-btn') as HTMLElement;

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeText).toHaveBeenCalledWith('const x = 42;');
  });

  it('falls back to pre.textContent when no code element', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const html = '<pre>plain preformatted text</pre>';
    render(<TestWrapper html={html} />);
    const button = document.querySelector('.code-copy-btn') as HTMLElement;

    await act(async () => {
      fireEvent.click(button);
    });

    // Should copy the pre content (with button text appended since button is inside pre)
    expect(writeText).toHaveBeenCalled();
    const copiedText = writeText.mock.calls[0][0];
    expect(copiedText).toContain('plain preformatted text');
  });

  it('shows "Copied!" feedback after copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const html = '<pre><code>code</code></pre>';
    render(<TestWrapper html={html} />);
    const button = document.querySelector('.code-copy-btn') as HTMLElement;

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button.textContent).toBe('Copied!');
    expect(button.classList.contains('text-green-500')).toBe(true);
  });

  it('reverts "Copied!" feedback after 2 seconds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const html = '<pre><code>code</code></pre>';
    render(<TestWrapper html={html} />);
    const button = document.querySelector('.code-copy-btn') as HTMLElement;

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button.textContent).toBe('Copied!');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button.textContent).toBe('Copy');
    expect(button.classList.contains('text-green-500')).toBe(false);
  });

  it('cleans up buttons on unmount', () => {
    const html = '<pre><code>code</code></pre>';
    const { unmount } = render(<TestWrapper html={html} />);

    expect(document.querySelectorAll('.code-copy-btn').length).toBe(1);

    unmount();

    // After unmount, the buttons are cleaned up (the container is also removed)
    expect(document.querySelectorAll('.code-copy-btn').length).toBe(0);
  });

  it('does nothing when containerRef is null', () => {
    // Render CodeBlockEnhancer with a ref that has null current
    function NullRefWrapper() {
      const ref = useRef<HTMLDivElement>(null);
      return <CodeBlockEnhancer containerRef={ref} />;
    }
    const { container } = render(<NullRefWrapper />);
    // Should render nothing and not throw
    expect(container).toBeDefined();
  });
});
