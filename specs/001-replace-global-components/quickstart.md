# Developer Quickstart: Shadcn UI + React Router Integration

**Feature**: Replace Global Components with Shadcn UI  
**Date**: 2026-02-05  
**Status**: Complete  
**Phase**: 1 (Design & Contracts)

This guide helps developers set up and work with the new Shadcn UI components and React Router v6 integration in the RSS Reader application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Testing Setup](#testing-setup)
6. [Key Files to Review](#key-files-to-review)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)
9. [Additional Resources](#additional-resources)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: 18.x or later (check with `node --version`)
- **npm or pnpm**: Latest version (check with `npm --version`)
- **Git**: For cloning the repository
- **Code Editor**: VS Code recommended (with TypeScript + Tailwind extensions)
- **Browser**: Chrome, Firefox, or Safari (latest version for testing)

**Verify existing project setup**:
```bash
# Clone repository (if not already done)
git clone <repository-url>
cd rss-reader

# Install existing dependencies
npm install

# Verify existing setup works
npm run dev
```

If the dev server starts successfully and the app loads in your browser, you're ready to proceed.

---

## Installation Steps

### Step 1: Install React Router v6

```bash
# Install React Router DOM (client-side routing)
npm install react-router-dom@^6

# Install TypeScript types
npm install -D @types/react-router-dom
```

**Verification**:
```bash
npm list react-router-dom
# Should show: react-router-dom@6.x.x
```

---

### Step 2: Install Shadcn UI Components

Shadcn UI is not installed as a package. Instead, components are copied into your `src/components/ui/` directory.

#### 2a. Initialize Shadcn UI

```bash
# Run Shadcn CLI (interactive setup)
npx shadcn-ui@latest init
```

**Configuration prompts** (select these options):

- **Style**: `Default` (modern, clean design)
- **Base color**: `Neutral` (matches existing design system)
- **CSS variables**: `Yes` (enables dark mode via CSS custom properties)
- **Components location**: `src/components/ui` (default)
- **Utils location**: `@/lib/utils` (Tailwind utility helper)
- **Tailwind config**: `tailwind.config.js` (or `tailwind.config.ts` if using TypeScript config)
- **Import alias**: `@/*` (should already be configured in `vite.config.ts`)

**What this does**:
- Adds Shadcn CSS variables to `src/styles/index.css`
- Creates `src/lib/utils.ts` (Tailwind `cn()` helper for conditional classes)
- Updates `tailwind.config.js` with Shadcn theme configuration
- Creates `components.json` configuration file

#### 2b. Install Required Components

Install all components needed for navigation and theming:

```bash
# Core navigation components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add dropdown-menu

# Layout and indicators
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add badge

# Optional (for future enhancements)
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add skeleton
```

**What this does**:
- Copies component files to `src/components/ui/`
- Each component is a self-contained `.tsx` file
- Components use Radix UI primitives + Tailwind styling
- No node_modules bloat (source code approach)

**Verification**:
```bash
ls src/components/ui/
# Should show: button.tsx, sheet.tsx, navigation-menu.tsx, dropdown-menu.tsx, card.tsx, dialog.tsx, etc.
```

---

### Step 3: Configure Theme System

Shadcn init already added CSS variables to `src/styles/index.css`. Verify the file contains:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... more CSS variables ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... more CSS variables ... */
  }
}
```

If not present, Shadcn init may have failed. Re-run `npx shadcn-ui@latest init`.

**Dark Mode Configuration**:

Ensure Tailwind is configured for dark mode. If using Tailwind v4 (project uses 4.1.18), dark mode is automatically configured via the `dark:` variant.

For Tailwind v3, verify `tailwind.config.js` has:
```javascript
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
};
```

---

### Step 4: Verify Vite Config for Path Aliases

Shadcn uses path aliases like `@/components/ui/button`. Ensure `vite.config.ts` has these aliases:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@models': path.resolve(__dirname, './src/models'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
});
```

**Note**: The project already has these aliases configured. No changes needed.

---

### Step 5: Run Development Server

Start the development server to verify setup:

```bash
npm run dev
```

Open http://localhost:5173 in your browser. The app should load without errors.

