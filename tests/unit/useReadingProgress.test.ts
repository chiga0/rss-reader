/**
 * Unit tests for useReadingProgress hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReadingProgress } from '@hooks/useReadingProgress';

describe('useReadingProgress', () => {
  let addEventSpy: ReturnType<typeof vi.spyOn>;
  let removeEventSpy: ReturnType<typeof vi.spyOn>;
  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    addEventSpy = vi.spyOn(window, 'addEventListener');
    removeEventSpy = vi.spyOn(window, 'removeEventListener');
    // Mock requestAnimationFrame to capture and run callback synchronously
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb;
      cb(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    rafCallback = null;
    vi.restoreAllMocks();
  });

  it('returns initial progress of 0', () => {
    // Set up document so there's scrollable content
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 0,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useReadingProgress());
    expect(result.current.progress).toBe(0);
  });

  it('returns isFullyVisible true when content fits in viewport', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 0,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useReadingProgress());

    expect(result.current.isFullyVisible).toBe(true);
    expect(result.current.progress).toBe(1);
  });

  it('adds scroll event listener with passive option', () => {
    renderHook(() => useReadingProgress());

    const scrollCall = addEventSpy.mock.calls.find((call) => call[0] === 'scroll');
    expect(scrollCall).toBeDefined();
    expect(scrollCall![2]).toEqual({ passive: true });
  });

  it('cleans up scroll listener on unmount', () => {
    const { unmount } = renderHook(() => useReadingProgress());
    unmount();

    const removeCall = removeEventSpy.mock.calls.find((call) => call[0] === 'scroll');
    expect(removeCall).toBeDefined();
  });

  it('calculates progress based on scroll position', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 600,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useReadingProgress());

    act(() => {
      const scrollHandler = addEventSpy.mock.calls.find((call) => call[0] === 'scroll');
      if (scrollHandler) {
        (scrollHandler[1] as EventListener)(new Event('scroll'));
      }
    });

    // 600 / (2000 - 800) = 0.5
    expect(result.current.progress).toBe(0.5);
    expect(result.current.isFullyVisible).toBe(false);
  });

  it('clamps progress between 0 and 1', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 1500,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useReadingProgress());

    act(() => {
      const scrollHandler = addEventSpy.mock.calls.find((call) => call[0] === 'scroll');
      if (scrollHandler) {
        (scrollHandler[1] as EventListener)(new Event('scroll'));
      }
    });

    // 1500 / (2000 - 800) = 1.25, clamped to 1
    expect(result.current.progress).toBe(1);
  });
});
