/**
 * Test setup file for Vitest
 * Initializes testing environment, mocks, and MSW
 */

import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Sample RSS feed XML for tests
const sampleRssFeed = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Sample RSS Feed</title>
    <link>https://example.com</link>
    <description>Sample RSS feed for testing</description>
    <item>
      <title>Article 1</title>
      <link>https://example.com/article1</link>
      <description>Description of article 1</description>
      <pubDate>Sat, 25 Jan 2026 12:00:00 GMT</pubDate>
      <author>Author 1</author>
      <enclosure url="https://example.com/image1.jpg" type="image/jpeg" length="12345" />
    </item>
    <item>
      <title>Article 2</title>
      <link>https://example.com/article2</link>
      <description>Description of article 2</description>
      <pubDate>Fri, 24 Jan 2026 12:00:00 GMT</pubDate>
      <author>Author 2</author>
    </item>
  </channel>
</rss>`;

// MSW Server for API mocking
export const server = setupServer(
  // Mock CORS proxy requests (used in development/tests)
  http.get('https://api.allorigins.win/get', ({ request }) => {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return HttpResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Mock different feeds based on URL
    if (targetUrl.includes('example.com/feed.xml')) {
      return HttpResponse.json({
        contents: sampleRssFeed,
        status: { url: targetUrl, content_type: 'application/rss+xml' }
      });
    }
    
    if (targetUrl.includes('unreachable-feed.xml')) {
      return HttpResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    
    if (targetUrl.includes('bad-feed.xml')) {
      return HttpResponse.json({
        contents: 'Invalid XML <unclosed',
        status: { url: targetUrl }
      });
    }

    // Default: return RSS feed
    return HttpResponse.json({
      contents: sampleRssFeed,
      status: { url: targetUrl, content_type: 'application/rss+xml' }
    });
  }),

  // Also mock direct feed requests (for non-CORS scenarios)
  http.get('https://example.com/feed.xml', () => {
    return HttpResponse.text(sampleRssFeed, {
      headers: { 'Content-Type': 'application/rss+xml' }
    });
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
