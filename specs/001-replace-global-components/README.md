# Feature 001: Replace Global Components with Shadcn UI

**Status**: Planning Complete ✅  
**Branch**: `001-replace-global-components`  
**Created**: 2026-02-05  
**Last Updated**: 2026-02-05

---

## 📋 Overview

This feature replaces the RSS Reader's global UI components with Shadcn UI components, with a focus on the navigation bar. The implementation follows a mobile-first responsive design approach, supports automatic light/dark theme adaptation, integrates React Router for client-side routing, and achieves ≥90% unit test coverage.

**Key Deliverables**:
- ✅ Shadcn UI-based navigation system (mobile burger menu + desktop horizontal nav)
- ✅ React Router v6 integration for client-side routing
- ✅ Theme system with light/dark/system modes
- ✅ Comprehensive test suite (unit/integration/e2e)
- ✅ Zero functional regressions to existing RSS reader features

---

## 📁 Directory Structure

```
specs/001-replace-global-components/
├── README.md                # This file (feature overview)
├── spec.md                  # Original feature specification
├── plan.md                  # Implementation plan (Phase 0-2 planning)
├── research.md              # Technology research and decisions
├── data-model.md            # Entity definitions and state models
├── quickstart.md            # Developer setup guide
├── contracts/               # API contracts
│   ├── routes.yaml          # Route definitions and loaders
│   └── navigation.ts        # Navigation component interfaces
└── checklists/              # Feature checklists
    └── requirements.md      # Requirements checklist
```

**Total**: 4,647 lines across 8 files

---

## 🎯 Feature Requirements

### Functional Requirements

- **FR-001**: Replace global UI components with Shadcn components (especially navigation bar)
- **FR-002**: Implement mobile-first responsive layouts (375px, 768px, 1024px breakpoints)
- **FR-003**: Support light/dark themes with automatic system detection and manual toggle
- **FR-004**: Integrate React Router for client-side routing with deep links
- **FR-005**: Provide route-aware navigation state (active item highlighting)
- **FR-006**: Achieve ≥90% unit test coverage for new/modified modules
- **FR-007**: Add integration/e2e tests for navigation flows in both themes

### Success Criteria

- **SC-001**: Users can access feed list and articles in both themes without layout issues (< 3s load)
- **SC-002**: Direct URL access and browser back/forward work correctly (100% test pass rate)
- **SC-003**: New/modified code achieves ≥90% unit test coverage
- **SC-004**: No accessibility regressions (keyboard nav, focus states, ARIA labels intact)

---

## 🔧 Technology Stack

| Component | Technology | Version | Decision |
|-----------|-----------|---------|----------|
| **Frontend Framework** | React | 18.3.1 | ✅ Existing |
| **Build Tool** | Vite | 7.3.1 | ✅ Existing |
| **Language** | TypeScript | 5.7.2 | ✅ Existing |
| **Routing** | React Router | v6 (latest) | ✨ NEW |
| **UI Components** | Shadcn UI | Latest | ✨ NEW |
| **Styling** | Tailwind CSS | 4.1.18 | ✅ Existing |
| **Icons** | Lucide React | 0.563.0 | ✅ Existing |
| **State Management** | Zustand | 4.5.5 | ✅ Existing |
| **Testing (Unit)** | Vitest | 4.0.18 | ✅ Existing |
| **Testing (E2E)** | Playwright | 1.48.2 | ✅ Existing |
| **API Mocking** | MSW | 2.12.7 | ✅ Existing |

**Key Decision**: Use React Router v6 Data Router (`createBrowserRouter`) for offline PWA support and type-safe loaders.

---

## 📚 Documentation Index

### Start Here

1. **[plan.md](./plan.md)** - Complete implementation plan with architecture, structure, and phase breakdown
   - Technical Context (languages, dependencies, constraints)
   - Constitution Check (PWA, test-first, responsive design compliance)
   - Project Structure (file tree with NEW vs EXISTING markers)
   - Phase 0: Research tasks
   - Phase 1: Design deliverables

