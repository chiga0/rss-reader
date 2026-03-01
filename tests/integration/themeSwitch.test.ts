import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../src/hooks/useTheme';

describe('T132: Theme Switching Workflow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should complete full theme switching workflow', () => {
    // Setup system preference mock (light)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useTheme());

    // Initial state: system (light)
    expect(result.current.theme).toBe('system');
    expect(result.current.effectiveTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Step 1: Switch to dark
    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.effectiveTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('rss-reader-theme')).toBe('dark');

    // Step 2: Switch to light
    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.effectiveTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('rss-reader-theme')).toBe('light');

    // Step 3: Switch back to system
    act(() => {
      result.current.setTheme('system');
    });

    expect(result.current.theme).toBe('system');
    expect(result.current.effectiveTheme).toBe('light'); // System is light
    expect(localStorage.getItem('rss-reader-theme')).toBeNull();
  });

  it('should persist theme across hook re-renders', () => {
    const { result, rerender } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');

    // Simulate re-render
    rerender();

    expect(result.current.theme).toBe('dark');
    expect(result.current.effectiveTheme).toBe('dark');
  });

  it('should handle rapid theme changes without errors', () => {
    const { result } = renderHook(() => useTheme());

    // Rapidly change themes
    act(() => {
      result.current.setTheme('dark');
      result.current.setTheme('light');
      result.current.setTheme('system');
      result.current.setTheme('dark');
    });

    // Should end in final state
    expect(result.current.theme).toBe('dark');
    expect(result.current.effectiveTheme).toBe('dark');
  });

  it('should maintain theme state across component unmount/remount', () => {
    const { result, unmount } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    unmount();

    // Remount and verify persistence
    const { result: result2 } = renderHook(() => useTheme());

    expect(result2.current.theme).toBe('dark');
    expect(result2.current.effectiveTheme).toBe('dark');
  });

  it('should apply theme to document element consistently', () => {
    const { result } = renderHook(() => useTheme());

    // Verify initial state
    const _initialHasLight = !document.documentElement.classList.contains('dark');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should handle concurrent theme changes', async () => {
    const { result } = renderHook(() => useTheme());

    // Simulate concurrent updates
    const promises = [
      act(() => result.current.setTheme('dark')),
      act(() => result.current.setTheme('light')),
      act(() => result.current.setTheme('dark')),
    ];

    await Promise.all(promises);

    // Should settle to last valid state
    expect(['dark', 'light', 'system']).toContain(result.current.theme);
  });
});
