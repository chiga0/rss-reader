/**
 * Theme utility functions for Shadcn UI integration
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import type { ThemeMode } from '@/types/navigation';

/**
 * Get system theme preference from matchMedia
 * @returns 'light' or 'dark' based on system preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme to HTML element and update PWA manifest theme-color
 * @param theme - The theme to apply ('light' or 'dark')
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  // Remove previous theme classes
  document.documentElement.classList.remove('light', 'dark');
  
  // Add new theme class
  document.documentElement.classList.add(theme);

  // Update PWA manifest theme-color
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }

  // Set theme color based on theme
  const themeColor = theme === 'dark' ? '#000000' : '#ffffff';
  metaThemeColor.setAttribute('content', themeColor);
}

/**
 * Initialize theme on app load to prevent FOUC (Flash of Unstyled Content)
 * This should be called inline in index.html before React renders
 */
export function initTheme(): void {
  const storedTheme = localStorage.getItem('theme') as ThemeMode | null;
  
  let resolvedTheme: 'light' | 'dark';

  if (storedTheme === 'light' || storedTheme === 'dark') {
    resolvedTheme = storedTheme;
  } else {
    // For 'system' or invalid/missing values, use system preference
    resolvedTheme = getSystemTheme();
  }

  applyTheme(resolvedTheme);
}
