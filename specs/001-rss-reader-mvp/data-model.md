# Data Model: RSS Reader PWA

**Feature**: RSS Reader MVP - Complete Application  
**Phase**: 1 (Design & Contracts)  
**Date**: 2026-01-25

## Overview

This document defines the data entities, schemas, relationships, and state transitions for the RSS Reader PWA. All entities are stored in IndexedDB for offline-first access and implement TypeScript interfaces for type safety.

## Entity Schemas

### Feed

Represents an RSS/Atom feed subscription.

**TypeScript Interface**:
```typescript
interface Feed {
  id: string;                    // UUID v4
  url: string;                   // RSS/Atom feed URL (https://...)
  title: string;                 // User-assigned or feed-provided title
  description?: string;          // Feed description/subtitle
  iconUrl?: string;              // Feed icon/favicon URL
  categoryId?: string;           // Foreign key to Category.id (null = uncategorized)
  lastFetchedAt?: Date;          // Last successful fetch timestamp
  lastFetchError?: string;       // Last error message (if fetch failed)
  refreshIntervalMinutes: number;// Refresh interval in minutes (default 60)
  paused: boolean;               // If true, skip auto-refresh
  errorCount: number;            // Consecutive error count (reset on success)
  createdAt: Date;               // Subscription creation timestamp
  deletedAt?: Date;              // Soft delete timestamp (7-day recovery)
}
```

**IndexedDB Store**:
- **Store Name**: `feeds`
- **Key Path**: `id`
- **Indexes**:
  - `categoryId` (non-unique) - for querying feeds by category
  - `deletedAt` (non-unique) - for soft delete recovery

**Validation Rules**:
- `url` must be valid HTTP/HTTPS URL
- `url` must be unique (prevent duplicate subscriptions)
- `title` must be non-empty (max 200 characters)
- `refreshIntervalMinutes` must be between 15 and 1440 (1 day)
- `errorCount` max value 10 (after 10 errors, mark feed as problematic)

**State Transitions**:
```
[Created] → [Active] → [Paused] → [Active]
                ↓
            [Deleted] → [Recovered] (within 7 days)
                ↓
            [Purged] (after 7 days)
```

---

### Article

Represents individual content item from a feed.

**TypeScript Interface**:
```typescript
interface Article {
  id: string;                    // UUID v4 or feed-provided GUID
  feedId: string;                // Foreign key to Feed.id
  title: string;                 // Article title
  summary?: string;              // Article summary/description
  content?: string;              // Full article content (HTML)
  author?: string;               // Article author name
  imageUrl?: string;             // Featured image URL
  link: string;                  // Canonical article URL
  publishedAt: Date;             // Original publish timestamp
  readAt?: Date;                 // User's read timestamp (null if unread)
  isFavorite: boolean;           // Favorite flag
  createdAt: Date;               // Article fetch timestamp
}
```

**IndexedDB Store**:
- **Store Name**: `articles`
- **Key Path**: `id`
- **Indexes**:
  - `feedId` (non-unique) - for querying articles by feed
  - `publishedAt` (non-unique) - for chronological sorting
  - `readAt` (non-unique) - for recently read list
  - `isFavorite` (non-unique) - for favorites filter

**Validation Rules**:
- `title` must be non-empty (max 500 characters)
- `link` must be valid URL
- `content` sanitized with DOMPurify before storage
- `publishedAt` cannot be in future

**State Transitions**:
```
[Fetched] → [Unread] → [Read]
              ↓           ↓
          [Favorited] [Favorited]
              ↓           ↓
         [Unfavorited] [Unfavorited]
```

---

### Category

User-created organizational group for feeds.

**TypeScript Interface**:
```typescript
interface Category {
  id: string;                    // UUID v4
  name: string;                  // Category name (user-assigned)
  order: number;                 // Display order (0-indexed)
  createdAt: Date;               // Category creation timestamp
}
```

**IndexedDB Store**:
- **Store Name**: `categories`
- **Key Path**: `id`
- **Indexes**:
  - `order` (non-unique) - for sorted display

**Validation Rules**:
- `name` must be non-empty (max 100 characters)
- `name` must be unique (case-insensitive)
- `order` must be non-negative integer

**Special Categories**:
- "Uncategorized" (virtual category, no database record) - feeds with `categoryId === null`

---

### UserSettings

Application preferences and user configuration.

