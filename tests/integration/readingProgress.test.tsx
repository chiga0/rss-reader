/**
 * Integration test: Reading Progress Feature
 * Tests the reading progress bar behavior integrated with the useReadingProgress hook
 * Validates the complete scroll tracking pipeline
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useReadingProgress } from '@hooks/useReadingProgress';
import { ReadingProgressBar } from '@components/ArticleView/ReadingProgressBar';

describe('Reading Progress Integration', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafIdCounter = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafIdCounter = 0;

    // Mock rAF to queue callbacks and flush them manually
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return ++rafIdCounter;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb(0));
  }

  function setScrollState(scrollTop: number, scrollHeight: number, clientHeight: number) {
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: scrollTop,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: scrollHeight,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: clientHeight,
      configurable: true,
    });
  }

  it('hook computes progress correctly through scroll sequence', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    setScrollState(0, 2000, 800);

    const { result } = renderHook(() => useReadingProgress());

    // Flush initial rAF from useEffect
    act(() => flushRaf());
    expect(result.current.progress).toBe(0);
    expect(result.current.isFullyVisible).toBe(false);

    // Scroll to midpoint and trigger handler
    setScrollState(600, 2000, 800);
    act(() => {
      const scrollCall = addSpy.mock.calls.find((c) => c[0] === 'scroll');
      if (scrollCall) (scrollCall[1] as EventListener)(new Event('scroll'));
      flushRaf();
    });
    expect(result.current.progress).toBe(0.5);

    // Scroll to end
    setScrollState(1200, 2000, 800);
    act(() => {
      const scrollCall = addSpy.mock.calls.find((c) => c[0] === 'scroll');
      if (scrollCall) (scrollCall[1] as EventListener)(new Event('scroll'));
      flushRaf();
    });
    expect(result.current.progress).toBe(1);
  });

  it('hides progress bar for short content (fully visible)', () => {
    setScrollState(0, 500, 800);
    const { container } = render(<ReadingProgressBar />);
    act(() => flushRaf());
    expect(container.innerHTML).toBe('');
  });

  it('renders progress bar for scrollable content', () => {
    setScrollState(0, 2000, 800);
    render(<ReadingProgressBar />);
    act(() => flushRaf());
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('handles over-scroll by clamping to 1.0', () => {
    setScrollState(5000, 2000, 800);
    renderHook(() => useReadingProgress());
    const { result } = renderHook(() => useReadingProgress());
    act(() => flushRaf());
    expect(result.current.progress).toBe(1);
  });

  it('displays 3px bar with scaleX transform', () => {
    setScrollState(0, 2000, 800);
    render(<ReadingProgressBar />);
    act(() => flushRaf());

    const bar = screen.getByRole('progressbar');
    expect(bar.className).toContain('h-[3px]');
    expect(bar.className).toContain('fixed');

    const innerBar = bar.firstChild as HTMLElement;
    expect(innerBar.style.transform).toBe('scaleX(0)');
    expect(innerBar.style.transformOrigin).toBe('left');
  });

  it('provides accessible ARIA attributes', () => {
    setScrollState(0, 2000, 800);
    render(<ReadingProgressBar />);
    act(() => flushRaf());

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-label', 'Reading progress');
  });

  it('registers passive scroll listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useReadingProgress());

    const scrollCall = addSpy.mock.calls.find((c) => c[0] === 'scroll');
    expect(scrollCall).toBeDefined();
    expect(scrollCall![2]).toEqual({ passive: true });
  });

  it('cleans up scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useReadingProgress());

    unmount();

    const removeCall = removeSpy.mock.calls.find((c) => c[0] === 'scroll');
    expect(removeCall).toBeDefined();
  });
});
