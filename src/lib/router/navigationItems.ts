/**
 * Navigation items configuration
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import { Rss, Star, Clock, Settings } from 'lucide-react';
import type { NavigationItem } from '@/types/navigation';

/**
 * Navigation items for the application
 * Used by Navbar, MobileNav, and DesktopNav components
 */
export const navigationItems: NavigationItem[] = [
  // Main navigation group
  {
    id: 'feeds',
    label: 'Feeds',
    icon: Rss,
    path: '/feeds',
    group: 'main',
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: Star,
    path: '/favorites',
    group: 'main',
  },
  {
    id: 'history',
    label: 'History',
    icon: Clock,
    path: '/history',
    group: 'main',
  },
  
  // User navigation group
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    group: 'user',
  },
];
