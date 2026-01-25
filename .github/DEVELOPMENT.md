# Development Guide

This guide covers day-to-day development workflows, tooling setup, and best practices for the RSS Reader PWA project. For governance and non-negotiable principles, refer to [`.specify/memory/constitution.md`](../.specify/memory/constitution.md).

## Quick Start

### Prerequisites

- Node.js 18+ ([install](https://nodejs.org))
- npm or pnpm ([pnpm recommended](https://pnpm.io))
- Git 2.30+

### Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd rss-reader

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
```

The app will be available at `http://localhost:5173` (Vite default).

## Project Structure

```
rss-reader/
├── src/
│   ├── components/          # Reusable UI components (responsive)
│   ├── pages/              # Page-level views (FeedList, ArticleDetail, Settings)
│   ├── services/           # Business logic (RSS parsing, feed management)
│   ├── models/             # TypeScript interfaces and data types
│   ├── utils/              # Helpers (validators, formatters, date utilities)
│   ├── hooks/              # Custom React hooks (useFeeds, useFavorites, etc.)
│   ├── styles/             # Global CSS/SCSS and breakpoint utilities
│   ├── workers/            # Service Worker and background sync logic
│   ├── lib/                # PWA utilities (offline detection, sync manager)
│   └── main.tsx           # Application entry point
│
├── tests/
│   ├── unit/               # Unit tests (services, utils, hooks)
│   ├── integration/        # Integration tests (user workflows, API interactions)
│   └── e2e/               # End-to-end tests (Playwright, full user journeys)
│
├── public/
│   ├── manifest.json       # Web App Manifest (PWA metadata)
│   ├── service-worker.js   # Service Worker registration
│   └── icons/             # App icons (192x192, 512x512)
│
├── .specify/               # Project governance and templates
│   ├── memory/constitution.md
│   └── templates/
│
└── vite.config.ts         # Vite build configuration
```

## Development Workflow

### 1. Feature Branches

Create a feature branch for each task:

```bash
git checkout -b 001-add-rss-subscriptions
# Format: [###-feature-name] where ### is a ticket/story ID
```

### 2. Test-First Workflow (MANDATORY per Constitution)

Every feature MUST follow Test-First Development:

```bash
# Step 1: Write tests FIRST
vim src/services/__tests__/feedService.test.ts
# Write unit tests that FAIL initially (Red phase)

# Step 2: Run tests to confirm they fail
pnpm test feedService

# Step 3: Implement code to make tests pass (Green phase)
vim src/services/feedService.ts

# Step 4: Refactor while tests stay green
# Step 5: Push only when all tests pass

pnpm test:coverage  # Minimum 80% coverage required
```

### 3. Code Quality

Before committing:

```bash
# Lint and format code
pnpm lint
pnpm format

# Run type checking
pnpm type-check

# Run full test suite
pnpm test

# Check coverage threshold (80% minimum)
pnpm test:coverage
```

### 4. Commit Message Format

Use conventional commits:

```
feat(feedService): add RSS feed validation
  - Validates RSS 2.0 and Atom formats
  - Rejects invalid URLs with clear error message
  - Test coverage: 95%

fix(ui): correct viewport scaling on mobile
  - Fixes 375px breakpoint styling issue
  - Tested on iPhone 12 (Safari) and Android (Chrome)

docs: update development guide
test: add integration tests for feed refresh
refactor: simplify offline detection logic
```

### 5. Responsive Design Testing

Test at THREE minimum breakpoints:

```bash
# Mobile (375px)
pnpm dev  # Open DevTools → iPhone SE / Moto G4

# Tablet (768px)
# Open DevTools → iPad / Galaxy Tab

# Desktop (1024px+)
# Full browser window or 1440px viewport
```

Use CSS media queries for responsive design:

```typescript
// src/styles/breakpoints.ts
export const breakpoints = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px',
};

// Usage in components
<div className={styles.container}>
  {/* Automatically adapts to viewport */}
</div>
```

### 6. Service Worker & PWA Development

For offline-first features:

```typescript
// src/workers/sync.ts
export const registerSyncHandler = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      // Register background sync for feed refresh
    });
  }
};

// Test offline capability
# In DevTools: Application → Service Workers → Offline (check box)
# Reload page—app should work without network
```

Test PWA installation:

```bash
# Run dev server
pnpm dev

# In Chrome: Address bar → "Install app" button
# Or: DevTools → Manifest → "Add to homescreen" button
```

## Testing

### Unit Tests

```bash
pnpm test --run  # Single run
pnpm test        # Watch mode
pnpm test unit/  # Run only unit tests
```

Example unit test structure:

```typescript
// src/services/__tests__/feedService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { validateRssUrl, parseFeed } from '../feedService';

describe('feedService', () => {
  describe('validateRssUrl', () => {
    it('should accept valid RSS URLs', () => {
      expect(validateRssUrl('https://example.com/feed.xml')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateRssUrl('not-a-url')).toBe(false);
    });
  });
});
```

### Integration Tests

```bash
pnpm test integration/  # Run integration tests
```

Example integration test:

```typescript
// src/services/__tests__/integration/feedFetch.test.ts
import { describe, it, expect } from 'vitest';
import { server } from '../../mocks/server';
import { fetchFeed } from '../../feedService';

describe('Feed Fetch Integration', () => {
  it('should fetch and parse RSS feed', async () => {
    const feed = await fetchFeed('https://api.example.com/feed.xml');
    expect(feed.articles).toHaveLength(10);
    expect(feed.articles[0]).toHaveProperty('title');
  });
});
```

### End-to-End Tests (Playwright)

```bash
pnpm test:e2e        # Run E2E tests
pnpm test:e2e --ui   # Interactive UI mode
```

Example E2E test:

```typescript
// tests/e2e/addFeed.spec.ts
import { test, expect } from '@playwright/test';

test('user can add an RSS feed', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('[data-testid="add-feed-button"]');
  await page.fill('[data-testid="feed-url-input"]', 'https://example.com/feed.xml');
  await page.click('[data-testid="submit-button"]');
  await expect(page.locator('[data-testid="feed-title"]')).toContainText('Example Feed');
});
```

## Performance & Observability

### Logging

Use structured logging (JSON format):

```typescript
// src/lib/logger.ts
export const logger = {
  info: (msg: string, context?: Record<string, any>) => {
    console.log(JSON.stringify({ level: 'INFO', msg, ...context }));
  },
  error: (msg: string, error?: Error, context?: Record<string, any>) => {
    console.error(JSON.stringify({ 
      level: 'ERROR', 
      msg, 
      error: error?.message,
      stack: error?.stack,
      ...context 
    }));
  },
};

// Usage
logger.info('Feed fetched', { feedUrl, articleCount: 25 });
logger.error('Failed to parse feed', err, { feedUrl });
```

### Performance Tracking

```typescript
// src/lib/metrics.ts
export const trackMetric = (name: string, value: number, unit = 'ms') => {
  if (window.gtag) {
    window.gtag('event', 'performance_metric', {
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
    });
  }
};

// Usage
const start = performance.now();
const articles = await fetchFeed(url);
const duration = performance.now() - start;
trackMetric('feed_fetch_time', duration);
```

## Debugging

### Local Development

```bash
# Enable debug logs
DEBUG=rss-reader:* pnpm dev

# Check IndexedDB in DevTools
# Application → Storage → IndexedDB → rss-reader
```

### VSCode Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```

Then press `F5` to debug in VSCode.

## Build & Deployment

### Production Build

```bash
pnpm build
# Creates dist/ folder with optimized assets

# Verify build size
pnpm build:analyze
```

### PWA Checklist

Before deploying to production:

- [ ] Service Worker registered and functional
- [ ] Web App Manifest valid (test with Lighthouse)
- [ ] Icons provided (192x192, 512x512)
- [ ] HTTPS enabled (PWA requires HTTPS)
- [ ] Offline capability tested
- [ ] Test coverage ≥ 80%
- [ ] No deprecated dependencies
- [ ] Performance score ≥ 90 (Lighthouse)

```bash
# Run Lighthouse audit
pnpm build
pnpm preview  # Preview production build
# Then use Chrome DevTools → Lighthouse
```

## Dependency Management

### Adding Dependencies

Before adding a dependency:

1. **Check if it's necessary** — Avoid bloat; use built-in APIs where possible
2. **Verify active maintenance** — No abandoned libraries
3. **Check bundle impact** — Use `pnpm build:analyze`

```bash
pnpm add [package-name]
# Update package.json and pnpm-lock.yaml

# After merge: pnpm install
```

### Updating Dependencies

```bash
# Check for outdated packages
pnpm outdated

# Update minor/patch versions safely
pnpm update

# Update major versions (review carefully)
pnpm add package-name@latest
```

## Troubleshooting

### Tests Failing

```bash
# Clear cache and reinstall
pnpm clean
pnpm install

# Run in debug mode
DEBUG=* pnpm test feedService
```

### Service Worker Not Updating

```bash
# Service Workers can be sticky; clear cache
# DevTools → Application → Service Workers → Unregister
# DevTools → Application → Cache Storage → Delete all
# Hard reload: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### IndexedDB Issues

```bash
# View stored data
# DevTools → Application → IndexedDB → rss-reader

# Clear all local data (if needed)
localStorage.clear();
indexedDB.deleteDatabase('rss-reader');
```

### Build Size Too Large

```bash
# Analyze bundle
pnpm build:analyze

# Check for duplicate dependencies
pnpm ls --depth=0

# Remove unused code / tree-shake
pnpm install --prod
```

## Code Style & Conventions

### TypeScript

- Always use strict mode: `"strict": true` in `tsconfig.json`
- Define interfaces for data models: `export interface Feed { title: string; ... }`
- Use type unions for status: `type FeedStatus = 'loading' | 'success' | 'error'`

### React Components

- Use functional components with hooks
- Extract complex logic into custom hooks
- Prop drill only 1-2 levels; use context for deeper nesting

```typescript
// Good
export const FeedList = ({ feeds }: { feeds: Feed[] }) => {
  return feeds.map(feed => <FeedItem key={feed.id} feed={feed} />);
};

// Avoid
export const FeedList = ({ ...deeply, ...nested, ...props }) => {
  // Multiple levels of prop drilling
};
```

### CSS / Responsive Design

- Use mobile-first CSS (base styles for 375px, then `@media (min-width: 768px)`)
- Avoid hardcoded pixels for spacing; use CSS variables
- Test all changes at 375px, 768px, and 1024px

```css
/* src/styles/components/FeedItem.module.css */
.item {
  padding: 1rem;
  font-size: 14px;
}

@media (min-width: 768px) {
  .item {
    padding: 1.5rem;
    font-size: 16px;
  }
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `feed-service.ts`, `FeedList.tsx` |
| Functions | camelCase | `fetchFeeds()`, `validateUrl()` |
| Classes | PascalCase | `FeedService`, `OfflineManager` |
| Constants | UPPER_SNAKE_CASE | `MAX_FEEDS = 1000` |
| CSS Classes | kebab-case | `.feed-list-item` |

## Resources

- **Constitution**: [`.specify/memory/constitution.md`](../.specify/memory/constitution.md)
- **Contributing Guide**: [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md)
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **PWA Docs**: https://web.dev/progressive-web-apps/
- **Playwright Docs**: https://playwright.dev
- **TypeScript**: https://www.typescriptlang.org

## Getting Help

- **Technical Questions**: Check existing issues or ask in PR comments
- **Bug Reports**: Open an issue with reproduction steps
- **Feature Requests**: Align with Feature Scope in Constitution before opening issue
