# Quickstart Guide: RSS Reader PWA Development

**Feature**: RSS Reader MVP - Complete Application  
**Audience**: Developers joining the project  
**Last Updated**: 2026-01-25

## Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **Package Manager**: npm (included with Node.js)
- **Git**: For version control
- **Editor**: VS Code recommended (with ESLint + Prettier extensions)
- **Browser**: Chrome 80+, Firefox 75+, or Safari 13+ for testing

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd rss-reader

# Install dependencies
npm install

# Verify installation
npm run type-check  # Should show 0 errors
```

### 2. Development Server

```bash
# Start dev server (hot reload enabled)
npm run dev

# Open browser at http://localhost:5173
# App should load with default theme and empty feed list
```

### 3. Run Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run E2E tests (requires dev server running)
npm run test:e2e
```

Expected output: All tests passing (currently 9/9 unit tests)

---

## Project Structure Overview

```
rss-reader/
├── src/                      # Source code
│   ├── components/          # React components (to be implemented)
│   ├── pages/               # Page views (placeholders exist)
│   ├── services/            # Business logic (feedService partially done)
│   ├── models/              # TypeScript interfaces (Feed.ts exists)
│   ├── hooks/               # React hooks (useStore.ts exists)
│   ├── lib/                 # Core libraries (logger, pwa, storage exist)
│   ├── utils/               # Utility functions (to be added)
│   ├── styles/              # CSS (globals.css exists)
│   ├── main.tsx             # App entry point
│   └── App.tsx              # Root component
│
├── tests/                    # Test files
│   ├── unit/                # Unit tests (2 files, 9 tests passing)
│   ├── integration/         # Integration tests (to be added)
│   ├── e2e/                 # Playwright E2E tests (to be added)
│   └── setup.ts             # Test environment setup
│
├── public/                   # Static assets
│   ├── manifest.json        # PWA manifest
│   └── service-worker.js    # Service Worker (placeholder)
│
├── specs/                    # Feature specifications
│   └── 001-rss-reader-mvp/  # Current feature docs
│       ├── spec.md          # Feature specification
│       ├── plan.md          # Implementation plan
│       ├── research.md      # Technology research
│       ├── data-model.md    # Data entity schemas
│       └── quickstart.md    # This file
│
└── .specify/                 # Project governance
    └── memory/
        └── constitution.md  # Project principles (v1.0.0)
```

---

## Development Workflow

### Test-First Development (Constitution Principle II)

**CRITICAL**: All features MUST follow test-first development. No exceptions.

1. **Write Failing Test**
   ```typescript
   // tests/unit/feedService.test.ts
   test('should fetch and parse RSS feed', async () => {
     const feed = await fetchFeed('https://example.com/feed.xml');
     expect(feed.title).toBe('Example Feed');
     expect(feed.articles).toHaveLength(10);
   });
   ```

2. **Run Test (Should Fail)**
   ```bash
   npm run test -- feedService.test.ts
   # Expected: FAIL - fetchFeed is not implemented
   ```

3. **Implement Feature**
   ```typescript
   // src/services/feedService.ts
   export async function fetchFeed(url: string): Promise<ParsedFeed> {
     const response = await fetch(url);
     const xmlText = await response.text();
     return parseFeed(xmlText);
   }
   ```

4. **Run Test (Should Pass)**
   ```bash
   npm run test -- feedService.test.ts
   # Expected: PASS
   ```

5. **Refactor (Optional)**
   - Improve code quality while keeping tests green
   - Verify tests still pass after refactoring

### Branch Strategy

```bash
# Feature branch naming: ###-feature-name
git checkout 001-rss-reader-mvp

# Create task branch for specific user story
git checkout -b 001-rss-reader-mvp/add-feed-ui

# Commit with conventional commit messages
git commit -m "feat: add RSS feed subscription form component

- Input field for feed URL
- Validation with error messages
- Add button triggers feed fetch
- Unit tests for validation logic
- Integration tests for form submission"

# Push and create PR
git push origin 001-rss-reader-mvp/add-feed-ui
```

---

## Key Technologies

### React 18 + TypeScript

