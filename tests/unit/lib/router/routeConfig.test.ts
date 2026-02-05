/**
 * Unit tests for route configuration
 * Feature: Replace global components with Shadcn UI
 * Test-First Development: These tests MUST fail before implementation
 */

import { describe, it, expect } from 'vitest';
import { routes } from '@/lib/router/routeConfig.tsx';

describe('Route Configuration', () => {
  describe('Route Definitions', () => {
    it('should export routes array', () => {
      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
    });

    it('should have all required routes', () => {
      const routePaths = routes.map(r => r.path);
      
      expect(routePaths).toContain('/feeds');
      expect(routePaths).toContain('/feeds/:feedId');
      expect(routePaths).toContain('/articles/:articleId');
      expect(routePaths).toContain('/favorites');
      expect(routePaths).toContain('/history');
      expect(routePaths).toContain('/settings');
      expect(routePaths).toContain('*'); // 404 route
    });

    it('should not have duplicate paths', () => {
      const paths = routes.map(r => r.path);
      const uniquePaths = new Set(paths);
      
      expect(paths.length).toBe(uniquePaths.size);
    });

    it('should have valid path patterns', () => {
      routes.forEach(route => {
        expect(route.path).toBeDefined();
        expect(typeof route.path).toBe('string');
        expect(route.path.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Loader Signatures', () => {
    it('should have loader for feeds route', () => {
      const feedsRoute = routes.find(r => r.path === '/feeds');
      expect(feedsRoute?.loader).toBeDefined();
    });

    it('should have loader for feed detail route', () => {
      const feedDetailRoute = routes.find(r => r.path === '/feeds/:feedId');
      expect(feedDetailRoute?.loader).toBeDefined();
    });

    it('should have loader for article detail route', () => {
      const articleDetailRoute = routes.find(r => r.path === '/articles/:articleId');
      expect(articleDetailRoute?.loader).toBeDefined();
    });

    it('should not have loader for static routes', () => {
      const favoritesRoute = routes.find(r => r.path === '/favorites');
      const historyRoute = routes.find(r => r.path === '/history');
      const settingsRoute = routes.find(r => r.path === '/settings');
      
      expect(favoritesRoute?.loader).toBeUndefined();
      expect(historyRoute?.loader).toBeUndefined();
      expect(settingsRoute?.loader).toBeUndefined();
    });
  });

  describe('Handle Metadata Validation', () => {
    it('should have handle metadata for all routes', () => {
      routes.forEach(route => {
        if (route.path !== '*') {
          expect(route.handle).toBeDefined();
        }
      });
    });

    it('should have title in handle metadata', () => {
      const feedsRoute = routes.find(r => r.path === '/feeds');
      expect(feedsRoute?.handle?.title).toBeDefined();
      expect(typeof feedsRoute?.handle?.title).toBe('string');
    });

    it('should have icon in handle metadata for nav routes', () => {
      const feedsRoute = routes.find(r => r.path === '/feeds');
      expect(feedsRoute?.handle?.icon).toBeDefined();
      expect(typeof feedsRoute?.handle?.icon).toBe('string');
    });
  });

  describe('Component References', () => {
    it('should have component for all routes', () => {
      routes.forEach(route => {
        expect(route.element).toBeDefined();
      });
    });
  });
});
