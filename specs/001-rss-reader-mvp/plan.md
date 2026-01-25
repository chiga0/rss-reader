# Implementation Plan: RSS Reader PWA - Complete Application
































































































































































































































































































































































































































































































































































































































**Next Phase**: Data model design (entities, schemas, relationships) in data-model.md5. **Minimalist design** (Tailwind utilities, no heavy component libraries)4. **Offline-first architecture** (Service Worker, IndexedDB, background sync)3. **Constitution compliance** (PWA, test-first, responsive, modern tech, observability)2. **Bundle size optimization** (Workbox is only major addition at 150KB)1. **Zero-dependency preference** where browser APIs suffice (DOMParser, IndexedDB, localStorage)All technology choices prioritize:## Conclusion---- Manual testing with VoiceOver (iOS/macOS) and TalkBack (Android)- axe-core integration in Playwright tests**Testing Approach**:- Screen reader announcements for dynamic content (new articles, errors)- Focus management for modals and dialogs- Keyboard navigation support (Tab, Enter, Escape)- ARIA labels for icon-only buttons (Add Feed, Favorite, Delete)- Semantic HTML for feed/article lists (<nav>, <article>, <section>)## Accessibility Considerations---```}  "@types/dompurify": "^3.0.5"  "dompurify": "^3.0.8",{```json**Dependency to Add**:- Validate image URLs before loading- Strip JavaScript and dangerous HTML tags- Use DOMPurify for HTML sanitization in article content### RSS Content Sanitization```               connect-src 'self' https:;">               img-src 'self' https: data:;                style-src 'self' 'unsafe-inline';                script-src 'self' 'wasm-unsafe-eval';       content="default-src 'self'; <meta http-equiv="Content-Security-Policy" ```html### Content Security Policy## Security Considerations---- Implement cache size limits (100MB max, prune oldest first)- Precache app shell (HTML, CSS, JS, fonts, icons)- Cache RSS feed responses for 1 hour (stale-while-revalidate)### Service Worker Caching- Implement pagination for article lists (50 articles per page)- Index on frequently queried fields (feedId, publishedAt)- Batch writes for OPML import (reduce transaction overhead)### IndexedDB Optimization- Use Web Workers for CPU-intensive parsing (if needed)- Parse only visible articles initially (lazy load rest)- Stream large feeds in chunks (10MB+ files)### Feed Parsing Optimization## Performance Considerations---**Bundle Size Impact**: +150KB (Workbox), negligible for other choices (browser native APIs)```}  "fake-indexeddb": "^5.0.2"  // For IndexedDB testing{```json### Development Dependencies```}  "workbox-strategies": "^7.0.0"  "workbox-routing": "^7.0.0",  "workbox-precaching": "^7.0.0",  "vite-plugin-pwa": "^0.17.5",{```json### Production Dependencies## Summary of Dependencies to Add---- Performance logging tests- Integration tests check error logging in failure scenarios- Unit tests verify JSON log format**Testing Approach**:```logger.info('RSS parsing completed', { duration, articleCount });const duration = performance.now() - startTime;await parseRSSContent(xmlText);const startTime = performance.now();// Performance tracking}  logger.error('Failed to fetch feed', error as Error, { url, feedId });} catch (error) {  const feed = await fetchFeed(url);try {// Feed fetch error```typescript**Usage Pattern**:```};  error: (msg: string, error?: Error, ctx?: Record<string, any>) => log(LogLevel.ERROR, msg, ctx, error)  warn: (msg: string, ctx?: Record<string, any>) => log(LogLevel.WARN, msg, ctx),  info: (msg: string, ctx?: Record<string, any>) => log(LogLevel.INFO, msg, ctx),  debug: (msg: string, ctx?: Record<string, any>) => log(LogLevel.DEBUG, msg, ctx),export const logger = {}  console.log(JSON.stringify(logEntry));    };    ...(error && { error: { message: error.message, stack: error.stack } })    context: context || {},    timestamp: new Date().toISOString(),    message,    level,  const logEntry = {function log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {}  ERROR = 'ERROR'  WARN = 'WARN',  INFO = 'INFO',  DEBUG = 'DEBUG',enum LogLevel {```typescript**Current Implementation** (src/lib/logger.ts):- Meets observability requirements without external dependencies initially- Easy to integrate with Sentry or other error tracking services later- Logger supports DEBUG, INFO, WARN, ERROR levels with context- Structured JSON logging already implemented per Constitution Principle V**Rationale**:**Decision**: Use existing structured logger (src/lib/logger.ts) + Sentry integration (future)### 8. Error Handling & Logging---- Background Sync API tests with Service Worker mocks- Integration tests for refresh cycle- Unit tests with mocked timers (vi.useFakeTimers())**Testing Approach**:```}  }    );      activeFeeeds.map(feed => feedService.fetchAndUpdateFeed(feed.id))    await Promise.allSettled(        const activeFeeeds = feeds.filter(f => !f.paused);    const feeds = await storage.getAll<Feed>('feeds');  private async refreshAllFeeds() {    }    }, this.refreshIntervalMs);      this.scheduleNextRefresh();      await this.refreshAllFeeds();    this.timeoutId = window.setTimeout(async () => {        if (this.timeoutId) clearTimeout(this.timeoutId);  private scheduleNextRefresh() {    }    this.scheduleNextRefresh();    // In-app refresh timer        }      await registration.sync.register('feed-refresh');      const registration = await navigator.serviceWorker.ready;    if ('serviceWorker' in navigator && 'sync' in (navigator as any).serviceWorker) {    // Register background sync if supported  async startAutoRefresh() {    }    this.refreshIntervalMs = intervalMinutes * 60 * 1000;  constructor(intervalMinutes: number = 60) {    private timeoutId: number | null = null;  private refreshIntervalMs: number;export class SyncService {// src/services/syncService.ts```typescript**Implementation Pattern**:- Fallback to manual refresh button for iOS Safari (no Background Sync support)- Background Sync API for refresh when app is in background (Android, desktop browsers)- setTimeout for in-app refresh while user is active**Rationale**:**Decision**: Combination of setTimeout + Service Worker Background Sync API### 7. Feed Refresh Scheduling---- Playwright tests for theme persistence across sessions- Integration tests for system preference detection- Unit tests for theme switching logic**Testing Approach**:```}  }    --color-accent: 96 165 250;    --color-text: 255 255 255;    --color-bg: 0 0 0;  .dark {    }    --color-accent: 59 130 246;    --color-text: 0 0 0;    --color-bg: 255 255 255;  :root {@layer base {```css**CSS Variables** (src/styles/globals.css):```}  return { theme, changeTheme };    };    localStorage.setItem('theme', newTheme);    setTheme(newTheme);  const changeTheme = (newTheme: typeof theme) => {    }, [theme]);    return () => systemPreference.removeEventListener('change', applyTheme);        systemPreference.addEventListener('change', applyTheme);    applyTheme();        };      }        root.classList.toggle('dark', theme === 'dark');      } else {        root.classList.toggle('dark', systemPreference.matches);      if (theme === 'system') {    const applyTheme = () => {        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');    const root = document.documentElement;  useEffect(() => {    });    return (localStorage.getItem('theme') as any) || 'system';  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {export function useTheme() {// src/hooks/useTheme.ts```typescript**Implementation Pattern**:- No external theme library needed- localStorage for manual theme override persistence- System preference detection via `window.matchMedia('(prefers-color-scheme: dark)')`- Tailwind CSS 4.0 supports dark mode out of the box with `class` strategy**Rationale**:**Decision**: CSS custom properties + system preference detection + localStorage persistence### 6. Theme Management---- Storage quota exceeded tests- Performance tests for large datasets (1000+ articles)- Integration tests for data persistence across page reloads- Unit tests with fake-indexeddb library**Testing Approach**:- Add bulk operations for OPML import- Implement storage quota monitoring- Add `deletedFeeds` object store for soft-delete (7-day recovery)- Add `settings` object store for app preferences- Add `categories` object store for user-defined categories**Enhancements Needed**:```}  // Additional methods: put<K>(), get<K>(), getAll<K>(), delete<K>(), clear<K>()    }    });      request.onerror = () => reject(request.error);            };        resolve();        this.db = (event.target as IDBOpenDBRequest).result;      request.onsuccess = (event) => {            };        }          articleStore.createIndex('publishedAt', 'publishedAt', { unique: false });          articleStore.createIndex('feedId', 'feedId', { unique: false });          const articleStore = db.createObjectStore('articles', { keyPath: 'id' });        if (!db.objectStoreNames.contains('articles')) {        // Articles store                }          feedStore.createIndex('categoryId', 'categoryId', { unique: false });          const feedStore = db.createObjectStore('feeds', { keyPath: 'id' });        if (!db.objectStoreNames.contains('feeds')) {        // Feeds store                const db = (event.target as IDBOpenDBRequest).result;      request.onupgradeneeded = (event) => {            const request = indexedDB.open('rss-reader', 1);    return new Promise((resolve, reject) => {  async init(): Promise<void> {    private db: IDBDatabase | null = null;class Storage {```typescript**Current Implementation** (src/lib/storage.ts):- Supports offline-first patterns natively- No external dependencies, full control over schema and migrations- Provides abstraction over IndexedDB's complex API- Custom Storage class already implemented with typed operations**Rationale**:**Decision**: Use existing custom Storage class (src/lib/storage.ts) with optimizations### 5. IndexedDB Storage Strategy---- Manual testing on real devices (iOS Safari, Android Chrome)- CSS media query tests in unit tests- Playwright visual tests at 375px, 768px, 1024px viewports**Testing Approach**:- **Headless UI**: Considered for modals/dialogs but can implement with native <dialog> element- **shadcn/ui**: Good component quality but adds complexity, prefer custom components- **Material-UI/MUI**: Too heavy (500KB+), opinionated design system conflicts with minimalism**Alternatives Considered**:```</article>  {/* Article content */}">  desktop:max-w-4xl  tablet:max-w-2xl  mobile:max-w-full  mx-auto px-4 py-6<article className="// Responsive article content width</div>  {feeds.map(feed => <FeedCard key={feed.id} feed={feed} />)}">  desktop:grid-cols-3  tablet:grid-cols-2  mobile:grid-cols-1  grid gap-4 p-4<div className="// Responsive feed list layout```tsx**Component Patterns**:```}  }    }      desktop: '1024px'  // Desktop and laptops      tablet: '768px',   // Tablets and large phones      mobile: '375px',   // Mobile devices (iPhone SE and up)    screens: {  theme: {export default {// tailwind.config.ts (already configured)```typescript**Breakpoint Strategy**:- Easy to maintain responsive layouts with Tailwind's responsive variants- No additional component library needed, keeps bundle size small- Utility-first approach aligns with minimalist design principles- Already configured in project (tailwind.config.ts with mobile:375px, tablet:768px, desktop:1024px)**Rationale**:**Decision**: Use Tailwind CSS 4.0 utility classes with custom breakpoints### 4. Responsive UI Components---- Edge cases: malformed XML, missing attributes, deeply nested categories- Import/export round-trip tests (export → import → verify)- Unit tests with sample OPML files from Feedly, Inoreader, NetNewsWire**Testing Approach**:```}  return { feeds, categories: [] };    });    });      categoryId: findOrCreateCategory(outline.parentElement)      title: outline.getAttribute('title') || outline.getAttribute('text') || 'Untitled',      url: outline.getAttribute('xmlUrl')!,    feeds.push({  outlines.forEach(outline => {    const outlines = doc.querySelectorAll('outline[xmlUrl]');  const feeds: Partial<Feed>[] = [];    }    throw new Error('Invalid OPML XML');  if (doc.querySelector('parsererror')) {  // Validate OPML structure    const doc = parser.parseFromString(opmlText, 'text/xml');  const parser = new DOMParser();export async function importFromOPML(opmlText: string): Promise<ImportResult> {}  return xml;  xml += `\n  </body>\n</opml>`;    });    xml += `\n    </outline>`;    });      xml += `\n      <outline type="rss" text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.url)}" />`;    feeds.forEach(feed => {    xml += `\n    <outline text="${escapeXml(categoryName)}" title="${escapeXml(categoryName)}">`;  categoryMap.forEach((feeds, categoryName) => {    <body>`;  </head>    <dateCreated>${new Date().toISOString()}</dateCreated>    <title>RSS Reader Subscriptions</title>  <head><opml version="2.0">  let xml = `<?xml version="1.0" encoding="UTF-8"?>    });    categoryMap.get(cat)!.push(feed);    if (!categoryMap.has(cat)) categoryMap.set(cat, []);    const cat = categories.find(c => c.id === feed.categoryId)?.name || 'Uncategorized';  feeds.forEach(feed => {  const categoryMap = new Map<string, Feed[]>();export function exportToOPML(feeds: Feed[], categories: Category[]): string {// src/services/opmlService.ts```typescript**Implementation Pattern**:```</opml>  </body>    </outline>               xmlUrl="https://techcrunch.com/feed/" />      <outline type="rss" text="TechCrunch" title="TechCrunch"     <outline text="Technology" title="Technology">  <body>  </head>    <dateCreated>2026-01-25T10:00:00Z</dateCreated>    <title>RSS Reader Subscriptions</title>  <head><opml version="2.0"><?xml version="1.0" encoding="UTF-8"?>```xml**OPML 2.0 Structure**:- No external dependencies needed- Manual XML generation with template strings is straightforward- DOMParser handles validation and parsing natively- OPML is a simple XML format (OPML 2.0 spec is ~20KB)**Rationale**:**Decision**: Use browser DOMParser for import + manual XML generation for export### 3. OPML Import/Export---- Service Worker update tests- Background sync tests using Playwright with network throttling- Integration tests for offline access after initial load**Testing Approach**:- `workbox-strategies@7.x`- `workbox-routing@7.x`- `workbox-precaching@7.x`- `vite-plugin-pwa@0.17.x`**Dependencies to Add**:```);  new StaleWhileRevalidate({ cacheName: 'rss-feeds' })  ({url}) => url.pathname.includes('/feed/'),registerRoute(// Cache RSS feeds with stale-while-revalidateprecacheAndRoute(self.__WB_MANIFEST);// Precache app shellimport { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';import { registerRoute } from 'workbox-routing';import { precacheAndRoute } from 'workbox-precaching';// src/workers/sw.ts});  ]    })      }        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']      injectManifest: {      registerType: 'autoUpdate',      filename: 'sw.ts',      srcDir: 'src/workers',      strategies: 'injectManifest',    VitePWA({  plugins: [export default defineConfig({import { VitePWA } from 'vite-plugin-pwa';// vite.config.ts - Add Workbox plugin```typescript**Implementation Pattern**:- **Vite PWA Plugin**: Good for basic PWAs, but less flexible for custom sync logic- **Manual Service Worker**: Full control but high complexity, error-prone lifecycle management**Alternatives Considered**:- Maintained by Google Chrome team, aligns with PWA best practices- Supports background sync API with fallback for iOS- Handles Service Worker registration, lifecycle events, and updates automatically- Workbox provides battle-tested patterns for PWA caching strategies**Rationale**:**Decision**: Use Workbox 7.x library for Service Worker lifecycle management### 2. Service Worker & Background Sync---- Performance tests: 10MB+ feed files- Edge case tests: missing fields, invalid XML, non-standard formats- Unit tests with real-world RSS/Atom feed samples**Testing Approach**:```}  throw new Error('Unsupported feed format');    if (atomFeed) return parseAtom10(atomFeed);  const atomFeed = doc.querySelector('feed');  // Check for Atom 1.0    if (rssChannel) return parseRSS20(rssChannel);  const rssChannel = doc.querySelector('rss > channel');  // Check for RSS 2.0    const doc = parser.parseFromString(xmlText, 'text/xml');  const parser = new DOMParser();export async function parseFeed(xmlText: string): Promise<ParsedFeed> {// src/lib/rssParser.ts```typescript**Implementation Pattern**:- **feedme**: Streaming parser, overkill for client-side RSS reading- **fast-xml-parser**: Generic XML parser, requires custom RSS logic on top- **rss-parser** (npm): Popular library but adds 50KB bundle size, may not handle edge cases specific to our needs**Alternatives Considered**:- Avoids third-party library bundle size and maintenance concerns- Custom parser gives full control over error handling and validation- RSS 2.0 and Atom 1.0 formats are well-defined XML standards- DOMParser is built into all modern browsers, zero dependencies**Rationale**:**Decision**: Use browser-native DOMParser + custom parsing logic### 1. RSS/Atom Feed Parsing## Research AreasThis document captures all technology choices, library selections, and architectural patterns researched for the RSS Reader PWA implementation. All decisions prioritize constitution compliance (PWA architecture, test-first, responsive design, modern tech, observability).## Overview**Date**: 2026-01-25**Phase**: 0 (Research & Discovery)  **Feature**: RSS Reader MVP - Complete Application  **Branch**: `001-rss-reader-mvp` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rss-reader-mvp/spec.md`

