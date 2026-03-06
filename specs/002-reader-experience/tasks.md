# Tasks: v1.1 Reader Experience

**Input**: Design documents from `/specs/002-reader-experience/`
**Prerequisites**: plan.md ✅, spec.md ✅

**Constitution Requirement - Test-First (MANDATORY)**: Per RSS Reader Constitution Principle II, EVERY feature implementation MUST follow TDD. Tests MUST be written FIRST and MUST FAIL before implementation begins. Minimum 90% code coverage required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions

- **Source**: `src/` at repository root
- **Tests**: `tests/` at repository root
- Components in `src/components/ArticleView/` and `src/components/ArticleList/`
- Hooks in `src/hooks/`
- Utilities in `src/utils/`
- Styles in `src/styles/globals.css` (Constitution VI — no new CSS files)
- Pages in `src/pages/`

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Enhance readingTime utility with CJK awareness — shared by US2 and US6

- [ ] T001 [P] Add unit tests for CJK-aware calculateReadingTime (CJK detection, bilingual calculation, isCjkDominant flag) in tests/unit/readingTime.test.ts
- [ ] T002 Enhance calculateReadingTime with CJK character counting, detectCjkRatio helper, and isCjkDominant detection in src/utils/readingTime.ts
- [ ] T003 Update existing calculateReadingTime call sites to use enhanced return value in src/pages/ArticleDetailPage.tsx

**Checkpoint**: `npx vitest --run tests/unit/readingTime.test.ts` passes. Build succeeds.

---

## Phase 2: User Story 1 — Reading Progress Bar (Priority: P1) 🎯 MVP

**Goal**: Fixed 3px progress bar at top of article detail page tracking scroll position

- [ ] T004 [P] [US1] Write unit tests for useReadingProgress hook in tests/unit/useReadingProgress.test.ts
- [ ] T005 [US1] Implement useReadingProgress hook with rAF-throttled passive scroll listener in src/hooks/useReadingProgress.ts
- [ ] T006 [US1] Create ReadingProgressBar component (fixed 3px bar, CSS scaleX, role="progressbar") in src/components/ArticleView/ReadingProgressBar.tsx
- [ ] T007 [US1] Integrate ReadingProgressBar into ArticleDetailPage in src/pages/ArticleDetailPage.tsx

**Checkpoint**: Open any article → progress bar tracks scroll position smoothly.

---

## Phase 3: User Story 2 — Reading Time Display (Priority: P1)

**Goal**: CJK-aware reading time in article detail header

- [ ] T008 [US2] Enhance reading time display in ArticleDetailPage to use CJK-aware calculation and conditionally apply CJK class in src/pages/ArticleDetailPage.tsx

**Checkpoint**: Article detail header shows accurate reading time for English and CJK articles.

---

## Phase 4: User Story 3 — Typography Upgrade (Priority: P1)

**Goal**: Optimal readability typography for article content

- [ ] T009 [P] [US3] Enhance .article-content base typography: 1.125rem desktop, 1rem mobile, 42rem max-width, 1.25em paragraph spacing in src/styles/globals.css
- [ ] T010 [P] [US3] Enhance heading hierarchy: h1 2rem, h2 1.75rem, h3 1.5rem, h4 1.25rem with improved margins in src/styles/globals.css
- [ ] T011 [US3] Add .article-content-cjk class with line-height 2.0, pre position: relative, img cursor: pointer in src/styles/globals.css

**Checkpoint**: Articles render with optimised typography. CJK articles get wider line spacing.

---

## Phase 5: User Story 4 — Code Syntax Highlighting (Priority: P2)

**Goal**: Auto-highlight code blocks with copy button

- [ ] T012 [P] [US4] Write unit tests for code block copy functionality in tests/unit/codeBlockCopy.test.ts
- [ ] T013 [US4] Create CodeBlockEnhancer component with copy button for pre>code elements in src/components/ArticleView/CodeBlockEnhancer.tsx
- [ ] T014 [US4] Integrate code block enhancement into ArticleDetailPage in src/pages/ArticleDetailPage.tsx

**Checkpoint**: Code blocks in articles display copy buttons that work correctly.

---

## Phase 6: User Story 5 — Image Lightbox (Priority: P2)

**Goal**: Full-screen image viewing by clicking article images

- [ ] T015 [P] [US5] Write unit tests for useImageLightbox hook in tests/unit/useImageLightbox.test.ts
- [ ] T016 [US5] Implement useImageLightbox hook in src/hooks/useImageLightbox.ts
- [ ] T017 [US5] Create ImageLightbox component in src/components/ArticleView/ImageLightbox.tsx
- [ ] T018 [US5] Integrate lightbox into ArticleDetailPage in src/pages/ArticleDetailPage.tsx

**Checkpoint**: Article images are clickable, lightbox opens with full-screen view.

---

## Phase 7: User Story 6 — Enhanced Article Cards (Priority: P2)

**Goal**: Richer article list cards with reading time and favourite indicator

- [ ] T019 [US6] Enhance ArticleItem with reading time display, favourite heart icon, and improved unread styling in src/components/ArticleList/ArticleItem.tsx

**Checkpoint**: Feed list shows enhanced cards with all metadata.

---

## Phase 8: Polish & Cross-Cutting

- [ ] T020 Run `npm run format` for Prettier compliance (Constitution VIII)
- [ ] T021 Run `npx vitest --run` to verify all tests pass (≥ 245 existing + new)
- [ ] T022 Run `npx tsc --noEmit` to verify TypeScript compilation

---

## Dependencies & Execution Order

```
Phase 1: Foundational (readingTime utility) — BLOCKS all
    │
    ├── US1 (Phase 2): Progress Bar ──► Independent
    ├── US2 (Phase 3): Reading Time ──► Independent
    ├── US3 (Phase 4): Typography ──┬─► Independent
    │                               ├── US4 (Phase 5): Code Highlighting
    │                               └── US5 (Phase 6): Image Lightbox
    └── US6 (Phase 7): Enhanced Cards ► Independent
```

**Key**: After Phase 1, US1/US2/US3/US6 can proceed in parallel. US4 and US5 depend on US3 CSS prep.