```typescript
// Component example with TypeScript
import { FC } from 'react';

interface FeedCardProps {
  feed: Feed;
  onSelect: (feedId: string) => void;
}

export const FeedCard: FC<FeedCardProps> = ({ feed, onSelect }) => {
  return (
    <div 
      className="feed-card" 
      onClick={() => onSelect(feed.id)}
    >
      <h3>{feed.title}</h3>
      <p>{feed.description}</p>
    </div>
  );
};
```

### Zustand State Management

```typescript
// src/hooks/useStore.ts (exists)
import { create } from 'zustand';

interface AppStore {
  feeds: Feed[];
  addFeed: (feed: Feed) => void;
  removeFeed: (feedId: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  feeds: [],
  addFeed: (feed) => set((state) => ({ 
    feeds: [...state.feeds, feed] 
  })),
  removeFeed: (feedId) => set((state) => ({ 
    feeds: state.feeds.filter(f => f.id !== feedId) 
  }))
}));

// Usage in component
function FeedList() {
  const { feeds, addFeed } = useAppStore();
  // ... component logic
}
```

### IndexedDB Storage

```typescript
// src/lib/storage.ts (exists)
import { storage } from '@/lib/storage';

// Initialize database
await storage.init();

// Store feed
await storage.put<Feed>('feeds', newFeed);

// Retrieve all feeds
const feeds = await storage.getAll<Feed>('feeds');

// Query by index
const categoryFeeds = await storage.getAllByIndex<Feed>(
  'feeds', 
  'categoryId', 
  categoryId
);
```

### Tailwind CSS (v4)

```tsx
// Responsive design with Tailwind utilities
<div className="
  p-4 
  mobile:grid-cols-1 
  tablet:grid-cols-2 
  desktop:grid-cols-3
  grid gap-4
">
  {feeds.map(feed => <FeedCard key={feed.id} feed={feed} />)}
</div>

// Dark mode support
<div className="
  bg-white dark:bg-black
  text-black dark:text-white
">
  Content
</div>
```

---

## Common Tasks

### Adding a New Component

```bash
# Create component file
mkdir -p src/components/AddFeedDialog
touch src/components/AddFeedDialog/AddFeedDialog.tsx
touch src/components/AddFeedDialog/AddFeedDialog.test.tsx

# Write test first (TDD)
# src/components/AddFeedDialog/AddFeedDialog.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AddFeedDialog } from './AddFeedDialog';

test('should validate feed URL', () => {
  render(<AddFeedDialog />);
  const input = screen.getByLabelText('Feed URL');
  fireEvent.change(input, { target: { value: 'invalid-url' } });
  expect(screen.getByText('Invalid URL')).toBeInTheDocument();
});

# Implement component
# src/components/AddFeedDialog/AddFeedDialog.tsx
export const AddFeedDialog: FC = () => {
  // Component implementation
};
```

### Adding a New Service Function

```bash
# Create service test first
# tests/unit/opmlService.test.ts
test('should export feeds to OPML', () => {
  const feeds: Feed[] = [/* test data */];
  const opml = exportToOPML(feeds, []);
  expect(opml).toContain('<opml version="2.0">');
  expect(opml).toContain('xmlUrl=');
});

# Implement service
# src/services/opmlService.ts
export function exportToOPML(feeds: Feed[], categories: Category[]): string {
  // Implementation
}
```

### Checking Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html

# Check if coverage meets threshold (80% minimum)
# Coverage thresholds configured in vitest.config.ts
```

---

## Debugging Tips

### VSCode Debugging

1. Add breakpoint in code
2. Run "JavaScript Debug Terminal" in VS Code
3. Execute `npm run dev` or `npm run test`
4. Debugger stops at breakpoint

### Browser DevTools

```typescript
// Add debug logging
import { logger } from '@/lib/logger';

logger.debug('Feed fetch started', { url });
logger.info('Feed fetched successfully', { articleCount: feed.articles.length });
logger.error('Feed fetch failed', error as Error, { url });
```

### IndexedDB Inspector

- Chrome DevTools → Application → Storage → IndexedDB → rss-reader
- View stored feeds, articles, categories
- Manually modify data for testing

---

## Testing Strategies

### Unit Tests (Vitest)

Test individual functions in isolation:

```typescript
// tests/unit/validators.test.ts
import { validateFeedUrl } from '@/utils/validators';