**Note**: This plan is generated by the `/speckit.plan` command following the execution workflow defined in `.specify/templates/commands/plan.md`.

## Summary

Build a Progressive Web App (PWA) for RSS feed subscription and reading that works across web browsers, Android, and iOS. Core functionality includes adding RSS feeds, automatic background refresh, offline article access, OPML import/export, theme customization, feed categorization, reading history, and favorites. The application follows PWA-first architecture, test-first development (80% coverage minimum), responsive design (375px/768px/1024px breakpoints), and minimalist UI principles.

**Technical Approach**: Client-side React 18 + TypeScript 5 application with Zustand state management, IndexedDB for offline storage, Service Worker for background sync, and Vite build system. All features implement test-first workflow using Vitest for unit tests and Playwright for integration tests.

## Technical Context

**Language/Version**: TypeScript 5.7.2 (strict mode enabled)  
**Primary Dependencies**: React 18.3.1, Zustand 4.5.5, Vite 5.4.11, Vitest 2.1.8  
**Storage**: IndexedDB (client-side) via custom Storage abstraction class, no backend server  
**Testing**: Vitest (unit, jsdom environment), Playwright 1.48.2 (e2e), @testing-library/react 16.0.1  
**Target Platform**: Web browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+), Android/iOS via PWA installation  
**Project Type**: PWA web application (installable, offline-capable)  
**Performance Goals**: <30s feed add+view, <5s feed refresh (<50 articles), <100ms UI response, <200ms IndexedDB ops  
**Constraints**: Offline-capable, <100ms theme switch, 95% feed parse success, responsive (no horizontal scroll), 80% test coverage  
**Scale/Scope**: 10-50 feeds per user, 20-100 articles per feed, 50MB-100MB IndexedDB storage, 8 user stories (P1: 2, P2: 3, P3: 3)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Version**: 1.0.0 (RSS Reader PWA Constitution)

