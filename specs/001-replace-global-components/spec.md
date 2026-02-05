# Feature Specification: Replace global components with Shadcn UI

**Feature Branch**: `001-replace-global-components`  
**Created**: 2026-02-05  
**Status**: Draft  
**Input**: User description: "帮我使用shadcn中的组件替换全局组件，尤其是导航栏，要求移动端优先，样式优美，适配黑白主题； 引入react-router管理前端路由； 补充单元测试和集成测试以及自动化测试，单测覆盖率90以上"

**Note on Scope**: All user stories MUST align with one or more of the core/secondary features defined in the Constitution (see `.specify/memory/constitution.md` - Feature Scope Definition). Mark each story with the related feature code (e.g., FR-001, FR-004).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate feeds via Shadcn UI (Priority: P1)

A mobile user wants to browse feed lists and open articles using the refreshed Shadcn-based navigation and layout that honors light/dark themes.

**Why this priority**: Navigation is the primary entry point; adopting Shadcn UI must not break basic feed reading (Core FR-003, Secondary FR-006).

**Independent Test**: Launch app on mobile viewport; using new nav, user can switch sections (e.g., feeds, favorites) and open an article without layout breakage in both light/dark themes.

**Acceptance Scenarios**:

1. **Given** the app loads on a 375px viewport with system dark mode, **When** the user opens the nav and selects a feed, **Then** the feed list displays with Shadcn components and dark theme applied consistently.
2. **Given** the user switches theme to light, **When** navigating between feeds and an article detail, **Then** all Shadcn components render without clipping or overlap.

---

### User Story 2 - Route-aware navigation (Priority: P2)

As a returning user, I want consistent navigation via react-router-managed routes so I can share URLs and resume where I left off.

**Why this priority**: Route management underpins deep links and session continuity (Core FR-003; enables Secondary FR-004 caching flows).

**Independent Test**: Directly open a bookmarked route (e.g., `/feeds/:id`) and verify the correct view renders with the new Shadcn nav; back/forward works without visual regressions.

**Acceptance Scenarios**:

1. **Given** a valid feed detail URL, **When** the user loads it directly, **Then** the Shadcn layout renders the correct feed content with active nav state highlighted.
2. **Given** the user navigates via in-app links, **When** using browser back, **Then** the previous view restores with correct theme and Shadcn component states.

---

### User Story 3 - Test confidence for UI and routes (Priority: P3)

As a maintainer, I need unit/integration tests covering Shadcn components and routing so changes can ship with ≥90% unit test coverage for new code.

**Why this priority**: Meets Constitution test-first principle and user request for automated testing.

**Independent Test**: Run unit/integration suites; coverage for new Shadcn nav and routing logic meets ≥90% line/branch for touched modules; CI automation executes tests.

**Acceptance Scenarios**:

1. **Given** the test suite runs, **When** executing unit tests for Shadcn nav components, **Then** all states (light/dark, mobile/desktop) are validated and coverage reports ≥90% for these modules.
2. **Given** integration tests for routing, **When** navigating key routes, **Then** rendered UI matches expectations without console errors.

---

### Edge Cases

- What happens when theme preference is unavailable or toggled mid-session?
- How does the system handle navigation on very narrow screens (<320px) or landscape rotations?
- What happens if a route is invalid or feed data fails to load—does the Shadcn layout show graceful fallbacks?
- How are focus states and keyboard navigation handled for accessibility in Shadcn components?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Replace global UI components (including navigation bar) with Shadcn components, preserving existing RSS reader functionality and aligning with Secondary FR-006 (theme support).
- **FR-002**: Implement mobile-first responsive layouts for Shadcn components with tested breakpoints (375px, 768px, 1024px) per Constitution Principle III.
- **FR-003**: Ensure Shadcn components adapt to light/dark themes automatically and allow manual theme switch without layout glitches.
- **FR-004**: Introduce react-router for client-side routing, enabling deep links for feeds and article views without regressions to Core FR-003.
- **FR-005**: Provide route-aware navigation state (active item, back/forward consistency) across primary app sections.
- **FR-006**: Add unit tests for Shadcn components and routing logic with ≥90% coverage for new/modified modules.
- **FR-007**: Add integration/automation tests that cover primary navigation flows (load feed list, open feed, open article) in both themes and mobile-first layout.

### Key Entities

- **Navigation Item**: Represents a navigable section (feeds, favorites, settings); attributes include label, icon, target route, active state.
- **Theme Preference**: Represents system or user-selected theme; attributes include mode (light/dark/system) and last toggle context.
- **Route**: Represents client-side path for feed list, feed detail, article view; attributes include path pattern and params (e.g., feedId).

### Assumptions & Dependencies

- Existing feed retrieval and article rendering logic remain unchanged; redesign focuses on layout/navigation shell.
- Theme tokens from the current design system can be mapped to Shadcn equivalents without changing content styles.
- Client-side routing will use the chosen router consistently across app entry points (no mixed navigation patterns).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open the app on mobile and access feed list and one article in both light and dark themes without layout overlap or clipping within 3 seconds of initial load.
- **SC-002**: Feed list and feed detail routes render correct content when accessed directly via URL or browser back/forward in 100% of tested cases.
- **SC-003**: New/modified UI and routing modules achieve ≥90% unit test coverage, and integration tests execute in CI without failures.
- **SC-004**: No accessibility regressions: keyboard focus order and visible focus states remain intact across Shadcn nav components in both themes during testing.