**Check Console**:
- No TypeScript errors related to Shadcn imports
- No CSS errors or missing variable warnings
- No React errors about missing components

---

## Project Structure

After installation, your project structure includes new directories:

```text
rss-reader/
├── src/
│   ├── components/
│   │   ├── ui/                        # ✨ NEW: Shadcn UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── skeleton.tsx
│   │   │
│   │   ├── layout/                    # ✨ NEW: Layout components
│   │   │   ├── AppLayout.tsx          # Root layout with Navbar + Outlet
│   │   │   ├── Navbar.tsx             # Main navigation (responsive)
│   │   │   ├── MobileNav.tsx          # Mobile drawer (Sheet)
│   │   │   ├── DesktopNav.tsx         # Desktop horizontal nav
│   │   │   └── ThemeToggle.tsx        # Theme switcher dropdown
│   │   │
│   │   ├── AddFeedDialog/             # EXISTING (may wrap with Shadcn Dialog)
│   │   ├── ArticleList/               # EXISTING
│   │   ├── ArticleView/               # EXISTING
│   │   ├── CategoryList/              # EXISTING
│   │   ├── Common/                    # EXISTING
│   │   ├── FeedList/                  # EXISTING (may use Shadcn Card)
│   │   └── Settings/                  # EXISTING
│   │
│   ├── lib/
│   │   ├── router/                    # ✨ NEW: React Router config
│   │   │   ├── routes.tsx             # Route definitions + loaders
│   │   │   ├── routeConfig.ts         # Route metadata (titles, icons)
│   │   │   └── navigationItems.ts     # Navigation menu items
│   │   │
│   │   ├── theme/                     # ✨ NEW: Theme system
│   │   │   ├── ThemeProvider.tsx      # Theme context provider
│   │   │   └── themeUtils.ts          # System theme detection
│   │   │
│   │   ├── utils.ts                   # ✨ UPDATED: Added Shadcn cn() helper
│   │   ├── logger.ts                  # EXISTING
│   │   └── storage.ts                 # EXISTING
│   │
│   ├── pages/                         # EXISTING (pages as route components)
│   │   ├── FeedsPage.tsx              # ✨ NEW: Wrapper for FeedList
│   │   ├── FeedDetailPage.tsx         # ✨ NEW: Wrapper for feed/:id
│   │   ├── ArticleDetailPage.tsx      # ✨ NEW: Wrapper for article/:id
│   │   ├── Favorites.tsx              # EXISTING
│   │   ├── History.tsx                # EXISTING
│   │   ├── Settings.tsx               # EXISTING
│   │   └── NotFoundPage.tsx           # ✨ NEW: 404 fallback
│   │
│   ├── types/
│   │   ├── navigation.ts              # ✨ NEW: Navigation type definitions
│   │   └── ...                        # EXISTING types
│   │
│   ├── styles/
│   │   ├── index.css                  # ✨ UPDATED: Added Shadcn CSS variables
│   │   └── themes.css                 # ✨ NEW: Additional theme variables (optional)
│   │
│   ├── App.tsx                        # ✨ UPDATED: Wrap with Router + ThemeProvider
│   └── main.tsx                       # EXISTING (entry point)
│
├── tests/
│   ├── unit/
│   │   ├── components/layout/         # ✨ NEW: Unit tests for navigation
│   │   └── lib/router/                # ✨ NEW: Unit tests for routing
│   ├── integration/
│   │   └── navigation/                # ✨ NEW: Integration tests
│   └── e2e/
│       ├── navigation.spec.ts         # ✨ NEW: E2E navigation tests
│       └── theme.spec.ts              # ✨ NEW: E2E theme switching tests
│
├── components.json                    # ✨ NEW: Shadcn configuration
└── ...                                # EXISTING project files
```

**Legend**:
- ✨ **NEW**: Files/directories created during this feature implementation
- **UPDATED**: Existing files modified for Shadcn/Router integration
- **EXISTING**: No changes to these files

---

## Development Workflow

### Workflow 1: Create a New Route

**Scenario**: Add a new `/search` route for article search

**Steps**:

1. **Create page component**:
   ```bash
   touch src/pages/SearchPage.tsx
   ```

   ```tsx
   // src/pages/SearchPage.tsx
   export default function SearchPage() {
     return (
       <div>
         <h1>Search</h1>
         {/* Search UI */}
       </div>
     );
   }
   ```

