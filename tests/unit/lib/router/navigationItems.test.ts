/**
 * Unit tests for navigationItems configuration
 * Feature: Replace global components with Shadcn UI
 * Test-First Development: These tests MUST fail before implementation
 */

import { describe, it, expect } from 'vitest';
import { navigationItems } from '@/lib/router/navigationItems';

describe('Navigation Items', () => {
  describe('Item Structure', () => {
    it('should export navigationItems array', () => {
      expect(navigationItems).toBeDefined();
      expect(Array.isArray(navigationItems)).toBe(true);
      expect(navigationItems.length).toBeGreaterThan(0);
    });

    it('should have all required main navigation items', () => {
      const mainItems = navigationItems.filter(item => item.group === 'main');
      const paths = mainItems.map(item => item.path);
      
      expect(paths).toContain('/feeds');
      expect(paths).toContain('/favorites');
      expect(paths).toContain('/history');
    });

    it('should have settings in user group', () => {
      const userItems = navigationItems.filter(item => item.group === 'user');
      const paths = userItems.map(item => item.path);
      
      expect(paths).toContain('/settings');
    });

    it('should have valid structure for each item', () => {
      navigationItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('path');
        expect(item).toHaveProperty('group');
        
        expect(typeof item.id).toBe('string');
        expect(typeof item.label).toBe('string');
        expect(typeof item.path).toBe('string');
        expect(['main', 'user']).toContain(item.group);
      });
    });
  });

  describe('Icon Imports', () => {
    it('should have icons for all navigation items', () => {
      navigationItems.forEach(item => {
        expect(item.icon).toBeDefined();
        // Icon should be a React element (from lucide-react)
        expect(item.icon).toBeTruthy();
      });
    });
  });

  describe('Path Validation', () => {
    it('should have valid paths starting with /', () => {
      navigationItems.forEach(item => {
        expect(item.path).toMatch(/^\//);
      });
    });

    it('should not have duplicate paths', () => {
      const paths = navigationItems.map(item => item.path);
      const uniquePaths = new Set(paths);
      
      expect(paths.length).toBe(uniquePaths.size);
    });

    it('should not have duplicate ids', () => {
      const ids = navigationItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('Badge Support', () => {
    it('should allow badge property', () => {
      // Find item that might have badge (feeds)
      const feedsItem = navigationItems.find(item => item.path === '/feeds');
      
      if (feedsItem) {
        // Badge can be undefined or a number
        if (feedsItem.badge !== undefined) {
          expect(typeof feedsItem.badge).toBe('number');
        }
      }
    });
  });

  describe('Grouping', () => {
    it('should have main group items', () => {
      const mainItems = navigationItems.filter(item => item.group === 'main');
      expect(mainItems.length).toBeGreaterThan(0);
    });

    it('should have user group items', () => {
      const userItems = navigationItems.filter(item => item.group === 'user');
      expect(userItems.length).toBeGreaterThan(0);
    });

    it('should have all items in either main or user group', () => {
      navigationItems.forEach(item => {
        expect(['main', 'user']).toContain(item.group);
      });
    });
  });
});