test('accepts valid HTTPS URLs', () => {
  expect(validateFeedUrl('https://example.com/feed.xml')).toBe(true);
});

test('rejects invalid URLs', () => {
  expect(validateFeedUrl('not-a-url')).toBe(false);
});
```

### Integration Tests (@testing-library/react)

Test component interactions:

```typescript
// tests/integration/feedWorkflow.test.ts
test('user can add and view feed', async () => {
  render(<App />);
  
  // Click "Add Feed" button
  fireEvent.click(screen.getByText('Add Feed'));
  
  // Enter feed URL
  const input = screen.getByLabelText('Feed URL');
  fireEvent.change(input, { target: { value: 'https://example.com/feed.xml' } });
  
  // Submit form
  fireEvent.click(screen.getByText('Subscribe'));
  
  // Verify feed appears in list
  await screen.findByText('Example Feed');
});
```

### E2E Tests (Playwright)

Test full user journeys in real browser:

```typescript
// tests/e2e/addFeed.spec.ts
test('user adds RSS feed and reads article', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add feed
  await page.click('text=Add Feed');
  await page.fill('input[name="feedUrl"]', 'https://example.com/feed.xml');
  await page.click('text=Subscribe');
  
  // Wait for feed to load
  await page.waitForSelector('text=Example Feed');
  
  // Click on feed
  await page.click('text=Example Feed');
  
  // Verify articles displayed
  await page.waitForSelector('.article-list');
  const articles = await page.$$('.article-item');
  expect(articles.length).toBeGreaterThan(0);
});
```

---

## Performance Optimization

### Bundle Size Analysis

```bash
# Build production bundle
npm run build

# Analyze bundle size
npx vite-bundle-visualizer

# Target: Keep main bundle < 500KB gzipped
```

### Lighthouse Audit

```bash
# Build production version
npm run build

# Start preview server
npm run preview

# Run Lighthouse in Chrome DevTools
# Target scores:
# - Performance: 90+
# - Accessibility: 100
# - Best Practices: 100
# - SEO: 90+
# - PWA: 100
```

---

## Common Issues

### Issue: Tests Failing After npm install

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run test
```

### Issue: IndexedDB errors in tests

**Solution**:
```bash
# Ensure fake-indexeddb is installed
npm install -D fake-indexeddb

# Verify tests/setup.ts imports fake-indexeddb
```

### Issue: Service Worker not registering

**Solution**:
```typescript
// Check src/main.tsx
import { registerServiceWorker } from '@/lib/pwa';

registerServiceWorker().catch((error) => {
  console.error('SW registration failed:', error);
});
```

### Issue: TypeScript errors in strict mode

**Solution**:
```typescript
// Use explicit types instead of 'any'
const feeds = await storage.getAll<Feed>('feeds');

// Use type assertions for Vite env
const env = (import.meta as any).env;
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run all unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run Playwright E2E tests

# Code Quality
npm run lint             # Run ESLint
npm run format           # Run Prettier
npm run type-check       # Run TypeScript compiler

# Maintenance
npm outdated             # Check for outdated packages
npm update               # Update dependencies
```

---

## Resources

### Project Documentation
- [Constitution](../../.specify/memory/constitution.md) - Core principles and governance
- [Feature Spec](./spec.md) - Complete feature requirements
- [Data Model](./data-model.md) - Entity schemas and relationships
- [Research](./research.md) - Technology decisions and rationale

### External Resources
- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

---

## Getting Help

1. **Check Constitution**: Most decisions are guided by project principles
2. **Review Spec**: User stories and acceptance criteria clarify requirements
3. **Read Tests**: Existing tests show expected behavior
4. **Ask Team**: Create discussion in project chat/forum

---

## Next Steps

After completing quickstart:

1. **Pick a User Story**: Start with P1 (Priority 1) stories from [spec.md](./spec.md)
2. **Write Tests First**: Follow TDD workflow (Red → Green → Refactor)
3. **Implement Feature**: Build component/service to pass tests
4. **Verify Coverage**: Ensure 80%+ test coverage maintained
5. **Create PR**: Submit for review with conventional commit messages

**Welcome to the RSS Reader PWA project!** 🎉
