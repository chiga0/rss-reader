<!--
SYNC IMPACT REPORT
================================================================================
Version: 2.0.0 → MAJOR (new mandatory principles added, coverage threshold raised)
Ratification Date: 2026-01-25
Last Amended: 2026-02-24

VERSION CHANGE: 1.0.0 → 2.0.0

MODIFIED PRINCIPLES:
  ✓ II. Test-First Development — coverage threshold raised from 80% to 90%+;
        integration tests and automation scripts now MANDATORY.

ADDED PRINCIPLES:
  ✓ VI. Styling Architecture (Tailwind CSS + theme.css, no inline/extra CSS)
  ✓ VII. Routing Architecture (hash routing, lib/router directory)
  ✓ VIII. Code Formatting Automation (auto-format after AI code generation)

REMOVED PRINCIPLES: (none)

SECTIONS MODIFIED:
  ✓ Technology Stack & Dependencies — updated to reflect actual stack choices
  ✓ Governance — added auto-format compliance check

TEMPLATES REQUIRING UPDATES:
  ⚠ plan-template.md — should reference new styling/routing principles
  ⚠ spec-template.md — aligned with updated feature scope
  ✓ tasks-template.md — already emphasizes test-first; coverage threshold updated

FOLLOW-UP TODOs: (none)
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
- **Coverage Threshold**: Minimum 90% code coverage for all feature code.
- **Integration Tests**: Every feature MUST include integration tests validating cross-module interactions.
- **Automation Scripts**: Every feature MUST include automated test scripts runnable via `npm run test` and `npm run test:e2e`.
- **Test Organization**: Categorized as unit, integration, and e2e tests per feature requirements.
- **Red-Green-Refactor**: Strict cycle enforcement—no refactoring without passing tests.

No feature is considered complete without comprehensive test coverage (≥90%), integration tests, and proof of passing CI/CD checks.

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

### VI. Styling Architecture (NON-NEGOTIABLE)

All visual styling MUST follow these rules:

- **Style File Location**: All CSS/style files MUST reside in `src/styles/` directory. No other directories may contain standalone style files.
- **No Inline Styles in index.html**: The `index.html` file MUST NOT contain any inline `<style>` blocks or `style` attributes (except the theme initialization script which uses JS-based class toggling).
- **Theme Centralization**: All color theme variables and theme-related styles MUST be defined in `src/styles/theme.css`. Components MUST reference theme variables from this file.
- **Tailwind CSS Only**: All component styling MUST use Tailwind CSS utility classes. Creating additional `.css`, `.scss`, `.less`, or CSS Module files for component styling is PROHIBITED.
- **No Extra CSS Files**: Beyond `src/styles/globals.css` and `src/styles/theme.css`, no additional CSS/SCSS files are permitted unless explicitly justified and approved in a constitution amendment.

### VII. Routing Architecture (NON-NEGOTIABLE)

All routing configuration MUST follow these rules:

- **Route Definition Location**: All route definitions MUST reside in `src/lib/router/` directory. No route definitions outside this directory.
- **Hash Router**: The application MUST use hash-based routing (`HashRouter` or equivalent) to ensure PWA compatibility across all deployment targets (static hosting, file:// protocol, etc.).
- **Centralized Configuration**: Route paths, loaders, and navigation items MUST be co-located in `src/lib/router/` for single-source-of-truth routing.

### VIII. Code Formatting Automation (NON-NEGOTIABLE)

All code MUST maintain consistent formatting:

- **Auto-Format on Completion**: After AI-assisted code generation or modification, the `npm run format` command MUST be executed automatically to ensure consistent code style.
- **Prettier Configuration**: The project MUST maintain a `.prettierrc.json` configuration; all TypeScript, TSX, and CSS files MUST conform to it.
- **Pre-Commit Enforcement**: Code that does not pass `npm run format` check MUST NOT be committed.

## Technology Stack & Dependencies

**Language**: TypeScript 5.x (strict mode required)

**Frontend Framework**: React 18.x+ with React Router DOM 6.x (hash routing)

**Build Tool**: Vite 7.x+ with @tailwindcss/vite plugin

**Styling**: Tailwind CSS 4.x (utility-first; all styles via Tailwind classes); theme variables in `src/styles/theme.css`

**Testing**: Vitest (unit/integration), Playwright (e2e); minimum 90% coverage required

**Package Manager**: npm

**Runtime**: Node.js 18+ (for build); Browser APIs only for runtime

**Storage**: IndexedDB (client-side) via custom storage abstraction

**State Management**: Zustand 4.x

**PWA Requirements**:
- Vite PWA Plugin (vite-plugin-pwa) with injectManifest strategy
- Workbox (service worker caching, routing, precaching)
- Web App Manifest (installable metadata)
- Cache Storage API (asset & data caching)

**Code Quality**:
- ESLint + Prettier mandatory; auto-format via `npm run format`
- TypeScript strict mode required

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

- **Code Review Gate**: All PRs MUST verify compliance with Core Principles (especially II—Test-First, VI—Styling, VII—Routing, VIII—Formatting).
- **CI/CD Integration**: Tests MUST pass, coverage thresholds (≥90%) MUST be met, and `npm run format` MUST produce no changes before merge.
- **Non-Negotiables**: Principles II (Test-First), VI (Styling Architecture), VII (Routing Architecture), and VIII (Code Formatting) are absolute; no exceptions granted.
- **Auto-Format Gate**: AI-generated code MUST be auto-formatted before commit. The `npm run format` command MUST be run after every code generation session.

### Runtime Guidance

For day-to-day development workflows and non-constitutional decisions, refer to:
- **Development Guide**: `.github/DEVELOPMENT.md` (TBD)
- **Contributing Guidelines**: `.github/CONTRIBUTING.md` (TBD)

The Constitution supersedes all other project guidance. In case of conflict, the Constitution prevails.

---

**Version**: 2.0.0 | **Ratified**: 2026-01-25 | **Last Amended**: 2026-02-24