- [x] **Principle I (PWA Architecture)**: Feature supports multi-platform deployment (web/Android/iOS via Service Worker, Web App Manifest, responsive design)
- [x] **Principle II (Test-First)**: Feature includes unit tests (Vitest), integration tests (Playwright); minimum 80% coverage target enforced (vitest.config.ts)
- [x] **Principle III (Responsive Design)**: UI tested at 375px (mobile), 768px (tablet), 1024px+ (desktop) viewports per tailwind.config.ts breakpoints
- [x] **Principle IV (Modern Tech)**: Uses TypeScript 5.7.2 strict mode, React 18.3.1, Vite 5.4.11, Zustand 4.5.5, Tailwind CSS 4.0.0 - all latest stable versions
- [x] **Principle V (Observability)**: Includes error logging (src/lib/logger.ts), performance tracking, structured JSON logs with timestamps/context

**Gate Status**: ✅ PASSED - All constitutional principles satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-rss-reader-mvp/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file - implementation plan
├── research.md          # Phase 0 output - RSS parsing libraries, PWA best practices
├── data-model.md        # Phase 1 output - Entity schemas and relationships
├── quickstart.md        # Phase 1 output - Getting started guide for developers
├── contracts/           # Phase 1 output - API contracts (if needed)
└── checklists/          
    └── requirements.md  # Specification validation checklist (completed)