2. **[quickstart.md](./quickstart.md)** - Developer setup guide (installation, workflows, troubleshooting)
   - Prerequisites and installation steps
   - Development workflows (create route, add component, test theme)
   - Testing setup (unit, integration, e2e)
   - Common tasks and troubleshooting

### Research & Design

3. **[research.md](./research.md)** - Technology evaluation and decisions (48,414 characters)
   - Decision 1: React Router Data Router architecture
   - Decision 2: Shadcn UI component selection (12 components)
   - Decision 3: Theme system integration (CSS variables)
   - Decision 4: Mobile navigation pattern (hamburger menu)
   - Decision 5: Testing approach (Vitest + Playwright + MSW)
   - Decision 6: Migration strategy (progressive enhancement)

4. **[data-model.md](./data-model.md)** - Entity definitions and state models
   - Entity 1: Route (path, element, loader, handle)
   - Entity 2: Navigation Item (id, label, path, icon, badge)
   - Entity 3: Theme Preference (mode, systemPreference, resolvedTheme)
   - Entity 4: Navigation State (isOpen, activeRoute, history)
   - State transition diagrams (Mermaid)
   - TypeScript type definitions

### API Contracts

5. **[contracts/routes.yaml](./contracts/routes.yaml)** - Route definitions and loaders
   - 7 main routes (/, /feeds, /feeds/:id, /articles/:id, /favorites, /history, /settings, *)
   - Loader function signatures (loadFeedsData, loadFeedDetail, loadArticleDetail)
   - Route lifecycle hooks (onRouteEnter, onRouteLeave, onLoaderStart)
   - Offline behavior strategy
   - Testing checklist

6. **[contracts/navigation.ts](./contracts/navigation.ts)** - Navigation component interfaces
   - NavigationItem interface
   - NavbarProps, MobileNavProps, DesktopNavProps interfaces
   - ThemeToggleProps interface
   - Responsive behavior guidelines (mobile < 768px, desktop ≥ 768px)
   - Accessibility requirements (WCAG 2.1 AA)
   - Performance optimization guidelines

---

## 🚀 Quick Start

### For Implementers

If you're implementing this feature, follow these steps:

1. **Read the plan**:
   ```bash
   cat specs/001-replace-global-components/plan.md
   ```

2. **Review research decisions**:
   ```bash
   cat specs/001-replace-global-components/research.md
   ```

3. **Study entity models**:
   ```bash
   cat specs/001-replace-global-components/data-model.md
   ```

4. **Set up development environment**:
   ```bash
   cat specs/001-replace-global-components/quickstart.md
   # Follow installation steps
   ```

5. **Generate tasks**:
   ```bash
   # Use speckit.tasks command to generate tasks.md
   /speckit.tasks
   ```

6. **Begin implementation**:
   ```bash
   # Use speckit.implement command to execute tasks
   /speckit.implement
   ```

### For Reviewers

If you're reviewing this feature, check:

1. **Constitutional compliance** (in `plan.md`):
   - ✅ PWA Architecture maintained
   - ✅ Test-First Development (≥90% coverage)
   - ✅ Responsive Design (3 breakpoints)
   - ✅ Modern Technologies (TypeScript 5.7.2, React 18.3.1)
   - ✅ Observability (logger integration)

2. **Research justifications** (in `research.md`):
   - Why React Router Data Router over BrowserRouter?
   - Why Shadcn UI over Material UI or custom components?
   - Why CSS variables for theming over class-based approach?
   - Why hamburger menu over bottom tab bar on mobile?

3. **API contracts** (in `contracts/`):
   - Are route paths RESTful and intuitive?
   - Do component interfaces follow React best practices?
   - Are TypeScript types complete and accurate?

---

## 📊 Phase Status

