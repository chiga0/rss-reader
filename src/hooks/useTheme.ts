/**
 * Theme Hook
 * Manages theme state (light/dark/system) with localStorage persistence
 */

import { useState, useEffect } from 'react';
import { logger } from '@lib/logger';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'rss-reader-theme';

/**
 * Get system color scheme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get resolved theme (system -> light/dark)
 */
function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

/**
 * Apply theme to document
 */
function applyTheme(theme: 'light' | 'dark'): void {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  logger.debug('Applied theme', { theme });
}

/**
 * Hook for theme management
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    // Validate stored value
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    return getResolvedTheme(theme);
  });

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newResolvedTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolvedTheme);
        applyTheme(newResolvedTheme);
        logger.info('System theme changed', { theme: newResolvedTheme });
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  // Apply theme on mount and when changed
  useEffect(() => {
    const resolved = getResolvedTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [theme]);

  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Clear localStorage for system theme, otherwise persist
    if (newTheme === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
    
    logger.info('Theme changed', { theme: newTheme });
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    effectiveTheme: resolvedTheme, // Alias for compatibility
    setTheme,
    toggleTheme,
  };
}