```

### Source Code (repository root)

```text
# RSS Reader PWA - Standard Web Application Structure
src/
├── components/          # Reusable UI components
│   ├── FeedList/       # Feed subscription list with category groups
│   ├── ArticleList/    # Article list with read/unread indicators
│   ├── ArticleView/    # Full article content display
│   ├── AddFeedDialog/  # Feed URL input and validation UI
│   ├── Settings/       # Theme, refresh interval, OPML import/export
│   ├── CategoryManager/# Category create/edit/delete UI
│   └── Common/         # Shared UI (buttons, modals, loaders, icons)
│
├── pages/              # Page-level views (routes)
│   ├── FeedList.tsx    # Main feed list page (placeholder exists)
│   ├── ArticleDetail.tsx # Article detail page (placeholder exists)
│   ├── Settings.tsx    # Settings and preferences page
│   ├── Favorites.tsx   # Favorited articles view
│   └── RecentlyRead.tsx # Reading history view
│
├── services/           # Business logic
│   ├── feedService.ts  # RSS fetch, parse, validate (partially implemented)
│   ├── opmlService.ts  # OPML import/export logic
│   ├── syncService.ts  # Background sync coordination
│   └── cacheService.ts # Cache management strategies
│
├── models/             # TypeScript interfaces and types
│   └── Feed.ts         # Feed, Article, Subscription, Category, AppSettings, SyncState (exists)
│
├── hooks/              # Custom React hooks
│   ├── useStore.ts     # Zustand store integration (exists)
│   ├── useFeedRefresh.ts # Auto-refresh hook
│   ├── useOfflineDetection.ts # Online/offline status hook
│   └── useTheme.ts     # Theme management hook
│
├── lib/                # Core libraries
│   ├── logger.ts       # Structured JSON logging (exists)
│   ├── pwa.ts          # Service Worker registration, offline detection (exists)
│   ├── storage.ts      # IndexedDB wrapper (exists)
│   └── rssParser.ts    # RSS/Atom XML parsing logic
│
├── utils/              # Utility functions
│   ├── dateFormat.ts   # Date/time formatting
│   ├── validators.ts   # URL, OPML validation
│   └── helpers.ts      # General purpose helpers
│
├── styles/             # CSS/SCSS
│   └── globals.css     # Global styles, Tailwind imports, responsive utilities (exists)
│
├── workers/            # Service Worker code
│   └── sw.ts           # Service Worker implementation (background sync, caching)
│
├── main.tsx            # Application entry point (exists)
└── App.tsx             # Root component with theme/offline detection (exists)

