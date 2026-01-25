# Tasks: RSS Reader PWA - Complete Application

**Feature**: RSS Reader MVP (001-rss-reader-mvp)  
**Input**: Design documents from `/specs/001-rss-reader-mvp/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ quickstart.md

**Constitution Requirement - Test-First (MANDATORY)**: Per RSS Reader Constitution Principle II, EVERY feature implementation MUST follow TDD. Tests MUST be written FIRST and MUST FAIL before implementation begins. Minimum 80% code coverage required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Each phase represents a complete, independently deployable increment.

## Task Format

- **Checkbox**: `- [ ]` for incomplete, `- [x]` for complete
- **Task ID**: Sequential number (T001, T002, T003...)
- **[P] marker**: Task can run in parallel with others (different files, no blocking dependencies)
- **[Story] label**: User story association (US1, US2, etc.) - REQUIRED for story phases
- **File paths**: Exact paths included in every task description

## Tech Stack Summary

- TypeScript 5.7.2 strict mode + React 18.3.1 + Zustand 4.5.5
- Vite 5.4.11 + Vitest 2.1.8 + Playwright 1.48.2
- Tailwind CSS 4.0.0 (breakpoints: 375px/768px/1024px)
- Workbox 7.x (Service Worker)
- IndexedDB (via custom Storage class)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization completed in previous commit (7fe3123)

- [x] T001 Create project structure per implementation plan
- [x] T002 Initialize TypeScript + React + Vite project with dependencies
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript strict mode
- [x] T004 [P] Setup Tailwind CSS 4.0 with custom breakpoints (375/768/1024px)
- [x] T005 [P] Configure Vitest with jsdom environment and 80% coverage threshold
- [x] T006 [P] Setup Playwright for E2E testing
- [x] T007 Create base TypeScript interfaces in src/models/Feed.ts
- [x] T008 [P] Implement structured JSON logger in src/lib/logger.ts
- [x] T009 [P] Create IndexedDB Storage abstraction in src/lib/storage.ts
- [x] T010 [P] Create Web App Manifest in public/manifest.json
- [x] T011 Create example unit tests (9/9 passing)

**Status**: ✅ Setup complete - Foundation ready for feature implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Infrastructure & Core Libraries

- [x] T012 [P] Install Workbox dependencies (vite-plugin-pwa@^0.17.5, workbox-precaching@^7.0.0, workbox-routing@^7.0.0, workbox-strategies@^7.0.0) in package.json
- [x] T013 [P] Install DOMPurify@^3.0.8 and @types/dompurify@^3.0.5 for HTML sanitization in package.json
- [x] T014 [P] Install fake-indexeddb@^5.0.2 as dev dependency for testing in package.json
- [x] T015 Configure vite-plugin-pwa in vite.config.ts with injectManifest strategy
- [x] T016 [P] Create RSS parser utility using DOMParser in src/lib/rssParser.ts
- [x] T017 [P] Create HTML sanitization utility using DOMPurify in src/utils/sanitize.ts
- [x] T018 [P] Create URL validation utility in src/utils/validators.ts
- [x] T019 [P] Create date formatting utility in src/utils/dateFormat.ts

### Service Worker & PWA

- [x] T020 Create Service Worker entry point in src/workers/sw.ts with Workbox imports
- [x] T021 Implement precaching strategy for app shell (HTML, CSS, JS, fonts, icons) in src/workers/sw.ts
- [x] T022 Implement cache-first strategy for RSS feed responses in src/workers/sw.ts
- [x] T023 Implement stale-while-revalidate strategy for article images in src/workers/sw.ts
- [x] T024 Configure background sync for feed refresh in src/workers/sw.ts
- [x] T025 Update Service Worker registration in src/main.tsx to use Workbox plugin

### IndexedDB Schema Enhancements

- [x] T026 Add categories object store to IndexedDB schema in src/lib/storage.ts (version 1)
- [x] T027 Add settings object store to IndexedDB schema in src/lib/storage.ts (version 1)
- [x] T028 Add syncState object store to IndexedDB schema in src/lib/storage.ts (version 1)
- [x] T029 [P] Implement bulk write operations for OPML import in src/lib/storage.ts
- [x] T030 [P] Implement storage quota monitoring utility in src/lib/storage.ts

### Core Services

- [x] T031 Complete RSS feed fetching in src/services/feedService.ts (replace placeholder)
- [x] T032 Implement RSS 2.0 parsing logic in src/lib/rssParser.ts
- [x] T033 Implement Atom 1.0 parsing logic in src/lib/rssParser.ts
- [x] T034 [P] Create OPML export service in src/services/opmlService.ts
- [x] T035 [P] Create OPML import service in src/services/opmlService.ts
- [x] T036 [P] Create sync service for background operations in src/services/syncService.ts
- [x] T037 [P] Create cache management service in src/services/cacheService.ts

### Theme Management

- [x] T038 [P] Create theme hook in src/hooks/useTheme.ts
- [x] T039 Update App.tsx to use useTheme hook and apply dark class
- [x] T040 [P] Add CSS variables for light/dark themes in src/styles/globals.css

### Testing Infrastructure

- [ ] T041 [P] Write unit tests for RSS parser (10+ test cases) in tests/unit/rssParser.test.ts
- [ ] T042 [P] Write unit tests for OPML service (import/export) in tests/unit/opmlService.test.ts
- [ ] T043 [P] Write unit tests for validators in tests/unit/validators.test.ts
- [ ] T044 [P] Write unit tests for Storage bulk operations in tests/unit/storage.test.ts
- [ ] T045 [P] Setup MSW for API mocking in tests/setup.ts
- [ ] T046 [P] Create test fixtures for RSS/Atom feeds in tests/fixtures/

**Checkpoint**: ✅ Foundation ready - User story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add and Read RSS Feeds (Priority: P1) 🎯 MVP Core

**Goal**: Users can add RSS feed subscriptions by entering a URL, and view article content with proper formatting

**Independent Test**: Add feed URL "https://example.com/feed.xml" → verify feed appears in list → click feed → view articles → click article → read full content

**Success Criteria**:
- SC-001: Users can add feed and view articles in <30s
- SC-002: 95% of article content renders correctly
- SC-006: System parses 95% of valid RSS/Atom feeds

### Tests for User Story 1 (Write FIRST, ensure FAIL)

- [ ] T047 [P] [US1] Integration test: Add feed workflow in tests/integration/addFeed.test.ts
- [ ] T048 [P] [US1] Integration test: View articles workflow in tests/integration/viewArticles.test.ts
- [ ] T049 [P] [US1] Integration test: Read article content in tests/integration/readArticle.test.ts
- [ ] T050 [P] [US1] E2E test: Complete add-feed-and-read journey in tests/e2e/addFeed.spec.ts
- [ ] T051 [P] [US1] Unit test: Feed URL validation (valid/invalid cases) in tests/unit/addFeedDialog.test.ts

### UI Components for User Story 1

- [ ] T052 [P] [US1] Create AddFeedDialog component in src/components/AddFeedDialog/AddFeedDialog.tsx
- [ ] T053 [P] [US1] Create FeedList component in src/components/FeedList/FeedList.tsx
- [ ] T054 [P] [US1] Create FeedCard component in src/components/FeedList/FeedCard.tsx
- [ ] T055 [P] [US1] Create ArticleList component in src/components/ArticleList/ArticleList.tsx
- [ ] T056 [P] [US1] Create ArticleItem component in src/components/ArticleList/ArticleItem.tsx
- [ ] T057 [P] [US1] Create ArticleView component in src/components/ArticleView/ArticleView.tsx
- [ ] T058 [P] [US1] Create LoadingSpinner component in src/components/Common/LoadingSpinner.tsx
- [ ] T059 [P] [US1] Create ErrorMessage component in src/components/Common/ErrorMessage.tsx

### State Management for User Story 1

- [ ] T060 [US1] Add subscribeFeed action to Zustand store in src/hooks/useStore.ts
- [ ] T061 [US1] Add fetchArticles action to Zustand store in src/hooks/useStore.ts
- [ ] T062 [US1] Add error state management to Zustand store in src/hooks/useStore.ts

### Services & Logic for User Story 1

- [ ] T063 [US1] Implement subscribeFeed in src/services/feedService.ts (fetch, parse, store feed)
- [ ] T064 [US1] Implement fetchAndStoreArticles in src/services/feedService.ts
- [ ] T065 [US1] Add error handling for network failures in src/services/feedService.ts
- [ ] T066 [US1] Add error handling for malformed feeds in src/services/feedService.ts
- [ ] T067 [US1] Implement duplicate feed detection in src/services/feedService.ts

### Pages for User Story 1

- [ ] T068 [US1] Update FeedList page in src/pages/FeedList.tsx (remove placeholder, add real components)
- [ ] T069 [US1] Update ArticleDetail page in src/pages/ArticleDetail.tsx (remove placeholder, add ArticleView)
- [ ] T070 [US1] Add routing between FeedList and ArticleDetail in src/App.tsx

### Styling for User Story 1

- [ ] T071 [P] [US1] Style AddFeedDialog with Tailwind (mobile/tablet/desktop responsive)
- [ ] T072 [P] [US1] Style FeedList with Tailwind grid (mobile:1col, tablet:2col, desktop:3col)
- [ ] T073 [P] [US1] Style ArticleView with Tailwind (max-width, readable typography)

**Checkpoint**: ✅ User Story 1 complete - Users can add feeds and read articles (MVP core delivered)

---

## Phase 4: User Story 2 - Automatic Feed Refresh (Priority: P1) 🎯 MVP Core

**Goal**: System automatically refreshes all subscribed feeds at configurable intervals without user intervention

**Independent Test**: Add feed → wait for refresh interval (or mock timer) → verify new articles appear → change refresh interval in settings → verify new schedule applied

**Success Criteria**:
- SC-007: Feed refresh completes in <5s for feeds with <50 articles
- SC-012: Background sync queues and executes deferred operations

### Tests for User Story 2 (Write FIRST, ensure FAIL)

- [ ] T074 [P] [US2] Unit test: Auto-refresh timer with mocked timers in tests/unit/syncService.test.ts
- [ ] T075 [P] [US2] Unit test: Refresh interval configuration in tests/unit/settings.test.ts
- [ ] T076 [P] [US2] Integration test: Background sync queue in tests/integration/backgroundSync.test.ts
- [ ] T077 [P] [US2] E2E test: Feed auto-refresh workflow in tests/e2e/autoRefresh.spec.ts

### Services for User Story 2

- [ ] T078 [US2] Implement startAutoRefresh in src/services/syncService.ts
- [ ] T079 [US2] Implement scheduleNextRefresh with setTimeout in src/services/syncService.ts
- [ ] T080 [US2] Implement refreshAllFeeds batch operation in src/services/syncService.ts
- [ ] T081 [US2] Add refresh interval configuration to UserSettings in src/models/Feed.ts
- [ ] T082 [US2] Integrate background sync API in Service Worker in src/workers/sw.ts

### UI Components for User Story 2

- [ ] T083 [P] [US2] Create Settings page in src/pages/Settings.tsx
- [ ] T084 [P] [US2] Create RefreshIntervalSelector component in src/components/Settings/RefreshIntervalSelector.tsx
- [ ] T085 [P] [US2] Add last refresh timestamp display to FeedCard in src/components/FeedList/FeedCard.tsx
- [ ] T086 [P] [US2] Add manual refresh button to FeedList in src/components/FeedList/FeedList.tsx

### State Management for User Story 2

- [ ] T087 [US2] Add updateSettings action to Zustand store in src/hooks/useStore.ts
- [ ] T088 [US2] Add refreshAllFeeds action to Zustand store in src/hooks/useStore.ts
- [ ] T089 [US2] Add sync state management to Zustand store in src/hooks/useStore.ts

### Integration for User Story 2

- [ ] T090 [US2] Initialize syncService in src/main.tsx on app startup
- [ ] T091 [US2] Add refresh scheduling to App.tsx lifecycle
- [ ] T092 [US2] Add error logging for failed refreshes in src/services/syncService.ts

**Checkpoint**: ✅ User Story 2 complete - Feeds refresh automatically in background

---

## Phase 5: User Story 3 - Offline Content Access (Priority: P2) 🔥 PWA Essential

**Goal**: Users can access previously loaded articles even when offline, with proper offline indicators

**Independent Test**: Load articles while online → disconnect network → verify articles accessible → verify offline indicator shown → reconnect → verify sync resumes

**Success Criteria**:
- SC-003: Users access offline content within 2s
- SC-009: IndexedDB operations complete in <200ms
- SC-011: System handles network failures gracefully

### Tests for User Story 3 (Write FIRST, ensure FAIL)

- [ ] T093 [P] [US3] Integration test: Offline article access in tests/integration/offlineAccess.test.ts
- [ ] T094 [P] [US3] Integration test: Offline indicator display in tests/integration/offlineUI.test.ts
- [ ] T095 [P] [US3] Integration test: Sync queue when offline in tests/integration/offlineSync.test.ts
- [ ] T096 [P] [US3] E2E test: Complete offline workflow with network throttling in tests/e2e/offline.spec.ts

### Services for User Story 3

- [ ] T097 [US3] Implement offline detection in src/lib/pwa.ts (update existing function)
- [ ] T098 [US3] Implement operation queueing when offline in src/services/syncService.ts
- [ ] T099 [US3] Implement cache-first strategy for articles in Service Worker in src/workers/sw.ts
- [ ] T100 [US3] Add retry logic for queued operations in src/services/syncService.ts

### UI Components for User Story 3

- [ ] T101 [P] [US3] Create OfflineIndicator component in src/components/Common/OfflineIndicator.tsx
- [ ] T102 [P] [US3] Add offline indicator to App.tsx header
- [ ] T103 [P] [US3] Update AddFeedDialog to disable when offline in src/components/AddFeedDialog/AddFeedDialog.tsx
- [ ] T104 [P] [US3] Show cached indicator on offline articles in ArticleList

### State Management for User Story 3

- [ ] T105 [US3] Add isOnline state to Zustand store in src/hooks/useStore.ts
- [ ] T106 [US3] Add queuedOperations state to Zustand store in src/hooks/useStore.ts
- [ ] T107 [US3] Create useOfflineDetection hook in src/hooks/useOfflineDetection.ts

### Storage for User Story 3

- [ ] T108 [US3] Implement cache size monitoring in src/lib/storage.ts
- [ ] T109 [US3] Implement article pruning strategy (keep unread + favorites) in src/services/cacheService.ts
- [ ] T110 [US3] Add storage quota exceeded handling in src/services/cacheService.ts

**Checkpoint**: ✅ User Story 3 complete - Full offline support with caching and sync

---

## Phase 6: User Story 4 - OPML Import/Export (Priority: P2) 📦 User Migration

**Goal**: Users can import existing feed subscriptions from OPML files and export their subscriptions for backup/migration

**Independent Test**: Export subscriptions to OPML → clear all feeds → import OPML → verify all feeds restored with categories

**Success Criteria**:
- SC-008: OPML import of 100+ feeds remains responsive
- SC-014: OPML export generates valid files
- SC-018: >85% success rate on first import attempt

### Tests for User Story 4 (Write FIRST, ensure FAIL)

- [ ] T111 [P] [US4] Unit test: OPML export with categories in tests/unit/opmlService.test.ts (add to existing file)
- [ ] T112 [P] [US4] Unit test: OPML import validation in tests/unit/opmlService.test.ts
- [ ] T113 [P] [US4] Integration test: Export-import round-trip in tests/integration/opml.test.ts
- [ ] T114 [P] [US4] E2E test: Complete OPML workflow in tests/e2e/opmlImport.spec.ts
- [ ] T115 [P] [US4] Unit test: Handle malformed OPML files in tests/unit/opmlService.test.ts

### Services for User Story 4

- [ ] T116 [US4] Complete exportToOPML implementation in src/services/opmlService.ts
- [ ] T117 [US4] Complete importFromOPML implementation in src/services/opmlService.ts
- [ ] T118 [US4] Add OPML XML validation in src/services/opmlService.ts
- [ ] T119 [US4] Add category preservation during import in src/services/opmlService.ts
- [ ] T120 [US4] Add progress tracking for large OPML imports in src/services/opmlService.ts

### UI Components for User Story 4

- [ ] T121 [P] [US4] Create OPMLImportDialog component in src/components/Settings/OPMLImportDialog.tsx
- [ ] T122 [P] [US4] Create OPMLExportButton component in src/components/Settings/OPMLExportButton.tsx
- [ ] T123 [P] [US4] Add file input and progress indicator to OPMLImportDialog
- [ ] T124 [P] [US4] Add validation error display to OPMLImportDialog

### State Management for User Story 4

- [ ] T125 [US4] Add importOPML action to Zustand store in src/hooks/useStore.ts
- [ ] T126 [US4] Add exportOPML action to Zustand store in src/hooks/useStore.ts
- [ ] T127 [US4] Add import progress state to Zustand store in src/hooks/useStore.ts

### Pages Integration for User Story 4

- [ ] T128 [US4] Add OPML import/export section to Settings page in src/pages/Settings.tsx
- [ ] T129 [US4] Add error handling for invalid OPML files in Settings page

**Checkpoint**: ✅ User Story 4 complete - Users can migrate feeds via OPML

---

## Phase 7: User Story 5 - Theme Customization (Priority: P2) 🎨 UX Polish

**Goal**: Users can switch between light/dark themes with system preference detection and manual override

**Independent Test**: Open app in dark mode → verify dark theme → manually switch to light → verify persistence across reload → reset to system → verify system tracking

**Success Criteria**:
- SC-004: Theme changes apply instantly (<100ms)
- No visual flicker or layout shift during theme transition

### Tests for User Story 5 (Write FIRST, ensure FAIL)

- [ ] T130 [P] [US5] Unit test: Theme hook with system preference in tests/unit/useTheme.test.ts
- [ ] T131 [P] [US5] Unit test: Theme persistence in localStorage in tests/unit/useTheme.test.ts
- [ ] T132 [P] [US5] Integration test: Theme switching workflow in tests/integration/themeSwitch.test.ts
- [ ] T133 [P] [US5] E2E test: Theme persistence across sessions in tests/e2e/theme.spec.ts

### Services for User Story 5

- [ ] T134 [US5] Complete useTheme hook implementation in src/hooks/useTheme.ts
- [ ] T135 [US5] Add system preference listener in src/hooks/useTheme.ts
- [ ] T136 [US5] Add localStorage persistence in src/hooks/useTheme.ts
- [ ] T137 [US5] Update UserSettings to include theme preference in src/models/Feed.ts

### UI Components for User Story 5

- [ ] T138 [P] [US5] Create ThemeSelector component in src/components/Settings/ThemeSelector.tsx
- [ ] T139 [P] [US5] Add theme toggle button to app header in src/App.tsx
- [ ] T140 [P] [US5] Style theme selector with icon indicators (sun/moon/auto)

### Styling for User Story 5

- [ ] T141 [US5] Complete CSS variables for light theme in src/styles/globals.css
- [ ] T142 [US5] Complete CSS variables for dark theme in src/styles/globals.css
- [ ] T143 [US5] Ensure all components use theme variables (audit existing components)
- [ ] T144 [US5] Add smooth transition for theme changes (200ms) in src/styles/globals.css

### Integration for User Story 5

- [ ] T145 [US5] Initialize theme on app startup in src/main.tsx
- [ ] T146 [US5] Add theme preference to Settings page in src/pages/Settings.tsx

**Checkpoint**: ✅ User Story 5 complete - Full theme customization with system integration

---

## Phase 8: User Story 6 - Organize Feeds by Category (Priority: P3) 📁 Organization

**Goal**: Users can create custom categories and organize feed subscriptions into groups

**Independent Test**: Create category "Technology" → add 3 feeds to it → verify organization → rename category → verify feeds maintain association

**Success Criteria**:
- Categories display feeds correctly
- Drag-and-drop works across viewports
- Category deletion moves feeds to "Uncategorized"

### Tests for User Story 6 (Write FIRST, ensure FAIL)

- [ ] T147 [P] [US6] Unit test: Category creation validation in tests/unit/categoryService.test.ts
- [ ] T148 [P] [US6] Unit test: Feed categorization logic in tests/unit/categoryService.test.ts
- [ ] T149 [P] [US6] Integration test: Category CRUD operations in tests/integration/categories.test.ts
- [ ] T150 [P] [US6] E2E test: Create and organize categories in tests/e2e/categories.spec.ts

### Services for User Story 6

- [ ] T151 [US6] Create categoryService with CRUD operations in src/services/categoryService.ts
- [ ] T152 [US6] Add category validation (unique names) in src/services/categoryService.ts
- [ ] T153 [US6] Add feed reassignment logic in src/services/categoryService.ts
- [ ] T154 [US6] Handle category deletion (move feeds to uncategorized) in src/services/categoryService.ts

### UI Components for User Story 6

- [ ] T155 [P] [US6] Create CategoryList component in src/components/CategoryManager/CategoryList.tsx
- [ ] T156 [P] [US6] Create CategoryItem component in src/components/CategoryManager/CategoryItem.tsx
- [ ] T157 [P] [US6] Create CreateCategoryDialog component in src/components/CategoryManager/CreateCategoryDialog.tsx
- [ ] T158 [P] [US6] Add drag-and-drop support to FeedCard in src/components/FeedList/FeedCard.tsx
- [ ] T159 [P] [US6] Add category filter to FeedList in src/components/FeedList/FeedList.tsx

### State Management for User Story 6

- [ ] T160 [US6] Add categories state to Zustand store in src/hooks/useStore.ts
- [ ] T161 [US6] Add createCategory action to Zustand store in src/hooks/useStore.ts
- [ ] T162 [US6] Add deleteCategory action to Zustand store in src/hooks/useStore.ts
- [ ] T163 [US6] Add assignFeedToCategory action to Zustand store in src/hooks/useStore.ts

### Storage for User Story 6

- [ ] T164 [US6] Ensure categories object store is functional in src/lib/storage.ts (verify T026)
- [ ] T165 [US6] Add category query helpers in src/lib/storage.ts

### Pages Integration for User Story 6

- [ ] T166 [US6] Add category management section to Settings page in src/pages/Settings.tsx
- [ ] T167 [US6] Update FeedList page to show category groups in src/pages/FeedList.tsx

**Checkpoint**: ✅ User Story 6 complete - Full category management and organization

---

## Phase 9: User Story 7 - Reading History and Favorites (Priority: P3) ⭐ Power Features

**Goal**: Users can see recently read articles and mark articles as favorites for easy access

**Independent Test**: Read 5 articles → check "Recently Read" shows all 5 → mark 2 as favorites → verify in "Favorites" section → unfavorite → verify removal

**Success Criteria**:
- SC-013: Read status persists across sessions
- SC-020: Last 50 articles in Recently Read
- Favorite count displayed per feed

### Tests for User Story 7 (Write FIRST, ensure FAIL)

- [ ] T168 [P] [US7] Unit test: Mark article as read with timestamp in tests/unit/articleService.test.ts
- [ ] T169 [P] [US7] Unit test: Toggle favorite status in tests/unit/articleService.test.ts
- [ ] T170 [P] [US7] Integration test: Recently Read list ordering in tests/integration/readingHistory.test.ts
- [ ] T171 [P] [US7] E2E test: Favorites workflow in tests/e2e/favorites.spec.ts

### Services for User Story 7

- [ ] T172 [US7] Create articleService with read/favorite operations in src/services/articleService.ts
- [ ] T173 [US7] Implement markAsRead in src/services/articleService.ts
- [ ] T174 [US7] Implement toggleFavorite in src/services/articleService.ts
- [ ] T175 [US7] Implement getRecentlyRead query in src/services/articleService.ts

### UI Components for User Story 7

- [ ] T176 [P] [US7] Create Favorites page in src/pages/Favorites.tsx
- [ ] T177 [P] [US7] Create RecentlyRead page in src/pages/RecentlyRead.tsx
- [ ] T178 [P] [US7] Add favorite button to ArticleView in src/components/ArticleView/ArticleView.tsx
- [ ] T179 [P] [US7] Add read indicator to ArticleItem in src/components/ArticleList/ArticleItem.tsx
- [ ] T180 [P] [US7] Add favorite count badge to FeedCard in src/components/FeedList/FeedCard.tsx

### State Management for User Story 7

- [ ] T181 [US7] Add markArticleAsRead action to Zustand store in src/hooks/useStore.ts
- [ ] T182 [US7] Add toggleFavorite action to Zustand store in src/hooks/useStore.ts
- [ ] T183 [US7] Add recentlyRead state to Zustand store in src/hooks/useStore.ts
- [ ] T184 [US7] Add favorites state to Zustand store in src/hooks/useStore.ts

### Storage for User Story 7

- [ ] T185 [US7] Add readAt index query helpers in src/lib/storage.ts
- [ ] T186 [US7] Add isFavorite index query helpers in src/lib/storage.ts

### Navigation for User Story 7

- [ ] T187 [US7] Add Favorites link to main navigation in src/App.tsx
- [ ] T188 [US7] Add Recently Read link to main navigation in src/App.tsx

**Checkpoint**: ✅ User Story 7 complete - Reading history and favorites tracking

---

## Phase 10: User Story 8 - Feed Management (Priority: P3) ⚙️ Power Features

**Goal**: Users can edit feed titles, change refresh intervals, pause feeds, and delete with 7-day recovery

**Independent Test**: Add feed → edit title → verify change → pause feed → verify no updates → delete → verify soft delete → restore within 7 days

**Success Criteria**:
- Per-feed refresh intervals work correctly
- Paused feeds skip auto-refresh
- Soft delete with 7-day recovery window
- Feed metadata displays correctly

### Tests for User Story 8 (Write FIRST, ensure FAIL)

- [ ] T189 [P] [US8] Unit test: Feed editing validation in tests/unit/feedManagement.test.ts
- [ ] T190 [P] [US8] Unit test: Soft delete with timestamp in tests/unit/feedManagement.test.ts
- [ ] T191 [P] [US8] Unit test: Feed restore within 7 days in tests/unit/feedManagement.test.ts
- [ ] T192 [P] [US8] Integration test: Pause/unpause workflow in tests/integration/feedPause.test.ts
- [ ] T193 [P] [US8] E2E test: Complete feed management in tests/e2e/feedManagement.spec.ts

### Services for User Story 8

- [ ] T194 [US8] Implement updateFeed in src/services/feedService.ts
- [ ] T195 [US8] Implement pauseFeed/unpauseFeed in src/services/feedService.ts
- [ ] T196 [US8] Implement softDeleteFeed in src/services/feedService.ts
- [ ] T197 [US8] Implement restoreFeed in src/services/feedService.ts
- [ ] T198 [US8] Add 7-day purge job for deleted feeds in src/services/cacheService.ts

### UI Components for User Story 8

- [ ] T199 [P] [US8] Create EditFeedDialog component in src/components/FeedList/EditFeedDialog.tsx
- [ ] T200 [P] [US8] Create RecentlyDeleted page in src/pages/RecentlyDeleted.tsx
- [ ] T201 [P] [US8] Add context menu to FeedCard with Edit/Pause/Delete in src/components/FeedList/FeedCard.tsx
- [ ] T202 [P] [US8] Add pause toggle switch to EditFeedDialog
- [ ] T203 [P] [US8] Add delete confirmation modal to FeedList

### State Management for User Story 8

- [ ] T204 [US8] Add updateFeed action to Zustand store in src/hooks/useStore.ts
- [ ] T205 [US8] Add pauseFeed action to Zustand store in src/hooks/useStore.ts
- [ ] T206 [US8] Add deleteFeed action to Zustand store in src/hooks/useStore.ts
- [ ] T207 [US8] Add restoreFeed action to Zustand store in src/hooks/useStore.ts

### Storage for User Story 8

- [ ] T208 [US8] Add deletedAt index query for soft-deleted feeds in src/lib/storage.ts
- [ ] T209 [US8] Implement feed purge logic (7 days) in src/services/cacheService.ts

### Integration for User Story 8

- [ ] T210 [US8] Update refresh logic to skip paused feeds in src/services/syncService.ts
- [ ] T211 [US8] Add per-feed refresh interval support to syncService

**Checkpoint**: ✅ User Story 8 complete - Comprehensive feed management capabilities

---

## Phase 11: Polish & Cross-Cutting Concerns 🎯

**Purpose**: Final polish, performance optimization, accessibility, and production readiness

### Performance Optimization

- [ ] T212 [P] Implement lazy loading for article images in ArticleView component
- [ ] T213 [P] Add pagination for article lists (50 articles per page)
- [ ] T214 [P] Optimize IndexedDB batch operations for large datasets
- [ ] T215 [P] Implement image caching strategy in Service Worker
- [ ] T216 [P] Bundle size audit and optimization (<500KB gzipped)

### Accessibility (WCAG 2.1 AA)

- [ ] T217 [P] Add ARIA labels to all icon-only buttons
- [ ] T218 [P] Ensure keyboard navigation works for all interactive elements
- [ ] T219 [P] Add focus management for modals and dialogs
- [ ] T220 [P] Test with screen readers (VoiceOver, TalkBack)
- [ ] T221 [P] Add skip-to-content link for keyboard users

### Error Handling & Observability

- [ ] T222 [P] Add error boundaries to React components
- [ ] T223 [P] Implement global error handler for uncaught exceptions
- [ ] T224 [P] Add performance monitoring (feed fetch time, render time)
- [ ] T225 [P] Add user analytics tracking (optional, with consent)
- [ ] T226 [P] Implement Sentry integration for production error tracking

### PWA Assets

- [ ] T227 [P] Create 192x192 app icon in public/icons/icon-192.png
- [ ] T228 [P] Create 512x512 app icon in public/icons/icon-512.png
- [ ] T229 [P] Create favicon.ico
- [ ] T230 [P] Add apple-touch-icon for iOS
- [ ] T231 [P] Update manifest.json with final metadata

### Responsive Design Validation

- [ ] T232 [P] Playwright visual tests at 375px viewport in tests/e2e/responsive.spec.ts
- [ ] T233 [P] Playwright visual tests at 768px viewport in tests/e2e/responsive.spec.ts
- [ ] T234 [P] Playwright visual tests at 1024px viewport in tests/e2e/responsive.spec.ts
- [ ] T235 [P] Manual testing on real iOS device (Safari)
- [ ] T236 [P] Manual testing on real Android device (Chrome)

### Documentation

- [ ] T237 [P] Update README.md with screenshots and features
- [ ] T238 [P] Create CHANGELOG.md documenting all user stories
- [ ] T239 [P] Add inline code documentation for complex functions
- [ ] T240 [P] Create user guide for OPML import/export

### Security & CSP

- [ ] T241 [P] Implement Content Security Policy in index.html
- [ ] T242 [P] Add DOMPurify sanitization for all article content
- [ ] T243 [P] Validate and sanitize all user inputs
- [ ] T244 [P] Add rate limiting for feed fetching

### Testing & Coverage

- [ ] T245 Verify 80% test coverage threshold met (run npm run test:coverage)
- [ ] T246 [P] Add integration tests for edge cases from spec.md
- [ ] T247 [P] Performance tests for large feeds (10MB+ files)
- [ ] T248 [P] Stress test OPML import with 100+ feeds
- [ ] T249 [P] Add contract tests for RSS/Atom feed formats

### Final QA

- [ ] T250 Lighthouse audit (target: Performance 90+, Accessibility 100, PWA 100)
- [ ] T251 Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] T252 PWA installation test (Android, iOS, Desktop)
- [ ] T253 Offline functionality verification
- [ ] T254 All user acceptance criteria verified (8 user stories)

**Checkpoint**: ✅ Production Ready - All user stories complete, polished, and tested

---

## Dependencies & Execution Strategy

### Story Completion Order (Recommended)

```
Phase 1: Setup ✅ (Complete)
  ↓
