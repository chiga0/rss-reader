/**
 * Theme Provider component for Shadcn UI dark mode
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeMode } from '@/types/navigation';
import { getSystemTheme, applyTheme } from './themeUtils';

interface ThemeContextValue {
  /** Current theme mode setting */
  mode: ThemeMode;
  /** System's preferred theme */
  systemPreference: 'light' | 'dark';
  /** Resolved theme (computed from mode and system preference) */
  resolvedTheme: 'light' | 'dark';
  /** Function to change theme mode */
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

/**
 * Theme Provider component
 * Provides theme context for the entire application
 * Manages theme mode state, system preference detection, and localStorage persistence
 */
export function ThemeProvider({ children, defaultMode = 'system' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('theme') as ThemeMode | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return defaultMode;
  });

  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(() => {
    return getSystemTheme();
  });

  // Compute resolved theme
  const resolvedTheme: 'light' | 'dark' =
    mode === 'system' ? systemPreference : mode;

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply theme whenever resolved theme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme', newMode);
  };

  const value: ThemeContextValue = {
    mode,
    systemPreference,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * Must be used within a ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
