/**
 * Test setup file for Vitest
 * Initializes testing environment, mocks, and MSW
 */

import 'fake-indexeddb/auto';
import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// MSW Server for API mocking
export const server = setupServer(
  // Default handlers - can be overridden in tests
  http.get('https://example.com/feed.xml', () => {
    return HttpResponse.text(
      `<?xml version="1.0"?>
      <rss version="2.0">
        <channel>
          <title>Mock Feed</title>
          <link>https://example.com</link>
          <description>Mocked RSS feed</description>
          <item>
            <title>Mock Article</title>
            <link>https://example.com/article</link>
            <description>Mock description</description>
            <pubDate>Sat, 25 Jan 2026 12:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>`,
      { headers: { 'Content-Type': 'application/rss+xml' } }
    );
  })
);

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn(),
    controller: null,
    ready: Promise.resolve({}),
    addEventListener: vi.fn(),
  },
  writable: true,
});

// Note: IndexedDB is mocked by 'fake-indexeddb/auto' import at the top

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: {
    permission: 'default',
    requestPermission: vi.fn(),
  },
  writable: true,
});