Phase 2: Foundational (MUST complete before user stories)
  ↓
Phase 3: US1 (P1) - Add and Read Feeds 🎯 MVP Core
  ↓
Phase 4: US2 (P1) - Auto Refresh 🎯 MVP Core
  ↓
Phase 5: US3 (P2) - Offline Access 🔥 PWA Essential
  ↓
Phase 6: US4 (P2) - OPML Import/Export 📦 Migration
  ↓
Phase 7: US5 (P2) - Theme Customization 🎨 UX Polish
  ↓
Phase 8: US6 (P3) - Categories 📁 Organization
  ↓
Phase 9: US7 (P3) - History & Favorites ⭐ Power Features
  ↓
Phase 10: US8 (P3) - Feed Management ⚙️ Power Features
  ↓
Phase 11: Polish & Cross-Cutting 🎯 Production Ready
```

### Parallel Execution Opportunities

**Within Phase 2 (Foundational)**:
- T012-T014 (dependencies)
- T016-T019 (utilities)
- T031-T037 (services)
- T038-T040 (theme)
- T041-T046 (tests)

**Within Phase 3 (US1)**:
- T047-T051 (tests can run in parallel)
- T052-T059 (UI components, different files)
- T071-T073 (styling, different files)

**Within Each User Story Phase**:
- Tests can run in parallel (different test files)
- UI components can run in parallel (different component files)
- Parallel-marked tasks ([P]) can be developed simultaneously

### Critical Path (Must Complete in Order)

1. **Phase 2 Foundational** → Blocks all user stories
2. **US1 (Phase 3)** → Core MVP, blocks testing of other stories
3. **US2 (Phase 4)** → Builds on US1 feed infrastructure
4. **US3 (Phase 5)** → Requires US1 + US2 for offline testing

All other user stories (US4-US8) can proceed in parallel once US1-US3 are complete.

---

## Test Coverage Targets (Constitution Principle II)

| Category | Target | Current |
|----------|--------|---------|
| **Overall** | 80% | TBD |
| **Services** | 90% | TBD |
| **Components** | 75% | TBD |
| **Utilities** | 95% | TBD |
| **Integration** | 70% | TBD |

**Coverage Command**: `npm run test:coverage`
**Report Location**: `coverage/index.html`

---

## Implementation Strategy

### MVP First (Weeks 1-2)
- Complete Phase 2 (Foundational)
- Complete Phase 3 (US1 - Add and Read Feeds)
- Complete Phase 4 (US2 - Auto Refresh)

**Deliverable**: Functional RSS reader with auto-refresh

### PWA Essential (Week 3)
- Complete Phase 5 (US3 - Offline Access)
- Complete Phase 6 (US4 - OPML Import/Export)
- Complete Phase 7 (US5 - Theme Customization)

**Deliverable**: Installable PWA with offline support and OPML

### Power Features (Week 4)
- Complete Phase 8 (US6 - Categories)
- Complete Phase 9 (US7 - History & Favorites)
- Complete Phase 10 (US8 - Feed Management)

**Deliverable**: Feature-complete RSS reader

### Polish (Week 5)
- Complete Phase 11 (Polish & Cross-Cutting)
- QA and testing
- Performance optimization

**Deliverable**: Production-ready application

---

## Task Summary

| Phase | Task Count | Status |
|-------|------------|--------|
| Phase 1: Setup | 11 | ✅ Complete |
| Phase 2: Foundational | 35 (T012-T046) | 🔲 Not Started |
| Phase 3: US1 (P1) | 25 (T047-T073) | 🔲 Not Started |
| Phase 4: US2 (P1) | 19 (T074-T092) | 🔲 Not Started |
| Phase 5: US3 (P2) | 18 (T093-T110) | 🔲 Not Started |
| Phase 6: US4 (P2) | 19 (T111-T129) | 🔲 Not Started |
| Phase 7: US5 (P2) | 17 (T130-T146) | 🔲 Not Started |
| Phase 8: US6 (P3) | 21 (T147-T167) | 🔲 Not Started |
| Phase 9: US7 (P3) | 21 (T168-T188) | 🔲 Not Started |
| Phase 10: US8 (P3) | 23 (T189-T211) | 🔲 Not Started |
| Phase 11: Polish | 44 (T212-T254) | 🔲 Not Started |
| **Total** | **254 tasks** | **4% complete** |

---

**Next Action**: Begin Phase 2 (Foundational) - Install dependencies and setup core infrastructure

**Test-First Reminder**: Write tests FIRST for every implementation task. Tests must FAIL before writing production code.