2. **Add route definition** in `src/lib/router/routes.tsx`:
   ```tsx
   import { lazy } from 'react';
   const SearchPage = lazy(() => import('@pages/SearchPage'));

   export const router = createBrowserRouter([
     {
       path: '/',
       element: <AppLayout />,
       children: [
         // ... existing routes ...
         { path: 'search', element: <SearchPage /> }, // ✨ NEW
       ],
     },
   ]);
   ```

3. **Add navigation item** in `src/lib/router/navigationItems.ts`:
   ```tsx
   import { Search } from 'lucide-react';

   export const navigationItems: NavigationItem[] = [
     // ... existing items ...
     {
       id: 'nav-search',
       label: 'Search',
       path: '/search',
       icon: Search,
       group: 'main',
     },
   ];
   ```

4. **Write unit tests** for `SearchPage.tsx`:
   ```bash
   touch tests/unit/pages/SearchPage.test.tsx
   ```

5. **Test in browser**:
   ```bash
   npm run dev
   # Navigate to http://localhost:5173/search
   ```

6. **Run tests**:
   ```bash
   npm run test:run
   npm run test:coverage
   ```

---

### Workflow 2: Add a New Shadcn Component

**Scenario**: Add `Alert` component for error messages

**Steps**:

1. **Install component**:
   ```bash
   npx shadcn-ui@latest add alert
   ```

2. **Verify installation**:
   ```bash
   ls src/components/ui/alert.tsx
   # File should exist
   ```

3. **Use in your component**:
   ```tsx
   import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
   import { AlertCircle } from 'lucide-react';

   function ErrorMessage({ title, message }: { title: string; message: string }) {
     return (
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>{title}</AlertTitle>
         <AlertDescription>{message}</AlertDescription>
       </Alert>
     );
   }
   ```

4. **No configuration needed**: Shadcn components work immediately with existing theme

---

### Workflow 3: Test Theme Switching

**Scenario**: Verify theme toggle works across all routes

**Steps**:

1. **Run dev server**:
   ```bash
   npm run dev
   ```

2. **Manual testing**:
   - Click theme toggle in navbar (sun/moon icon)
   - Select "Light", "Dark", or "System"
   - Navigate between routes → theme should persist
   - Refresh page → theme should persist (localStorage)
   - Check browser DevTools → `<html>` should have `class="dark"` or `class="light"`

3. **Automated testing**:
   ```bash
   npm run test:e2e -- theme.spec.ts
   ```

4. **Check PWA manifest**:
   - Open DevTools → Application tab → Manifest
   - Verify `theme_color` updates when theme changes

---

## Testing Setup

### Unit Tests (Vitest + Testing Library)

**Run tests**:
```bash
npm run test              # Watch mode
npm run test:run          # Run once
npm run test:coverage     # With coverage report
npm run test:ui           # Interactive UI mode
```

**Write a unit test**:
```tsx
// tests/unit/components/layout/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '@components/layout/Navbar';
import { ThemeProvider } from '@lib/theme/ThemeProvider';

describe('Navbar', () => {
  const renderNavbar = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          <Navbar
            items={mockNavigationItems}
            currentPath="/feeds"
            onNavigate={vi.fn()}
          />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('renders navigation items', () => {
    renderNavbar();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Feeds')).toBeInTheDocument();
  });
});
```

**Mocking React Router**:
```tsx
import { MemoryRouter } from 'react-router-dom';

// Wrap component in MemoryRouter for isolated testing
render(
  <MemoryRouter initialEntries={['/feeds']}>
    <ComponentUnderTest />
  </MemoryRouter>
);
```

**Mocking Theme**:
```tsx
// Mock matchMedia for responsive tests
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));
```

---

### Integration Tests (Vitest + Testing Library + MSW)

**Run integration tests**:
```bash
npm run test -- tests/integration/
```