| Phase | Status | Artifacts |
|-------|--------|-----------|
| **Phase 0: Research** | ✅ Complete | `research.md` (6 decisions documented) |
| **Phase 1: Design & Contracts** | ✅ Complete | `data-model.md`, `contracts/`, `quickstart.md` |
| **Phase 2: Task Generation** | ⏳ Pending | `tasks.md` (to be generated via `/speckit.tasks`) |
| **Phase 3: Implementation** | ⏳ Pending | Source code in `src/` (to be implemented via `/speckit.implement`) |

---

## 🧪 Testing Strategy

### Test Coverage Targets

- **Unit Tests**: ≥90% line and branch coverage for new code
- **Integration Tests**: All navigation flows (route changes, theme switching, mobile drawer)
- **E2E Tests**: Key user journeys across 3 viewports (375px, 768px, 1024px)

### Test Organization

```
tests/
├── unit/
│   ├── components/layout/         # Navbar, MobileNav, DesktopNav, ThemeToggle
│   ├── hooks/                     # useRouteTitle, useNavigationItems
│   └── lib/router/                # Route config, loaders
├── integration/
│   ├── navigation/routing.test.tsx        # Route navigation flow
│   ├── navigation/theme-switching.test.tsx # Theme persistence across routes
│   └── navigation/mobile-nav.test.tsx     # Mobile drawer interactions
└── e2e/
    ├── navigation.spec.ts         # Navigation across pages
    ├── routing.spec.ts            # Deep linking, back/forward
    ├── theme.spec.ts              # Theme toggle in all modes
    └── mobile-navigation.spec.ts  # Hamburger menu on mobile
```

### Running Tests

```bash
# Unit tests
npm run test              # Watch mode
npm run test:run          # Run once
npm run test:coverage     # With coverage report

# E2E tests
npm run test:e2e          # Headless mode
npm run test:e2e:ui       # Interactive UI mode
```

---

## 🏗️ Architecture Overview

### Component Hierarchy

```
App (wrapped with ThemeProvider + RouterProvider)
└── AppLayout
    ├── Navbar (responsive: shows MobileNav or DesktopNav)
    │   ├── MobileNav (< 768px: Shadcn Sheet drawer)
    │   │   └── NavigationItem[] (vertical list)
    │   ├── DesktopNav (≥ 768px: Shadcn NavigationMenu)
    │   │   └── NavigationItem[] (horizontal list)
    │   └── ThemeToggle (Shadcn Button + DropdownMenu)
    └── Outlet (React Router outlet)
        └── [Page Component] (FeedsPage, FeedDetailPage, etc.)
            └── [Content Components] (FeedList, ArticleList, etc.)
```

### Data Flow

```
User Action → React Router Navigate
             ↓
Route Loader Executes (fetch data from IndexedDB)
             ↓
Page Component Renders (with loader data)
             ↓
Navigation State Updates (activeRoute, history)
             ↓
Navigation Items Re-render (highlight active item)
```

### Theme Flow

```
User Clicks ThemeToggle → setTheme('dark')
                          ↓
ThemeProvider Updates → mode = 'dark'
                          ↓
                       resolvedTheme = 'dark'
                          ↓
Apply to DOM → <html class="dark">
              ↓
Update CSS Variables → --background: dark color
                       --foreground: light color
                          ↓
Persist → localStorage.setItem('theme', 'dark')
        ↓
Update Manifest → manifest.theme_color = '#1a1a1a'
```

---

## 🎨 Design Decisions

### 1. React Router Data Router

**Chosen**: `createBrowserRouter` with data loaders