**TypeScript Interface**:
```typescript
interface UserSettings {
  id: 'singleton';               // Always 'singleton' (single record)
  theme: 'light' | 'dark' | 'system'; // Theme preference
  defaultRefreshIntervalMinutes: number; // Global refresh interval
  maxArticlesPerFeed: number;    // Max articles to keep per feed
  enableNotifications: boolean;  // Push notification permission
  enableBackgroundSync: boolean; // Background sync permission
  lastSyncAt?: Date;             // Last successful sync timestamp
  updatedAt: Date;               // Settings last modified timestamp
}
```

**IndexedDB Store**:
- **Store Name**: `settings`
- **Key Path**: `id`
- **Indexes**: None (single record)

**Validation Rules**:
- `defaultRefreshIntervalMinutes` must be between 15 and 1440
- `maxArticlesPerFeed` must be between 50 and 1000

**Default Values**:
```typescript
const DEFAULT_SETTINGS: UserSettings = {
  id: 'singleton',
  theme: 'system',
  defaultRefreshIntervalMinutes: 60,
  maxArticlesPerFeed: 200,
  enableNotifications: false,
  enableBackgroundSync: true,
  updatedAt: new Date()
};
```

---

### SyncState

Tracks background sync status and queued operations.

**TypeScript Interface**:
```typescript
interface SyncState {
  id: 'singleton';               // Always 'singleton' (single record)
  isSyncing: boolean;            // Currently syncing flag
  lastSyncAt?: Date;             // Last successful sync timestamp
  lastSyncError?: string;        // Last sync error message
  queuedOperations: QueuedOperation[]; // Pending offline operations
  updatedAt: Date;               // State last modified timestamp
}

interface QueuedOperation {
  id: string;                    // UUID v4
  type: 'ADD_FEED' | 'DELETE_FEED' | 'MARK_READ' | 'FAVORITE'; // Operation type
  payload: any;                  // Operation-specific data
  createdAt: Date;               // Queue timestamp
  retryCount: number;            // Number of retry attempts
}
```

**IndexedDB Store**:
- **Store Name**: `syncState`
- **Key Path**: `id`
- **Indexes**: None (single record)

**Validation Rules**:
- `queuedOperations` max length 100 (prevent unbounded growth)
- `retryCount` max value 5 (discard after 5 failed attempts)

---

## Entity Relationships

```
Category (1) ──────< (M) Feed (1) ──────< (M) Article
                          │
                          │
                          └─────> UserSettings (singleton)
                          └─────> SyncState (singleton)
```

**Relationship Rules**:
1. **Category → Feed**: One-to-many. A category can have multiple feeds. A feed belongs to zero or one category.
2. **Feed → Article**: One-to-many. A feed has multiple articles. An article belongs to exactly one feed.
3. **Cascade Deletes**:
   - Deleting Category → Move feeds to "Uncategorized" (set `categoryId = null`)
   - Deleting Feed → Delete all articles (`feedId` match)
4. **Orphan Prevention**:
   - Articles without matching `feedId` are purged on startup
   - Feeds without matching `categoryId` are moved to "Uncategorized"

---

## IndexedDB Schema Migrations

### Version 1 (Initial Schema)

```typescript
// src/lib/storage.ts - onupgradeneeded handler
request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result;
  const oldVersion = event.oldVersion;
  
  if (oldVersion < 1) {
    // Feeds store
    const feedStore = db.createObjectStore('feeds', { keyPath: 'id' });
    feedStore.createIndex('categoryId', 'categoryId', { unique: false });
    feedStore.createIndex('deletedAt', 'deletedAt', { unique: false });
    
    // Articles store
    const articleStore = db.createObjectStore('articles', { keyPath: 'id' });
    articleStore.createIndex('feedId', 'feedId', { unique: false });
    articleStore.createIndex('publishedAt', 'publishedAt', { unique: false });
    articleStore.createIndex('readAt', 'readAt', { unique: false });
    articleStore.createIndex('isFavorite', 'isFavorite', { unique: false });
    
    // Categories store
    const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
    categoryStore.createIndex('order', 'order', { unique: false });
    
    // Settings store
    db.createObjectStore('settings', { keyPath: 'id' });
    
    // SyncState store
    db.createObjectStore('syncState', { keyPath: 'id' });
  }
};
```

### Version 2 (Future: Add ReadingHistory)

```typescript
if (oldVersion < 2) {
  // ReadingHistory store (separate from Article.readAt for performance)
  const historyStore = db.createObjectStore('readingHistory', { keyPath: 'id' });
  historyStore.createIndex('articleId', 'articleId', { unique: false });
  historyStore.createIndex('readAt', 'readAt', { unique: false });
}
```

