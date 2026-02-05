---
description: "Implementation tasks for Replace Global Components with Shadcn UI"
---

# Tasks: Replace Global Components with Shadcn UI

**Branch**: `001-replace-global-components`  
**Feature**: Replace Global Components with Shadcn UI  
**Date**: 2026-02-05  
**Input**: Design documents from `/specs/001-replace-global-components/`

**Constitution Requirement - Test-First (MANDATORY)**: Per RSS Reader Constitution Principle II, EVERY feature implementation MUST follow TDD. Tests MUST be written FIRST and MUST FAIL before implementation begins. Minimum 80% code coverage required. This feature targets ≥90% coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project uses standard single-project structure:
- **Source**: `src/` at repository root
- **Tests**: `tests/` at repository root
- **Specs**: `specs/001-replace-global-components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation for Shadcn UI and React Router

- [X] T001 Install React Router v6 dependencies: `npm install react-router-dom@^6` and `npm install -D @types/react-router-dom`
- [X] T002 Initialize Shadcn UI configuration: `npx shadcn-ui@latest init` (select Default style, Neutral color, CSS variables, src/components/ui)
- [X] T003 [P] Install Shadcn UI components: button, sheet, navigation-menu, dropdown-menu, card, dialog, tabs, separator, badge, avatar, tooltip, skeleton
- [X] T004 [P] Verify Vite config path aliases (@/, @components, @lib, @hooks, @pages) in vite.config.ts
- [X] T005 [P] Update tailwind.config.js to include src/components/ui/ in content paths and verify darkMode: 'class'
- [X] T006 [P] Create src/types/navigation.ts with TypeScript type definitions for Route, NavigationItem, ThemeMode, ThemePreference, NavigationState
- [X] T007 [P] Update vitest.config.ts to include matchMedia mock in tests/setup.ts

**Checkpoint**: Dependencies installed, Shadcn UI initialized, types defined

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 2.1: Theme System Infrastructure

- [X] T008 [P] Write unit tests for ThemeProvider component in tests/unit/lib/theme/ThemeProvider.test.tsx (test mode state, resolvedTheme computation, localStorage persistence, system preference detection)
- [X] T009 [P] Write unit tests for themeUtils helpers in tests/unit/lib/theme/themeUtils.test.ts (test getSystemTheme, applyTheme, FOUC prevention)
- [X] T010 Create ThemeProvider component in src/lib/theme/ThemeProvider.tsx (context provider with mode, systemPreference, resolvedTheme, setTheme function)
- [X] T011 [P] Create themeUtils helper functions in src/lib/theme/themeUtils.ts (getSystemTheme, applyTheme to html element, update PWA manifest theme_color)
- [X] T012 Add inline theme script to index.html to prevent FOUC (read localStorage, apply theme class to html before render)
- [X] T013 Update src/styles/index.css with Shadcn CSS variables for light/dark themes (should be added by shadcn init, verify completeness)

### 2.2: Router Infrastructure

- [X] T014 [P] Write unit tests for route configuration in tests/unit/lib/router/routeConfig.test.ts (test route definitions, loader signatures, handle metadata validation)
- [X] T015 [P] Write unit tests for navigationItems in tests/unit/lib/router/navigationItems.test.ts (test item structure, icon imports, path validation)
- [X] T016 Create router configuration in src/lib/router/routes.tsx (createBrowserRouter with lazy-loaded routes, loaders, error boundaries per contracts/routes.yaml)
- [X] T017 [P] Create loader functions in src/lib/router/loaders.ts (loadFeedsData, loadFeedDetail, loadArticleDetail per contracts/routes.yaml)
- [X] T018 [P] Create navigationItems configuration in src/lib/router/navigationItems.ts (array of NavigationItem objects for main and user groups)
- [X] T019 [P] Create useRouteTitle hook in src/hooks/useRouteTitle.ts (updates document.title from route handle metadata)

### 2.3: Page Components

- [X] T020 [P] Write unit tests for FeedsPage in tests/unit/pages/FeedsPage.test.tsx (test loader data rendering, offline indicator, error states)
- [X] T021 [P] Write unit tests for FeedDetailPage in tests/unit/pages/FeedDetailPage.test.tsx (test feed params, article list rendering, 404 handling)
- [X] T022 [P] Write unit tests for ArticleDetailPage in tests/unit/pages/ArticleDetailPage.test.tsx (test article content rendering, mark as read, 404 handling)
- [X] T023 [P] Write unit tests for NotFoundPage in tests/unit/pages/NotFoundPage.test.tsx (test 404 message, link to /feeds)
- [X] T024 [P] Create FeedsPage component in src/pages/FeedsPage.tsx (wrapper for FeedList, uses useLoaderData)
- [X] T025 [P] Create FeedDetailPage component in src/pages/FeedDetailPage.tsx (wrapper for feed detail, uses useLoaderData with feedId param)
- [X] T026 [P] Create ArticleDetailPage component in src/pages/ArticleDetailPage.tsx (wrapper for ArticleView, uses useLoaderData with articleId param)
- [X] T027 [P] Create NotFoundPage component in src/pages/NotFoundPage.tsx (404 fallback with navigation to /feeds)

**Checkpoint**: Foundation ready - Theme system works, router configured, page wrappers created. User story implementation can now begin.

---

## Phase 3: User Story 1 - Navigate feeds via Shadcn UI (Priority: P1) 🎯 MVP

**Goal**: A mobile user wants to browse feed lists and open articles using the refreshed Shadcn-based navigation and layout that honors light/dark themes.

**Why this priority**: Navigation is the primary entry point; adopting Shadcn UI must not break basic feed reading (Core FR-003, Secondary FR-006).

**Independent Test**: Launch app on mobile viewport; using new nav, user can switch sections (e.g., feeds, favorites) and open an article without layout breakage in both light/dark themes.

### Tests for User Story 1 (TDD - WRITE FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T028 [P] [US1] Write unit tests for Navbar component in tests/unit/components/layout/Navbar.test.tsx (test navigation items render, hamburger menu toggle on mobile, theme toggle button, active state highlighting)
- [ ] T029 [P] [US1] Write unit tests for MobileNav component in tests/unit/components/layout/MobileNav.test.tsx (test Sheet open/close, navigation item clicks, backdrop close, Escape key close)
- [ ] T030 [P] [US1] Write unit tests for DesktopNav component in tests/unit/components/layout/DesktopNav.test.tsx (test horizontal navigation items render, active state, no hamburger menu)
- [ ] T031 [P] [US1] Write unit tests for ThemeToggle component in tests/unit/components/layout/ThemeToggle.test.tsx (test dropdown menu, light/dark/system options, localStorage persistence, icon changes)
- [ ] T032 [P] [US1] Write unit tests for AppLayout component in tests/unit/components/layout/AppLayout.test.tsx (test Navbar renders, Outlet renders, theme provider wraps, responsive breakpoints)
- [ ] T033 [P] [US1] Write integration tests for navigation flow in tests/integration/navigation/route-navigation.test.tsx (test click nav item → route changes → active state updates → drawer closes)
- [ ] T034 [P] [US1] Write integration tests for theme switching in tests/integration/navigation/theme-switching.test.tsx (test toggle theme → CSS class updates → localStorage updates → components re-render)
- [ ] T035 [P] [US1] Write E2E tests for mobile navigation in tests/e2e/mobile-navigation.spec.ts (test hamburger menu on 375px viewport, drawer slides in, nav items clickable, theme persists)
- [ ] T036 [P] [US1] Write E2E tests for desktop navigation in tests/e2e/navigation.spec.ts (test horizontal nav on 1024px viewport, navigation works, active states correct, theme toggle works)

### Implementation for User Story 1

- [X] T037 [P] [US1] Create ThemeToggle component in src/components/layout/ThemeToggle.tsx (Shadcn DropdownMenu with Light/Dark/System options, integrates with ThemeProvider)
- [X] T038 [P] [US1] Create MobileNav component in src/components/layout/MobileNav.tsx (Shadcn Sheet with navigation items, footer, close on item click, 768px breakpoint)
- [X] T039 [P] [US1] Create DesktopNav component in src/components/layout/DesktopNav.tsx (horizontal navigation menu with Shadcn NavigationMenu, active state highlighting)
- [X] T040 [US1] Create Navbar component in src/components/layout/Navbar.tsx (responsive wrapper, renders MobileNav on <768px, DesktopNav on ≥768px, includes ThemeToggle)
- [X] T041 [US1] Create AppLayout component in src/components/layout/AppLayout.tsx (root layout with Navbar, Outlet for router children, useRouteTitle hook)
- [X] T042 [US1] Update src/App.tsx to wrap with ThemeProvider and RouterProvider using router from src/lib/router/routes.tsx
- [X] T043 [US1] Update src/main.tsx if needed to ensure React 18 concurrent mode and proper root mounting
- [ ] T044 [US1] Test User Story 1 manually: Launch dev server, test mobile viewport (375px), open burger menu, navigate between feeds/favorites/history, toggle theme, verify no layout breakage
- [ ] T045 [US1] Run unit tests for User Story 1: `npm run test -- tests/unit/components/layout/` and verify ≥90% coverage
- [ ] T046 [US1] Run integration tests for User Story 1: `npm run test -- tests/integration/navigation/` and verify all pass
- [ ] T047 [US1] Run E2E tests for User Story 1: `npm run test:e2e -- tests/e2e/mobile-navigation.spec.ts tests/e2e/navigation.spec.ts` and verify all pass

**Checkpoint**: User Story 1 complete. Mobile and desktop navigation work with Shadcn UI. Theme switching works. Tests pass with ≥90% coverage.

---

## Phase 4: User Story 2 - Route-aware navigation (Priority: P2)

**Goal**: As a returning user, I want consistent navigation via react-router-managed routes so I can share URLs and resume where I left off.

**Why this priority**: Route management underpins deep links and session continuity (Core FR-003; enables Secondary FR-004 caching flows).

**Independent Test**: Directly open a bookmarked route (e.g., `/feeds/:id`) and verify the correct view renders with the new Shadcn nav; back/forward works without visual regressions.

### Tests for User Story 2 (TDD - WRITE FIRST) ⚠️

- [ ] T048 [P] [US2] Write integration tests for deep linking in tests/integration/navigation/deep-linking.test.tsx (test direct URL entry for /feeds/:feedId, /articles/:articleId, verify loader data loads, verify Navbar active state)
- [ ] T049 [P] [US2] Write integration tests for browser navigation in tests/integration/navigation/browser-navigation.test.tsx (test back/forward buttons, history state, Navbar state persistence)
- [ ] T050 [P] [US2] Write E2E tests for routing in tests/e2e/routing.spec.ts (test user flow: /feeds → /feeds/:id → /articles/:id → back button → forward button, verify URL changes and content updates)
- [ ] T051 [P] [US2] Write E2E tests for error handling in tests/e2e/routing.spec.ts (test invalid feedId → 404 page, invalid articleId → 404 page, error boundary displays)

### Implementation for User Story 2

- [ ] T052 [P] [US2] Implement loadFeedsData loader function in src/lib/router/loaders.ts (fetch feeds from IndexedDB, handle offline mode, return {feeds, isOffline})
- [ ] T053 [P] [US2] Implement loadFeedDetail loader function in src/lib/router/loaders.ts (fetch feed and articles by feedId, handle 404, return {feed, articles, isOffline})
- [ ] T054 [P] [US2] Implement loadArticleDetail loader function in src/lib/router/loaders.ts (fetch article by articleId, mark as read, handle 404, return {article, feed})
- [ ] T055 [US2] Update FeedsPage component in src/pages/FeedsPage.tsx to use loader data from loadFeedsData and display offline indicator if isOffline=true
- [ ] T056 [US2] Update FeedDetailPage component in src/pages/FeedDetailPage.tsx to use loader data from loadFeedDetail and display feed title in Navbar via route handle
- [ ] T057 [US2] Update ArticleDetailPage component in src/pages/ArticleDetailPage.tsx to use loader data from loadArticleDetail and display article title in document.title
- [ ] T058 [US2] Create ErrorBoundary component in src/components/Common/ErrorBoundary.tsx (Shadcn Alert for 404/500 errors, retry button, link to /feeds)
- [ ] T059 [US2] Update router configuration in src/lib/router/routes.tsx to attach ErrorBoundary to root route and verify all loaders are connected
- [ ] T060 [US2] Add navigation logging in AppLayout.tsx using logger.info for route enter/leave events
- [ ] T061 [US2] Test User Story 2 manually: Open /feeds/invalid-id → verify 404, open /feeds/:validId → verify feed loads, use back/forward buttons, verify Navbar state updates
- [ ] T062 [US2] Run integration tests for User Story 2: `npm run test -- tests/integration/navigation/deep-linking.test.tsx tests/integration/navigation/browser-navigation.test.tsx` and verify all pass
- [ ] T063 [US2] Run E2E tests for User Story 2: `npm run test:e2e -- tests/e2e/routing.spec.ts` and verify all pass

**Checkpoint**: User Story 2 complete. Deep linking works. Browser back/forward buttons work. Error handling displays gracefully. Tests pass.

---

## Phase 5: User Story 3 - Test confidence for UI and routes (Priority: P3)

**Goal**: As a maintainer, I need unit/integration tests covering Shadcn components and routing so changes can ship with ≥90% unit test coverage for new code.

**Why this priority**: Meets Constitution test-first principle and user request for automated testing.

**Independent Test**: Run unit/integration suites; coverage for new Shadcn nav and routing logic meets ≥90% line/branch for touched modules; CI automation executes tests.

### Tests for User Story 3 (TDD - WRITE FIRST) ⚠️

- [ ] T064 [P] [US3] Write additional unit tests for edge cases in tests/unit/components/layout/Navbar.test.tsx (test loading states, badge counts, user section render, actions render)
- [ ] T065 [P] [US3] Write additional unit tests for accessibility in tests/unit/components/layout/Navbar.test.tsx (test keyboard navigation with Tab key, Enter key activates links, Escape closes drawer, focus trap in Sheet)
- [ ] T066 [P] [US3] Write unit tests for router utilities in tests/unit/lib/router/routeUtils.test.ts (test route path validation, loader error handling, route metadata parsing)
- [ ] T067 [P] [US3] Write integration tests for theme persistence in tests/integration/navigation/theme-persistence.test.tsx (test theme persists across route changes, theme persists after page reload, PWA manifest theme_color updates)
- [ ] T068 [P] [US3] Write E2E tests for accessibility in tests/e2e/accessibility.spec.ts (test screen reader announces route changes, focus states visible, keyboard navigation works)
- [ ] T069 [P] [US3] Write E2E tests for responsive breakpoints in tests/e2e/responsive.spec.ts (test 375px mobile, 768px tablet, 1024px desktop layouts, navigation adapts correctly)
- [ ] T070 [P] [US3] Write E2E tests for theme switching across viewports in tests/e2e/theme.spec.ts (test light/dark/system theme on mobile/tablet/desktop, verify CSS variables applied)

### Implementation for User Story 3

- [ ] T071 [P] [US3] Add route validation utility in src/lib/router/routeUtils.ts (validateRoutePath, validateLoader, validateRouteHandle functions)
- [ ] T072 [P] [US3] Add accessibility attributes to Navbar component in src/components/layout/Navbar.tsx (aria-label, role="banner", aria-current for active links)
- [ ] T073 [P] [US3] Add accessibility attributes to MobileNav component in src/components/layout/MobileNav.tsx (aria-label="Mobile navigation", focus trap, aria-expanded on hamburger button)
- [ ] T074 [P] [US3] Add accessibility attributes to ThemeToggle component in src/components/layout/ThemeToggle.tsx (aria-label="Toggle theme", keyboard navigation for dropdown)
- [ ] T075 [US3] Configure vitest.config.ts for coverage reporting: thresholds of 90% for statements, branches, functions, lines on src/components/layout/**, src/lib/router/**, src/lib/theme/**
- [ ] T076 [US3] Configure Playwright config in playwright.config.ts for viewport testing: add projects for mobile (375px), tablet (768px), desktop (1024px)
- [ ] T077 [US3] Add MSW handlers in tests/mocks/handlers.ts for IndexedDB storage mocking (feeds, articles, settings)
- [ ] T078 [US3] Run full test suite: `npm run test:run` and verify ≥90% coverage for new code
- [ ] T079 [US3] Run full E2E suite: `npm run test:e2e` and verify all tests pass
- [ ] T080 [US3] Generate coverage report: `npm run test:coverage` and verify report shows ≥90% for src/components/layout/**, src/lib/router/**, src/lib/theme/**

**Checkpoint**: User Story 3 complete. Test coverage ≥90% achieved. Accessibility tested. CI automation ready. All tests pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, and integration with existing components

- [ ] T081 [P] Update existing AddFeedDialog component in src/components/AddFeedDialog/ to use Shadcn Dialog primitive instead of custom dialog
- [ ] T082 [P] Update existing FeedList component in src/components/FeedList/ to use Shadcn Card for feed items
- [ ] T083 [P] Update existing ArticleList component in src/components/ArticleList/ to use Shadcn Card for article items
- [ ] T084 [P] Add Shadcn Skeleton loading states to FeedsPage, FeedDetailPage, ArticleDetailPage for Suspense fallbacks
- [ ] T085 [P] Update Settings page in src/pages/Settings.tsx to use Shadcn Tabs for settings sections
- [ ] T086 [P] Add Shadcn Badge component to navigation items in src/lib/router/navigationItems.ts for unread counts (integrate with Zustand store)
- [ ] T087 [P] Update public/manifest.json to dynamically update theme_color based on resolved theme (integrate with ThemeProvider)
- [ ] T088 Add route transition animations in src/components/layout/AppLayout.tsx using Shadcn motion utilities
- [ ] T089 Update quickstart.md in specs/001-replace-global-components/quickstart.md with verification steps for all routes working
- [ ] T090 [P] Update .github/copilot-instructions.md with React Router v6 patterns, Shadcn UI component usage guidelines, theme system integration patterns
- [ ] T091 [P] Add JSDoc comments to all new components in src/components/layout/ with usage examples
- [ ] T092 [P] Add JSDoc comments to all router utilities in src/lib/router/ with loader function signatures
- [ ] T093 Run final full test suite with coverage: `npm run test:coverage` and verify ≥90% coverage maintained
- [ ] T094 Run final E2E test suite: `npm run test:e2e` and verify all tests pass
- [ ] T095 Manual testing: Test all user flows on mobile (375px), tablet (768px), desktop (1024px) viewports in both light and dark themes
- [ ] T096 Run Lighthouse audit: Verify PWA score ≥ 90, FCP < 1.5s, TTI < 3.5s
- [ ] T097 Test offline functionality: Disconnect network, verify feeds/articles load from cache, verify navigation works offline
- [ ] T098 Test keyboard navigation: Tab through all interactive elements, verify focus visible, verify Escape closes modals/drawers
- [ ] T099 Review and close any remaining TODOs or console warnings in dev mode
- [ ] T100 Update PROJECT_COMPLETION_SUMMARY.md with feature completion status and test coverage metrics

**Checkpoint**: Feature complete. All tests pass. ≥90% coverage achieved. Documentation updated. Ready for code review.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - May integrate with US1 but is independently testable
  - User Story 3 (P3): Can start after Foundational - Builds on US1 and US2 test infrastructure
- **Polish (Phase 6)**: Depends on all user stories being complete

### Within Each User Story

- **TDD Requirement**: Tests MUST be written FIRST and MUST FAIL before implementation
- Models/utilities before components
- Components before integration
- Unit tests → Integration tests → E2E tests
- Manual testing after all automated tests pass
- Coverage verification before moving to next story

### Parallel Opportunities

#### Phase 1 (Setup)
- T002, T003, T004, T005, T006, T007 can all run in parallel after T001 completes

#### Phase 2 (Foundational)
- Theme tests (T008, T009) can run in parallel
- Router tests (T014, T015) can run in parallel
- Page tests (T020, T021, T022, T023) can all run in parallel
- Theme implementation (T010, T011, T012, T013) can run in parallel after theme tests complete
- Router implementation (T016, T017, T018, T019) can run in parallel after router tests complete
- Page implementation (T024, T025, T026, T027) can all run in parallel after page tests complete

#### Phase 3 (User Story 1)
- All test tasks (T028-T036) can run in parallel
- All implementation tasks (T037-T039) can run in parallel after tests fail
- T045, T046, T047 must run sequentially after implementation complete

#### Phase 4 (User Story 2)
- All test tasks (T048-T051) can run in parallel
- Loader implementations (T052, T053, T054) can run in parallel after tests fail
- Page updates (T055, T056, T057) can run in parallel after loaders complete

#### Phase 5 (User Story 3)
- All test tasks (T064-T070) can run in parallel
- All implementation tasks (T071-T074) can run in parallel after tests fail

#### Phase 6 (Polish)
- Component updates (T081-T087) can all run in parallel
- Documentation updates (T089, T090, T091, T092) can all run in parallel
- Final testing (T093, T094, T095, T096, T097, T098) must run sequentially

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all User Story 1 tests together (TDD - these should FAIL initially):
Task T028: "Write unit tests for Navbar component"
Task T029: "Write unit tests for MobileNav component"
Task T030: "Write unit tests for DesktopNav component"
Task T031: "Write unit tests for ThemeToggle component"
Task T032: "Write unit tests for AppLayout component"
Task T033: "Write integration tests for navigation flow"
Task T034: "Write integration tests for theme switching"
Task T035: "Write E2E tests for mobile navigation"
Task T036: "Write E2E tests for desktop navigation"

# After tests fail, launch all User Story 1 components together:
Task T037: "Create ThemeToggle component"
Task T038: "Create MobileNav component"
Task T039: "Create DesktopNav component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T027) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T028-T047)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Verify ≥90% coverage for new code
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup (Phase 1) + Foundational (Phase 2) → Foundation ready
2. Add User Story 1 (Phase 3) → Test independently → Verify coverage → Deploy/Demo (MVP!)
3. Add User Story 2 (Phase 4) → Test independently → Verify coverage → Deploy/Demo
4. Add User Story 3 (Phase 5) → Test independently → Verify coverage → Deploy/Demo
5. Add Polish (Phase 6) → Final validation → Deploy production
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup (Phase 1) + Foundational (Phase 2) together
2. Once Foundational is done:
   - Developer A: User Story 1 (Phase 3)
   - Developer B: User Story 2 (Phase 4)
   - Developer C: User Story 3 (Phase 5)
3. Stories complete and integrate independently
4. Team converges for Polish (Phase 6)

---

## Test Coverage Goals

**Target**: ≥90% coverage for all new/modified code

### Coverage by Module

| Module | Target Coverage | Test Types |
|--------|----------------|------------|
| `src/components/layout/**` | ≥90% | Unit + Integration + E2E |
| `src/lib/router/**` | ≥90% | Unit + Integration |
| `src/lib/theme/**` | ≥90% | Unit + Integration |
| `src/pages/**` | ≥90% | Unit + E2E |
| `src/hooks/useRouteTitle.ts` | ≥90% | Unit |
| `src/types/navigation.ts` | 100% (types) | N/A |

### Coverage Verification

```bash
# Generate coverage report
npm run test:coverage

# Expected output for new modules:
# src/components/layout/Navbar.tsx: 95% (all branches covered)
# src/components/layout/MobileNav.tsx: 93% (mobile-only branches)
# src/components/layout/DesktopNav.tsx: 93% (desktop-only branches)
# src/components/layout/ThemeToggle.tsx: 97% (all theme modes)
# src/components/layout/AppLayout.tsx: 92% (routing integration)
# src/lib/router/routes.tsx: 90% (all loaders)
# src/lib/router/loaders.ts: 95% (error handling)
# src/lib/theme/ThemeProvider.tsx: 94% (all state transitions)
# src/lib/theme/themeUtils.ts: 98% (all utilities)
```

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story (US1, US2, US3) for traceability
- Each user story should be independently completable and testable
- **TDD MANDATORY**: Verify tests fail before implementing (Constitution requirement)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Target ≥90% test coverage for all new code
- Run coverage reports frequently to track progress
- All E2E tests must pass on mobile (375px), tablet (768px), desktop (1024px) viewports
- All components must work in both light and dark themes
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Success Criteria Mapping

### SC-001: Mobile app loads with navigation in ≤3s
- **Verified by**: T095 (manual testing), T096 (Lighthouse audit)
- **Tasks**: T040, T041, T044

### SC-002: Direct URL access and browser navigation work 100%
- **Verified by**: T061, T063 (integration + E2E tests)
- **Tasks**: T048-T063

### SC-003: ≥90% unit test coverage achieved
- **Verified by**: T078, T080, T093 (coverage reports)
- **Tasks**: All test tasks (T008-T070)

### SC-004: No accessibility regressions
- **Verified by**: T068 (E2E accessibility tests), T098 (keyboard navigation)
- **Tasks**: T072, T073, T074, T068, T098

---

**Document Version**: 1.0.0  
**Generated**: 2026-02-05  
**Total Tasks**: 100  
**Estimated MVP**: 47 tasks (Phase 1 + Phase 2 + Phase 3)  
**Parallelizable**: 67 tasks marked [P]
