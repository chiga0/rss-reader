import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../src/hooks/useTheme';

describe('useTheme', () => {
  let originalMatchMedia: typeof window.matchMedia;
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Save original matchMedia
    originalMatchMedia = window.matchMedia;

    // Setup matchMedia mock
    matchMediaMock = vi.fn((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    // Restore original matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  describe('T130: Theme hook with system preference', () => {
    it('should default to system theme preference (dark)', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('should default to system theme preference (light)', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should allow manual theme override', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('should switch back to system tracking when set to system', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme());

      // Override to light
      act(() => {
        result.current.setTheme('light');
      });
      expect(result.current.effectiveTheme).toBe('light');

      // Switch back to system
      act(() => {
        result.current.setTheme('system');
      });
      expect(result.current.effectiveTheme).toBe('dark'); // System is dark
    });

    it('should listen to system preference changes', () => {
      const listeners: Array<(event: MediaQueryListEvent) => void> = [];
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, listener: any) => {
          if (event === 'change') {
            listeners.push(listener);
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.effectiveTheme).toBe('light');

      // Simulate system preference change to dark
      act(() => {
        listeners.forEach(listener =>
          listener({ matches: true, media: '(prefers-color-scheme: dark)' } as MediaQueryListEvent)
        );
      });

      expect(result.current.effectiveTheme).toBe('dark');
    });
  });

  describe('T131: Theme persistence in localStorage', () => {
    it('should persist theme preference to localStorage', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should load theme preference from localStorage on mount', () => {
      localStorage.setItem('theme', 'light');

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should handle invalid localStorage values gracefully', () => {
      localStorage.setItem('theme', 'invalid-theme');

      const { result } = renderHook(() => useTheme());

      // Should fall back to system
      expect(result.current.theme).toBe('system');
    });

    it('should clear localStorage when set to system', () => {
      localStorage.setItem('theme', 'dark');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('system');
      });

      expect(localStorage.getItem('theme')).toBeNull();
    });
  });

  describe('T134: Performance - Theme changes apply instantly', () => {
    it('should apply theme change within 100ms', () => {
      const { result } = renderHook(() => useTheme());

      const startTime = performance.now();

      act(() => {
        result.current.setTheme('dark');
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
      expect(result.current.theme).toBe('dark');
    });

    it('should update document class immediately', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      act(() => {
        result.current.setTheme('light');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