**Example integration test**:
```tsx
// tests/integration/navigation/routing.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router-dom';
import { router } from '@lib/router/routes';

describe('Routing Integration', () => {
  it('navigates from feeds to feed detail', async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);

    // Wait for feeds page
    await waitFor(() => {
      expect(screen.getByText(/feeds/i)).toBeInTheDocument();
    });

    // Click feed link
    const feedLink = screen.getByRole('link', { name: /tech news/i });
    await user.click(feedLink);

    // Verify feed detail page
    await waitFor(() => {
      expect(screen.getByText(/tech news articles/i)).toBeInTheDocument();
    });
  });
});
```

---

### E2E Tests (Playwright)

**Run E2E tests**:
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:ui       # Interactive UI mode
```

**Example E2E test**:
```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('navigates between pages', async ({ page }) => {
  await page.goto('/');
  
  // Should start on feeds page
  await expect(page.locator('h1')).toContainText('Feeds');
  
  // Click Settings link
  await page.click('a[href="/settings"]');
  await expect(page).toHaveURL('/settings');
  await expect(page.locator('h1')).toContainText('Settings');
});

test('toggles theme', async ({ page }) => {
  await page.goto('/');
  
  // Click theme toggle
  await page.click('button[aria-label*="toggle theme"]');
  await page.click('text=Dark');
  
  // Verify dark class
  const htmlClass = await page.locator('html').getAttribute('class');
  expect(htmlClass).toContain('dark');
});
```

**Test across viewports**:
```typescript
import { devices } from '@playwright/test';

test.describe('Mobile navigation', () => {
  test.use(devices['iPhone 13']);
  
  test('opens mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label*="menu"]');
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).toBeVisible();
  });
});
```

---

## Key Files to Review

Before implementing components, review these key files:

### 1. **Route Definitions** (`specs/001-replace-global-components/contracts/routes.yaml`)

- Complete route structure
- Loader function signatures
- Error handling patterns
- Offline behavior

### 2. **Navigation Contracts** (`specs/001-replace-global-components/contracts/navigation.ts`)

- Component prop interfaces
- Navigation item structure
- Accessibility requirements
- Integration patterns

### 3. **Data Model** (`specs/001-replace-global-components/data-model.md`)

- Entity definitions (Route, NavigationItem, ThemePreference, NavigationState)
- State transitions
- Validation rules

### 4. **Research Decisions** (`specs/001-replace-global-components/research.md`)

- React Router Data Router rationale
- Shadcn UI component selection
- Theme system architecture
- Mobile navigation pattern
- Testing approach
- Migration strategy

---

## Common Tasks

### Task 1: Update Document Title on Route Change

```tsx
// src/lib/router/routes.tsx
import { useEffect } from 'react';
import { useMatches } from 'react-router-dom';

export function useRouteTitle() {
  const matches = useMatches();
  
  useEffect(() => {
    const currentRoute = matches[matches.length - 1];
    const title = currentRoute.handle?.title || 'RSS Reader';
    document.title = title;
  }, [matches]);
}

// Use in AppLayout:
function AppLayout() {
  useRouteTitle(); // Updates document.title on route change
  return <div>{/* ... */}</div>;
}
```

---

### Task 2: Add Loading State to Route

```tsx
// src/lib/router/routes.tsx
import { Suspense } from 'react';
import { Skeleton } from '@components/ui/skeleton';

const FeedDetailPage = lazy(() => import('@pages/FeedDetailPage'));

// In route config:
{
  path: '/feeds/:feedId',
  element: (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <FeedDetailPage />
    </Suspense>
  ),
  loader: loadFeedDetail,
}
```

---

### Task 3: Add Badge to Navigation Item

```tsx
// src/lib/router/navigationItems.ts
import { useStore } from '@hooks/useStore';

export function useNavigationItems(): NavigationItem[] {
  const unreadCount = useStore(state => state.unreadCount);

  return [
    {
      id: 'nav-feeds',
      label: 'Feeds',
      path: '/feeds',
      icon: Rss,
      badge: unreadCount, // ✨ Dynamic badge from Zustand
      group: 'main',
    },
    // ... other items
  ];
}
```

---

### Task 4: Customize Shadcn Component

Shadcn components are source code, so you can edit them directly:

```tsx
// src/components/ui/button.tsx
// Add custom variant:
const buttonVariants = cva(
  "/* base styles */",
  {
    variants: {
      variant: {
        default: "/* ... */",
        destructive: "/* ... */",
        outline: "/* ... */",
        secondary: "/* ... */",
        ghost: "/* ... */",
        link: "/* ... */",
        custom: "bg-purple-500 text-white hover:bg-purple-600", // ✨ NEW
      },
    },
  }
);