---

## Data Access Patterns

### Common Queries

**1. Get All Feeds by Category**
```typescript
const feeds = await storage.getAllByIndex<Feed>('feeds', 'categoryId', categoryId);
```

**2. Get Recent Articles (Last 50)**
```typescript
const articles = await storage.getAllByIndexReverse<Article>(
  'articles', 
  'publishedAt', 
  null, 
  50
);
```

**3. Get Unread Articles for Feed**
```typescript
const articles = await storage.getAll<Article>('articles');
const unreadArticles = articles.filter(a => a.feedId === feedId && !a.readAt);
```

**4. Get Favorite Articles**
```typescript
const favorites = await storage.getAllByIndex<Article>('articles', 'isFavorite', true);
```

**5. Get Recently Deleted Feeds (7-day recovery)**
```typescript
const now = Date.now();
const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
const deletedFeeds = await storage.getAll<Feed>('feeds');
const recoverableFeeds = deletedFeeds.filter(f => 
  f.deletedAt && f.deletedAt.getTime() > sevenDaysAgo
);
```

---

## Storage Quota Management

### Monitoring
```typescript
async function getStorageUsage() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentUsed: (estimate.usage! / estimate.quota!) * 100
    };
  }
  return null;
}
```

### Cleanup Strategies
1. **Auto-prune old articles**: Remove read articles older than 30 days (keep favorites)
2. **Feed article limits**: Keep max N articles per feed (configurable, default 200)
3. **Soft-delete purge**: Permanently delete feeds after 7-day recovery window
4. **Cache size limits**: Implement LRU cache for article images

```typescript
async function pruneOldArticles() {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const articles = await storage.getAll<Article>('articles');
  
  const toDelete = articles.filter(a => 
    !a.isFavorite && 
    a.readAt && 
    a.readAt.getTime() < thirtyDaysAgo
  );
  
  await Promise.all(
    toDelete.map(a => storage.delete<Article>('articles', a.id))
  );
  
  logger.info('Pruned old articles', { count: toDelete.length });
}
```

---

## Data Synchronization

### Background Sync Flow

```
[User Actions] → [Queue Operation] → [Offline Storage]
                        ↓
            [Online Event Detected]
                        ↓
              [Process Sync Queue]
                        ↓
           [Apply Operations in Order]
                        ↓
            [Update Sync State]
```

**Queued Operation Types**:
1. `ADD_FEED`: Add new feed subscription (requires network)
2. `DELETE_FEED`: Soft delete feed (local only, sync delete timestamp)
3. `MARK_READ`: Mark article as read (local only)
4. `FAVORITE`: Toggle article favorite (local only)

**Sync Priority**:
1. High priority: `ADD_FEED`, `DELETE_FEED` (affect feed list)
2. Medium priority: `MARK_READ`, `FAVORITE` (affect article state)
3. Low priority: Background feed refresh

---

## Data Validation

### Feed URL Validation
```typescript
function validateFeedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
```

### HTML Content Sanitization
```typescript
import DOMPurify from 'dompurify';

function sanitizeArticleContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'img', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'pre', 'code'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel']
  });
}
```

---

## Testing Strategy

### Unit Tests (Vitest)
- Entity validation rules
- Data access pattern correctness
- Storage quota calculations
- Sanitization functions

### Integration Tests (Vitest + fake-indexeddb)
- CRUD operations on all entity types
- Cascade deletes and orphan prevention
- IndexedDB migrations (version upgrades)
- Bulk operations (OPML import)

### E2E Tests (Playwright)
- Full user workflows with data persistence
- Offline mode with queued operations
- Storage quota exceeded scenarios
- Data recovery after browser restart

---

## Performance Targets

- **Read Operation**: < 50ms for single entity, < 200ms for bulk query (100 records)
- **Write Operation**: < 100ms for single entity, < 500ms for bulk write (50 records)
- **Migration**: < 2s for version upgrade with 1000 existing records
- **Storage Size**: < 100MB typical usage (50 feeds, 5000 articles, 500 images)

---

## Conclusion

Data model designed for:
1. **Offline-first**: All entities in IndexedDB, no server dependencies
2. **Type safety**: TypeScript interfaces for all entities
3. **Performance**: Indexed queries for common access patterns
4. **Extensibility**: Migration system for schema evolution
5. **Data integrity**: Validation rules, cascade deletes, orphan prevention

**Next Phase**: Contract definitions (if API integration needed) and quickstart.md developer guide.