tests/
├── unit/               # Unit tests (Vitest)
│   ├── logger.test.ts  # Logger tests (exists, 3/3 passing)
│   ├── feedService.test.ts # Feed validation tests (exists, 6/6 passing)
│   ├── storage.test.ts # IndexedDB wrapper tests
│   ├── rssParser.test.ts # RSS parsing tests
│   └── opmlService.test.ts # OPML import/export tests
│
├── integration/        # Integration tests (Vitest + @testing-library/react)
│   ├── feedWorkflow.test.ts # Add feed → view articles workflow
│   ├── offlineAccess.test.ts # Offline content access
│   └── themeSwitch.test.ts # Theme switching behavior
│
├── e2e/                # End-to-end tests (Playwright)
│   ├── addFeed.spec.ts # Complete feed addition journey
│   ├── opmlImport.spec.ts # OPML import/export journey
│   └── responsive.spec.ts # Responsive layout validation (375/768/1024px)
│
└── setup.ts            # Test environment setup (exists)

public/
├── manifest.json       # Web App Manifest (exists)
├── service-worker.js   # Service Worker entry (placeholder exists)
└── icons/              # App icons
    ├── icon-192.png    # 192x192 icon (required)
    └── icon-512.png    # 512x512 icon (required)
```

**Structure Decision**: Using standard PWA web application structure with React components, services layer for business logic, and comprehensive testing across unit/integration/e2e levels. Service Worker in public/ directory for standard PWA registration. IndexedDB storage abstraction in src/lib/. Responsive breakpoints (mobile 375px, tablet 768px, desktop 1024px+) configured in tailwind.config.ts and validated in tests.

## Phase 0: Research & Discovery

*Output: research.md documenting technology choices, libraries, and patterns*

**Status**: ✅ Completed

**Key Decisions Made**:
1. **RSS Parsing**: Browser-native DOMParser + custom parsing logic (zero dependencies)
2. **Service Worker**: Workbox 7.x for lifecycle management and caching strategies
3. **OPML**: DOMParser for import + manual XML generation for export
4. **Responsive UI**: Tailwind CSS 4.0 utility classes with custom breakpoints
5. **Storage**: Existing custom Storage class with IndexedDB optimizations
6. **Theme**: CSS custom properties + system preference detection + localStorage
7. **Refresh Scheduling**: setTimeout + Service Worker Background Sync API
8. **Logging**: Existing structured logger with future Sentry integration

**Dependencies Added**:
- `vite-plugin-pwa@^0.17.5`
- `workbox-precaching@^7.0.0`
- `workbox-routing@^7.0.0`
- `workbox-strategies@^7.0.0`
- `dompurify@^3.0.8` (security)
- `fake-indexeddb@^5.0.2` (dev, testing)

**Bundle Size Impact**: +150KB (Workbox only major addition)

---

## Phase 1: Design & Contracts

*Output: data-model.md, quickstart.md, agent context updates*

**Status**: ✅ Completed

**Data Model Entities**:
1. **Feed**: RSS/Atom subscription with URL, title, category, refresh interval, pause state
2. **Article**: Content items with read/favorite flags, timestamps, sanitized HTML
3. **Category**: User-defined groups with display order
4. **UserSettings**: Theme, refresh interval, notification preferences (singleton)
5. **SyncState**: Background sync queue and operation tracking (singleton)

**IndexedDB Schema** (v1):
- `feeds` store: indexed by categoryId, deletedAt
- `articles` store: indexed by feedId, publishedAt, readAt, isFavorite
- `categories` store: indexed by order
- `settings` store: singleton record
- `syncState` store: singleton record

**Key Patterns**:
- Cascade deletes: Category removal → feeds to "Uncategorized", Feed removal → delete articles
- Soft delete: 7-day recovery window for feeds
- Storage quota management: Auto-prune old read articles, LRU cache for images
- Data validation: URL validation, HTML sanitization, field length limits

**Developer Onboarding**:
- quickstart.md created with setup instructions, common tasks, debugging tips
- Test-first workflow documented (Red → Green → Refactor cycle)
- Example code for components, services, storage, testing

**Agent Context Updated**:
- GitHub Copilot instructions updated with TypeScript 5.7.2 + React 18.3.1 stack
- Build/test commands documented
- Recent changes tracked

---

## Constitution Re-Check (Post-Design)

**Constitution Version**: 1.0.0 (RSS Reader PWA Constitution)

- [x] **Principle I (PWA Architecture)**: ✅ Service Worker with Workbox, IndexedDB storage, Web App Manifest, responsive breakpoints (375/768/1024px)
- [x] **Principle II (Test-First)**: ✅ TDD workflow documented, unit/integration/e2e test structure defined, 80% coverage threshold enforced
- [x] **Principle III (Responsive Design)**: ✅ Tailwind breakpoints configured, responsive patterns documented, Playwright visual tests planned
- [x] **Principle IV (Modern Tech)**: ✅ All dependencies latest stable (TypeScript 5.7.2, React 18.3.1, Vite 5.4.11, Workbox 7.x), no deprecated libs
- [x] **Principle V (Observability)**: ✅ Structured logger integrated, performance tracking patterns defined, error logging with context

**Final Gate Status**: ✅ PASSED - All constitutional requirements satisfied in design phase. No violations introduced.

---

## Implementation Readiness

### Prerequisites Met
- ✅ Technology stack researched and decided
- ✅ Data model designed with schemas and relationships
- ✅ Development workflow documented
- ✅ Testing strategy defined (unit, integration, e2e)
- ✅ Performance targets established
- ✅ Security considerations addressed (CSP, sanitization)
- ✅ Accessibility patterns documented

### Ready for Phase 2 (Tasks)
The implementation plan is complete. Next step is `/speckit.tasks` command to break down user stories into specific implementation tasks with acceptance criteria.

**Recommended Task Order**:
1. P1: User Story 1 - Add and Read RSS Feeds (foundational)
2. P1: User Story 2 - Automatic Feed Refresh (core automation)
3. P2: User Story 3 - Offline Content Access (PWA capability)
4. P2: User Story 4 - OPML Import/Export (user migration)
5. P2: User Story 5 - Theme Customization (UX polish)
6. P3: User Stories 6-8 - Organization features (power user features)

---

## Artifacts Generated

| Artifact | Status | Description |
|----------|--------|-------------|
| plan.md | ✅ Complete | This file - comprehensive implementation plan |
| research.md | ✅ Complete | Technology decisions and rationale (9 research areas) |
| data-model.md | ✅ Complete | Entity schemas, relationships, IndexedDB design |
| quickstart.md | ✅ Complete | Developer onboarding guide with examples |
| checklists/requirements.md | ✅ Complete | Specification validation (from speckit.specify phase) |
| .github/agents/copilot-instructions.md | ✅ Updated | Agent context with tech stack |

**Total Documentation**: ~15,000 words across 4 planning documents

---

## Next Command

```bash
# Create implementation tasks from user stories
/speckit.tasks
```

This will generate `tasks.md` with specific implementation tasks, test scenarios, and acceptance criteria for each user story.
