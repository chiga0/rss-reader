/**
 * Unit tests for theme utility functions
 * Feature: Replace global components with Shadcn UI
 * Test-First Development: These tests MUST fail before implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSystemTheme, applyTheme, initTheme } from '@/lib/theme/themeUtils';

describe('Theme Utilities', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    localStorage.clear();
  });

  describe('getSystemTheme', () => {
    it('should return dark when system prefers dark color scheme', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getSystemTheme()).toBe('dark');
    });

    it('should return light when system prefers light color scheme', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getSystemTheme()).toBe('light');
    });

    it('should return light as default when matchMedia is not supported', () => {
      const originalMatchMedia = window.matchMedia;
      // @ts-expect-error - Testing unsupported environment
      delete window.matchMedia;

      expect(getSystemTheme()).toBe('light');

      window.matchMedia = originalMatchMedia;
    });
  });

  describe('applyTheme', () => {
    it('should add dark class to HTML element', () => {
      applyTheme('dark');
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('should add light class to HTML element', () => {
      applyTheme('light');
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should remove previous theme class before adding new one', () => {
      document.documentElement.classList.add('dark');
      
      applyTheme('light');
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should update meta theme-color for PWA', () => {
      // Create meta tag if it doesn't exist
      let metaTag = document.querySelector('meta[name="theme-color"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'theme-color');
        document.head.appendChild(metaTag);
      }

      applyTheme('dark');
      
      expect(metaTag.getAttribute('content')).toBe('#000000');

      applyTheme('light');
      
      expect(metaTag.getAttribute('content')).toBe('#ffffff');
    });

    it('should create meta theme-color tag if it does not exist', () => {
      // Remove existing meta tag
      const existingMeta = document.querySelector('meta[name="theme-color"]');
      if (existingMeta) {
        existingMeta.remove();
      }

      applyTheme('dark');
      
      const metaTag = document.querySelector('meta[name="theme-color"]');
      expect(metaTag).toBeTruthy();
      expect(metaTag?.getAttribute('content')).toBe('#000000');
    });
  });

  describe('initTheme', () => {
    it('should apply theme from localStorage if present', () => {
      localStorage.setItem('theme', 'dark');
      
      initTheme();
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should apply system theme when localStorage has system mode', () => {
      localStorage.setItem('theme', 'system');
      
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      initTheme();
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should apply system theme when no localStorage value', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      initTheme();
      
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    it('should handle invalid localStorage value gracefully', () => {
      localStorage.setItem('theme', 'invalid-theme');
      
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      initTheme();
      
      // Should fall back to system theme
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('FOUC Prevention', () => {
    it('should execute synchronously to prevent flash', () => {
      localStorage.setItem('theme', 'dark');
      
      const startTime = Date.now();
      initTheme();
      const endTime = Date.now();
      
      // Should execute very quickly (< 10ms)
      expect(endTime - startTime).toBeLessThan(10);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should not cause layout shift when applying theme', () => {
      const initialHeight = document.documentElement.scrollHeight;
      
      applyTheme('dark');
      
      const finalHeight = document.documentElement.scrollHeight;
      
      // Height should remain same (no layout shift)
      expect(finalHeight).toBe(initialHeight);
    });
  });
});
