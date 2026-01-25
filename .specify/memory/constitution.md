<!--
SYNC IMPACT REPORT
================================================================================
Version: 1.0.0 (initial adoption)
Ratification Date: 2026-01-25
Last Amended: 2026-01-25

PRINCIPLES ESTABLISHED:
  ✓ I. Progressive Web App Architecture
  ✓ II. Test-First Development (NON-NEGOTIABLE)
  ✓ III. Responsive Design for All Platforms
  ✓ IV. Modern Web Technologies & Standards
  ✓ V. Observability & Analytics

SECTIONS DEFINED:
  ✓ Technology Stack & Dependencies
  ✓ Feature Scope Definition
  ✓ Governance (Amendment Process & Compliance)

TEMPLATES UPDATED:
  ⚠ plan-template.md - reference for PWA/responsive context
  ⚠ spec-template.md - aligned with feature scope
  ⚠ tasks-template.md - emphasizes test-first principle

================================================================================
-->

# RSS Reader Constitution

## Core Principles

### I. Progressive Web App Architecture

The RSS Reader MUST be architected as a PWA-first application, installable on Android, iOS, and accessible via web browsers. This principle ensures:

- **Service Worker Implementation**: Offline capability with sync and push notifications.
- **Responsive & Adaptive UI**: Mobile-first design that scales to desktop/tablet viewports.
- **Platform Independence**: Single codebase with platform-specific capabilities (Web APIs, native integrations).
- **System Theme Integration**: Automatically respects user's system dark/light theme preference.

All UI components MUST be tested across breakpoints (mobile, tablet, desktop).

### II. Test-First Development (NON-NEGOTIABLE)

Every feature implementation MUST follow TDD discipline:

- **Unit Tests First**: Write tests BEFORE implementation code. Tests MUST fail initially.
- **Coverage Threshold**: Minimum 80% code coverage for all feature code.
- **Test Organization**: Categorized as unit, integration, and contract tests per feature requirements.
- **Red-Green-Refactor**: Strict cycle enforcement—no refactoring without passing tests.

No feature is considered complete without comprehensive test coverage and proof of passing CI/CD checks.

### III. Responsive Design for All Platforms

The application MUST support three independent user environments:

- **Web (Desktop & Mobile Browser)**: Full feature parity via responsive design; adapts to screen size without horizontal scroll.
- **Android Installation**: PWA installed via web app; full access to device APIs (notifications, offline data, file access).
- **iOS Installation**: PWA installed via web app; feature parity where iOS PWA capabilities permit.

Every new component MUST include visual testing across minimum 3 viewports: 375px (mobile), 768px (tablet), 1024px (desktop).

### IV. Modern Web Technologies & Standards

Implementation MUST use current best practices:

- **Framework Choice**: Latest stable versions of core dependencies (React 18+, TypeScript 5+, or equivalent frameworks).
- **Standards Compliance**: WCAG 2.1 AA accessibility; use semantic HTML and ARIA where applicable.
- **Build & Bundling**: Modern tooling (Vite, esbuild, or equivalent); no legacy build systems.
- **Code Quality**: ESLint + Prettier mandatory; TypeScript strict mode required.

Every dependency version MUST be justified; deprecated libraries are NOT permitted without migration plan.

### V. Observability & Analytics

Core functionality MUST be instrumented for monitoring:

- **Error Logging**: All errors captured with stack traces, user context, and timestamps.
- **Performance Metrics**: Track feed fetch time, content render time, search latency.
- **User Analytics**: Optional tracking of feature usage (respecting user privacy and consent settings).

Logging MUST be structured (JSON format, consistent schema); avoid unstructured console.log() in production code.

## Technology Stack & Dependencies

**Language**: TypeScript 5.x (strict mode required)

**Frontend Framework**: React 18.x+ / Vue 3.x+ / Svelte 4.x+ (TBD by team)

**Build Tool**: Vite 5.x+

**Testing**: Vitest (unit), Playwright (integration/e2e), MSW (API mocking)

**Package Manager**: npm/pnpm

**Runtime**: Node.js 18+ (for build); Browser APIs only for runtime

**Storage**: IndexedDB (client-side) + optional sync server

**State Management**: TBD (Redux, Zustand, Jotai, or context-based)

**PWA Requirements**:
- Service Worker API (offline sync, push notifications)
- Web App Manifest (installable metadata)
- Cache Storage API (asset & data caching)

## Feature Scope Definition

### Core Features (MVP - Non-Negotiable)

**FR-001**: Add RSS Feed Subscriptions
- Users MUST be able to input RSS feed URLs and store subscriptions persistently.
- System MUST validate feed URLs and detect RSS format; MUST reject invalid feeds with clear error messages.

**FR-002**: Automatic Feed Refresh
- System MUST periodically refresh subscriptions (user-configurable interval; default 1 hour).
- Refresh MUST operate offline-first; use service worker background sync when possible.

**FR-003**: Read RSS Content
- Users MUST be able to view feed lists, article headlines, and full article content.
- Content MUST render with proper formatting (images, links, text formatting).

### Secondary Features (Planned)

**FR-004**: Content Caching
- System MUST cache feed articles locally (IndexedDB) for offline access.
- Cache invalidation MUST respect feed publish dates; older articles may be pruned per user settings.

**FR-005**: OPML Import/Export
- Users MUST be able to export subscriptions as standard OPML format.
- Users MUST be able to import OPML files to bulk add subscriptions.

**FR-006**: Theme & Appearance
- System MUST support light and dark themes.
- Default theme MUST follow system preference (CSS `prefers-color-scheme`).
- Users MUST be able to manually override theme preference.

**FR-007**: Subscription Management
- Users MUST be able to organize subscriptions into user-defined groups/categories.
- Users MUST be able to unsubscribe from feeds; deletion MUST be reversible for 7 days (soft delete).

**FR-008**: Reading History & Favorites
- System MUST track recently read articles per user session + persisted locally.
- Users MUST be able to mark articles as favorites; favorites MUST sync across sessions.

## Governance

### Amendment Process

1. All governance changes MUST be documented in a pull request with rationale.
2. Constitution changes are categorized as:
   - **MAJOR**: Principle removal/redefinition, eliminates feature category, breaks existing workflows.
   - **MINOR**: New principle, new feature category, expands guidance materially.
   - **PATCH**: Clarifications, wording improvements, typo fixes, no behavioral impact.
3. MAJOR amendments require consensus approval from core team before merge.
4. MINOR/PATCH amendments may be merged upon single approval and documentation.

### Compliance & Verification

- **Code Review Gate**: All PRs MUST verify compliance with Core Principles (especially II—Test-First).
- **CI/CD Integration**: Tests MUST pass and coverage thresholds MUST be met before merge.
- **Non-Negotiables**: Principle II (Test-First) is absolute; no exceptions granted.

### Runtime Guidance

For day-to-day development workflows and non-constitutional decisions, refer to:
- **Development Guide**: `.github/DEVELOPMENT.md` (TBD)
- **Contributing Guidelines**: `.github/CONTRIBUTING.md` (TBD)

The Constitution supersedes all other project guidance. In case of conflict, the Constitution prevails.

---

**Version**: 1.0.0 | **Ratified**: 2026-01-25 | **Last Amended**: 2026-01-25