**Rationale**:
- Data loaders handle offline scenarios (fallback to IndexedDB)
- Type-safe with TypeScript (loader data inference)
- Future-proof (React Router team's recommended approach)
- Built-in error boundaries and code splitting

**Alternatives Rejected**:
- `BrowserRouter` + `<Routes>`: No data loading, manual error handling
- TanStack Router: Smaller ecosystem, requires code generation
- Next.js App Router: Overkill for client-only SPA

### 2. Shadcn UI Components

**Chosen**: Shadcn UI (12 components via CLI)

**Rationale**:
- Tailwind-native (matches existing styling approach)
- Copy-paste source code (no node_modules bloat)
- Dark mode via CSS variables (seamless integration)
- Accessibility built-in (Radix UI primitives)

**Alternatives Rejected**:
- Material UI: Heavy bundle, CSS-in-JS conflicts with Tailwind
- Custom components: Time-consuming, manual accessibility
- Radix UI directly: Requires writing all styles from scratch

### 3. Theme System

**Chosen**: CSS variables + localStorage + `<html>` class

**Rationale**:
- No FOUC (flash of unstyled content) via inline script
- System preference detection (`prefers-color-scheme`)
- PWA manifest `theme_color` updates dynamically
- Tailwind v4 native support for CSS variables

**Alternatives Rejected**:
- Class-only (`dark` class): Potential FOUC on load
- Context-only: Doesn't update CSS (requires CSS vars anyway)
- CSS-in-JS: Runtime overhead, conflicts with Tailwind

### 4. Mobile Navigation

**Chosen**: Hamburger menu with Shadcn Sheet (< 768px)

**Rationale**:
- Industry standard for content apps (Feedly, Inoreader)
- Maximizes vertical space for articles (no bottom tab bar)
- Shadcn Sheet has built-in animations and focus management
- Easy transition to desktop (horizontal nav at ≥ 768px)

**Alternatives Rejected**:
- Bottom tab bar: Uses vertical space, limited to 5-6 items
- Persistent side drawer: Too wide for phones
- Top tabs (swipeable): Limited to 3-4 items, no hierarchy

---

## 📝 Migration Strategy

### Phase 1: Navigation & Routing (Week 1)

**Goal**: Install React Router and Shadcn UI, build new layout components, zero changes to existing pages

**Files to Create**:
- `src/lib/router/routes.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/components/layout/DesktopNav.tsx`
- `src/components/layout/ThemeToggle.tsx`
- `src/lib/theme/ThemeProvider.tsx`
- `src/components/ui/*` (Shadcn components)

**Files to Modify**:
- `src/App.tsx` (wrap with providers)

**Validation**: All existing pages render without errors, navigation works, theme toggle works

### Phase 2: Component Wrapping (Week 2)

**Goal**: Wrap 3-5 high-visibility components with Shadcn primitives, maintain existing APIs

**Components to Wrap**:
1. `AddFeedDialog` → use Shadcn `Dialog`
2. `FeedCard` → use Shadcn `Card`
3. Buttons → use Shadcn `Button`
4. `OfflineIndicator` → use Shadcn `Badge` or `Alert`
5. `CategoryList` → use Shadcn `Tabs` or `Accordion`

**Validation**: Wrapped components still pass existing tests, visual consistency improved

### Phase 3: Future Enhancements (Post-Launch)

**Goal**: Refactor remaining components as time permits (no deadline pressure)

**Components to Refactor**:
- `LoadingSpinner` → Shadcn `Skeleton`
- Settings form inputs → Shadcn `Input`, `Label`, `Select`
- `ErrorMessage` → Shadcn `Alert`

---

## 🔗 Related Features

This feature connects to:

- **Feature 001-rss-reader-mvp** (original MVP): Maintains all existing RSS functionality
- **PWA Architecture** (Constitution Principle I): Preserves offline support and service worker
- **Dark Mode** (Constitution Principle FR-006): Enhances theme system with Shadcn integration

---

## 📞 Support & Questions

- **Technical Questions**: Review `research.md` for detailed decision rationale
- **Setup Issues**: Check `quickstart.md` troubleshooting section
- **API Questions**: Reference `contracts/` for interfaces and types
- **Testing Issues**: See `plan.md` Phase 1 for testing strategy

---

## 📜 License

This feature is part of the RSS Reader project. See repository root for license information.

---

**Feature Status**: Planning Complete ✅  
**Next Command**: `/speckit.tasks` to generate task list  
**Document Version**: 1.0.0  
**Last Updated**: 2026-02-05
