/**
 * Navigation and routing type definitions
 * Created: 2026-02-05
 * Feature: Replace global components with Shadcn UI
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme preference persisted in localStorage
 */
export interface ThemePreference {
  mode: ThemeMode;
  systemPreference?: 'light' | 'dark';
}

/**
 * Navigation item for primary app sections
 */
export interface NavigationItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Target route path */
  path: string;
  /** Badge count (e.g., unread count) */
  badge?: number;
  /** Navigation group (main, user, etc.) */
  group?: 'main' | 'user';
}

/**
 * Route definition with metadata
 */
export interface Route {
  /** Route path pattern */
  path: string;
  /** Route component */
  element: ReactNode;
  /** Loader function for data fetching */
  loader?: (args: any) => Promise<unknown>;
  /** Error boundary component */
  errorElement?: ReactNode;
  /** Route metadata */
  handle?: RouteHandle;
}

/**
 * Route metadata for title and breadcrumbs
 */
export interface RouteHandle {
  /** Page title */
  title?: string;
  /** Breadcrumb title (if different from title) */
  crumb?: string;
  /** Icon identifier */
  icon?: string;
}

/**
 * Navigation state
 */
export interface NavigationState {
  /** Currently active route path */
  activeRoute: string;
  /** Is mobile nav drawer open */
  isMobileNavOpen: boolean;
  /** Navigation items list */
  items: NavigationItem[];
}