// Use in your component:
<Button variant="custom">Custom Button</Button>
```

---

## Troubleshooting

### Issue 1: "Cannot find module '@/components/ui/button'"

**Cause**: Path alias not configured in `vite.config.ts` or `tsconfig.json`

**Fix**:
```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Restart VS Code and dev server after changes.

---

### Issue 2: Dark mode not working

**Cause**: CSS variables not loaded or `dark` class not applied to `<html>`

**Fix**:
1. Verify `src/styles/index.css` has `.dark { --background: ...; }` styles
2. Check `<html>` element in DevTools → should have `class="dark"` or `class="light"`
3. Ensure `ThemeProvider` wraps entire app in `App.tsx`
4. Check localStorage for `theme` key (should be "light", "dark", or "system")

---

### Issue 3: Router not updating URL

**Cause**: Using `<a>` tags instead of React Router's `<Link>`

**Fix**:
```tsx
// ❌ Wrong:
<a href="/feeds">Feeds</a>

// ✅ Correct:
import { Link } from 'react-router-dom';
<Link to="/feeds">Feeds</Link>
```

---

### Issue 4: Tests failing with "ReferenceError: matchMedia is not defined"

**Cause**: JSDOM doesn't have `window.matchMedia` by default

**Fix**:
Add to `tests/setup.ts`:
```typescript
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

---

### Issue 5: Shadcn components not styled

**Cause**: Tailwind CSS not processing `src/components/ui/` directory

**Fix**:
Verify `tailwind.config.js` content paths include:
```javascript
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Includes src/components/ui/
  ],
  // ...
};
```

---

## Additional Resources

### Documentation

- **React Router v6**: https://reactrouter.com/en/main
- **Shadcn UI**: https://ui.shadcn.com/docs
- **Radix UI** (Shadcn foundation): https://www.radix-ui.com/primitives/docs/overview/introduction
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons/
- **Vitest**: https://vitest.dev/guide/
- **Playwright**: https://playwright.dev/docs/intro

### Useful Commands

```bash
# Development
npm run dev                     # Start dev server
npm run build                   # Build for production
npm run preview                 # Preview production build

# Testing
npm run test                    # Run unit tests (watch mode)
npm run test:run                # Run unit tests (once)
npm run test:coverage           # Run tests with coverage report
npm run test:ui                 # Open Vitest UI
npm run test:e2e                # Run Playwright E2E tests
npm run test:e2e:ui             # Open Playwright UI

# Linting & Formatting
npm run lint                    # Run ESLint
npm run format                  # Run Prettier
npm run type-check              # TypeScript type checking

# Shadcn
npx shadcn-ui@latest add <component>  # Install component
npx shadcn-ui@latest diff <component> # Check for component updates
```

### VS Code Extensions

Recommended extensions for optimal DX:

- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **TypeScript Vue Plugin (Volar)** (Vue.vscode-typescript-vue-plugin)
- **Pretty TypeScript Errors** (yoavbls.pretty-ts-errors)
- **Error Lens** (usernamehw.errorlens)
- **Playwright Test for VSCode** (ms-playwright.playwright)

---

## Summary

You've successfully set up:

✅ React Router v6 for client-side routing  
✅ Shadcn UI components for navigation and theming  
✅ Dark/Light theme system with persistence  
✅ Comprehensive testing infrastructure  
✅ Development workflow and common tasks  

**Next Steps**:

1. Read `specs/001-replace-global-components/plan.md` for overall architecture
2. Review `contracts/navigation.ts` for component interfaces
3. Implement `src/components/layout/Navbar.tsx` (follow TDD: tests first!)
4. Run `npm run test:coverage` to verify ≥90% coverage

**Questions?** Review `specs/001-replace-global-components/research.md` for detailed decision rationale.

---

**Document Version**: 1.0.0  
**Author**: Design Workflow  
**Last Updated**: 2026-02-05
