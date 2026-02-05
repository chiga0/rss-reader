# Research: Replace Global Components with Shadcn UI

**Feature**: Replace Global Components with Shadcn UI  
**Date**: 2026-02-05  
**Status**: Complete  
**Phase**: 0 (Research & Technology Evaluation)

---

## Decision 1: React Router Architecture (Data Router vs BrowserRouter)

### Decision
Use **React Router v6 Data Router** (`createBrowserRouter`) with lazy-loaded route components and typed route parameters.

### Rationale
1. **Data Loaders for Offline Support**: Data routers allow defining `loader` functions that can gracefully handle offline scenarios by falling back to IndexedDB cached data. This aligns with PWA principles.

2. **Type Safety**: Data routers work better with TypeScript, providing type inference for route params and loader data via `useLoaderData<T>()`.

3. **Future-Proof**: React Router team recommends data routers as the modern approach (introduced in v6.4). Legacy `BrowserRouter` + `Route` components will eventually be deprecated.

4. **Code Splitting**: Data routers integrate seamlessly with `React.lazy()` for automatic code splitting, reducing initial bundle size.

5. **Error Boundaries**: Built-in `errorElement` prop for route-level error handling without manual error boundary setup.

### Alternatives Considered

**Alternative 1: Classic BrowserRouter with <Routes>**
- **Pros**: Simpler mental model; familiar to React developers; easier to migrate from existing non-routed code
- **Cons**: No built-in data loading; manual error boundaries; less type-safe; not the recommended modern approach
- **Rejected Because**: Data loaders are critical for offline PWA data fetching patterns. Manual error handling across all routes adds complexity.

**Alternative 2: TanStack Router**
- **Pros**: Fully type-safe with auto-generated route types; excellent TypeScript DX; built-in search param validation
- **Cons**: Newer library with smaller ecosystem; requires additional build-time code generation; steeper learning curve
- **Rejected Because**: React Router v6 is the de facto standard with massive community support. Team familiarity matters for maintainability.

**Alternative 3: Next.js App Router (file-based routing)**
- **Pros**: File-system based routing; automatic code splitting; server components (not applicable here)
- **Cons**: Requires migrating entire project to Next.js; PWA setup more complex with Next.js; overkill for client-only SPA
- **Rejected Because**: Project is explicitly a Vite-based SPA, not SSR. Next.js would be architectural over-engineering.

### Implementation Notes

**Router Setup** (`src/lib/router/routes.tsx`):
```typescript
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AppLayout } from '@components/layout/AppLayout';
import { storage } from '@lib/storage';

// Lazy-load page components for code splitting
const FeedsPage = lazy(() => import('@pages/FeedsPage'));
const FeedDetailPage = lazy(() => import('@pages/FeedDetailPage'));
const ArticleDetailPage = lazy(() => import('@pages/ArticleDetailPage'));
const FavoritesPage = lazy(() => import('@pages/Favorites'));
const HistoryPage = lazy(() => import('@pages/History'));
const SettingsPage = lazy(() => import('@pages/Settings'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

// Loader functions handle offline scenarios
async function loadFeedsData() {
  try {
    const feeds = await storage.getAll('feeds');
    return { feeds, isOffline: !navigator.onLine };
  } catch (error) {
    return { feeds: [], isOffline: true, error };
  }
}

async function loadFeedDetail({ params }: { params: { feedId: string } }) {
  const feed = await storage.get('feeds', params.feedId);
  const articles = await storage.getAll('articles').then(arts => 
    arts.filter(a => a.feedId === params.feedId)
  );
  return { feed, articles };
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/feeds" replace /> },
      { path: 'feeds', element: <FeedsPage />, loader: loadFeedsData },
      { path: 'feeds/:feedId', element: <FeedDetailPage />, loader: loadFeedDetail },
      { path: 'articles/:articleId', element: <ArticleDetailPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

**Service Worker Integration**:
- React Router navigation events can trigger service worker cache updates
- Use `beforeunload` event to cache current route for offline persistence
- Workbox navigation preload for instant route transitions

**Testing Strategy**:
- Use `MemoryRouter` with initial entries for unit tests
- Mock `useLoaderData()` hook in component tests
- Test offline scenarios by mocking `navigator.onLine` and loader failures

---

## Decision 2: Shadcn UI Component Selection

### Decision
Install the following Shadcn UI components via CLI (total: 12 components):

**Core Navigation**:
- `button` - Primary CTA and nav actions
- `sheet` - Mobile drawer navigation (burger menu)
- `navigation-menu` - Desktop horizontal navigation
- `dropdown-menu` - User profile menu and actions

**Layout & Cards**:
- `card` - Feed cards and article previews
- `tabs` - Settings sections and feed categories
- `dialog` - Add Feed modal, confirmations
- `separator` - Visual dividers in navigation

**Indicators & Feedback**:
- `badge` - Unread counts on nav items
- `avatar` - User profile (future enhancement)
- `tooltip` - Icon explanations on hover
- `skeleton` - Loading states during navigation

### Rationale

1. **Tailwind v4 Compatibility**: Shadcn UI uses Tailwind CSS and Radix UI primitives, both of which are compatible with Tailwind v4.x. The project already uses Tailwind 4.1.18, so no conflicts.

2. **Lucide Icons Alignment**: Shadcn recommends Lucide React for icons. Project already uses `lucide-react@0.563.0`, so perfect alignment.

3. **Dark Mode via CSS Variables**: Shadcn's theming system uses CSS custom properties (`--background`, `--foreground`, etc.), which integrates cleanly with the existing `useTheme` hook and Tailwind's `dark:` variant.

4. **No JS Bundle Bloat**: Shadcn components are copied into `src/components/ui/` as source code (not installed as node_modules). Tree-shaking works optimally—only imported components are bundled.

5. **Accessibility Built-In**: All Shadcn components use Radix UI primitives, which have WCAG 2.1 AA compliance baked in (keyboard nav, ARIA labels, focus management).

### Alternatives Considered

**Alternative 1: Continue with Custom Components**
- **Pros**: Full control; no external dependencies; existing code already works
- **Cons**: Manual accessibility; manual dark mode; manual responsive behavior; time-consuming to maintain
- **Rejected Because**: User explicitly requested Shadcn UI. Custom components lack the polish and accessibility of battle-tested libraries.

**Alternative 2: Material UI (MUI)**
- **Pros**: Comprehensive component library; mature ecosystem; good TypeScript support
- **Cons**: Heavy bundle size (~300KB gzipped); opinionated Material Design aesthetic; conflicts with Tailwind utility-first approach
- **Rejected Because**: Project uses Tailwind for styling. MUI's CSS-in-JS approach conflicts. Shadcn's utility-first philosophy aligns better.

**Alternative 3: Radix UI Primitives Directly**
- **Pros**: Unstyled components; maximum flexibility; smaller bundle (no Shadcn wrapper)
- **Cons**: Requires writing all styles from scratch; no pre-built dark mode; slower development
- **Rejected Because**: Shadcn is essentially pre-styled Radix components with Tailwind. Reinventing this wheel wastes time.

**Alternative 4: Headless UI (by Tailwind Labs)**
- **Pros**: Official Tailwind companion; lightweight; good accessibility
- **Cons**: Smaller component selection (no Card, Badge, etc.); less active development than Radix/Shadcn
- **Rejected Because**: Shadcn offers more components out-of-the-box. Radix UI (Shadcn's foundation) has better a11y track record.

### Implementation Notes

**Installation Commands**:
```bash
# 1. Initialize Shadcn UI (adds tailwind config, CSS vars, etc.)
npx shadcn-ui@latest init

# Configuration prompts:
# - Style: Default
# - Base color: Neutral (matches existing design)
# - CSS variables: Yes (enables dark mode)

# 2. Install components (one command for all)
npx shadcn-ui@latest add button card dialog sheet dropdown-menu navigation-menu tabs separator badge avatar tooltip skeleton

# Components will be added to src/components/ui/
```

**Customization**:
- **Colors**: Edit `src/styles/index.css` CSS variables to match brand colors
- **Dark Mode**: Tailwind's `dark:` variant is automatically configured by Shadcn init
- **Radius**: Adjust `--radius` CSS variable for border-radius consistency

**Component Mapping to Use Cases**:
| Use Case | Shadcn Component | Notes |
|----------|------------------|-------|
| Mobile burger menu | `Sheet` | Slides in from left/right; backdrop overlay |
| Desktop nav bar | `NavigationMenu` | Horizontal list with hover states |
| User profile dropdown | `DropdownMenu` | Avatar → menu with settings, logout |
| Add Feed button | `Button` | Primary variant with icon |
| Feed cards | `Card` | CardHeader + CardContent + CardFooter |
| Theme toggle | `Button` + `DropdownMenu` | Sun/Moon icon with 3 options |
| Unread count | `Badge` | Variant="secondary" on nav items |
| Loading states | `Skeleton` | During feed fetches or route transitions |

**Conflict Analysis**:
- **Existing `AddFeedDialog`**: Will wrap Shadcn `Dialog` primitive, replacing custom modal logic
- **Existing `FeedCard`**: Will use Shadcn `Card`, keeping existing content layout
- **Existing `LoadingSpinner`**: Can coexist; use Shadcn `Skeleton` for new loading states
- **No breaking changes**: All existing components remain functional during migration

---

## Decision 3: Theme System Integration

### Decision
Use **Shadcn's CSS variable-based dark mode** with a custom `ThemeProvider` that syncs theme state to:
1. CSS custom properties (for Shadcn components)
2. `localStorage` (for persistence across sessions)
3. Tailwind's `dark:` class on `<html>` (for non-Shadcn components)
4. PWA `manifest.json` `theme_color` (dynamically updated)

### Rationale

1. **CSS Variables = No Flicker**: CSS variables are injected before React hydrates, preventing FOUC (flash of unstyled content). The theme is applied instantly on page load.

2. **System Preference Detection**: Use `prefers-color-scheme` media query to detect system theme. User can override with manual toggle.

3. **Tailwind v4 Native Support**: Tailwind v4 natively supports CSS variables for theme customization. Shadcn's approach aligns perfectly.

4. **Progressive Enhancement**: Existing components using Tailwind's `dark:` variant work immediately. Shadcn components use CSS vars automatically.

5. **PWA Manifest Integration**: Dynamically updating `theme_color` in the manifest ensures the browser UI (status bar, splash screen) matches the app theme.

### Alternatives Considered

**Alternative 1: Class-Based Theming (dark class on <html>)**
- **Pros**: Simple toggle; Tailwind's default approach; no CSS variable overhead
- **Cons**: Requires JavaScript to toggle; potential FOUC on initial load; no dynamic color adjustments
- **Rejected Because**: Shadcn components rely on CSS variables. Class-only approach doesn't integrate well with Shadcn's design system.

**Alternative 2: Context-Only Theming (React Context API)**
- **Pros**: React-native approach; component-level theme access
- **Cons**: CSS still needs `dark:` classes or inline styles; doesn't solve FOUC; requires wrapping all components
- **Rejected Because**: Context alone doesn't update CSS. CSS variables are necessary for Shadcn. Context + CSS vars is the optimal hybrid.

**Alternative 3: Styled Components / Emotion (CSS-in-JS)**
- **Pros**: Dynamic theming via props; component-scoped styles
- **Cons**: Runtime CSS generation; larger bundle; conflicts with Tailwind utility classes
- **Rejected Because**: Project uses Tailwind for styling. CSS-in-JS adds unnecessary complexity and bundle size.

### Implementation Notes

**ThemeProvider** (`src/lib/theme/ThemeProvider.tsx`):
```typescript
import { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Load from localStorage, fallback to system
    return (localStorage.getItem('theme') as ThemeMode) || 'system';
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const resolvedTheme: ResolvedTheme = mode === 'system' ? systemTheme : mode;

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Apply theme to DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add resolved theme class
    root.classList.add(resolvedTheme);
    
    // Update CSS variables (Shadcn uses these)
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--background', '222.2 84% 4.9%'); // Tailwind dark background
      root.style.setProperty('--foreground', '210 40% 98%'); // Tailwind dark text
      // ... other dark mode CSS variables
    } else {
      root.style.setProperty('--background', '0 0% 100%'); // Light background
      root.style.setProperty('--foreground', '222.2 84% 4.9%'); // Light text
      // ... other light mode CSS variables
    }

    // Persist to localStorage
    localStorage.setItem('theme', mode);

    // Update PWA manifest theme_color
    updateManifestThemeColor(resolvedTheme);
  }, [mode, resolvedTheme]);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

function updateManifestThemeColor(theme: ResolvedTheme) {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (!manifestLink) return;

  // Dynamically fetch and update manifest
  fetch('/manifest.json')
    .then(res => res.json())
    .then(manifest => {
      manifest.theme_color = theme === 'dark' ? '#1a1a1a' : '#ffffff';
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      manifestLink.setAttribute('href', url);
    });
}
```

**CSS Variables Setup** (`src/styles/index.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

**ThemeToggle Component** (`src/components/layout/ThemeToggle.tsx`):
```typescript
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu';
import { useTheme } from '@lib/theme/ThemeProvider';

export function ThemeToggle() {
  const { mode, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Integration with Existing `useTheme` Hook**:
The existing `@hooks/useTheme.ts` will be replaced by the new `ThemeProvider`. Existing consumers of `useTheme()` will get the new API:
```typescript
// Old API (to be deprecated):
const { resolvedTheme } = useTheme(); // returns 'light' | 'dark'

// New API:
const { mode, resolvedTheme, setTheme } = useTheme();
// mode: 'light' | 'dark' | 'system'
// resolvedTheme: 'light' | 'dark' (computed)
// setTheme: function to change mode
```

**FOUC Prevention**:
Inject inline script in `index.html` to apply theme class before React loads:
```html
<script>
  (function() {
    const theme = localStorage.getItem('theme') || 'system';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    document.documentElement.classList.add(resolvedTheme);
  })();
</script>
```

---

## Decision 4: Mobile Navigation Pattern

### Decision
Use **hamburger menu with Shadcn Sheet component** for mobile viewports (< 768px). Sheet slides in from the left with a backdrop overlay. Desktop (≥ 768px) uses horizontal `NavigationMenu`.

**Visual Pattern**:
- **Mobile (< 768px)**: Hamburger icon (top-left) → Sheet drawer with vertical nav list → Close icon inside drawer
- **Tablet/Desktop (≥ 768px)**: Horizontal navigation bar with inline links → No hamburger menu

### Rationale

1. **Industry Standard for Content Apps**: RSS readers like Feedly, Inoreader, and NetNewsWire use hamburger menus on mobile. Users expect this pattern.

2. **Screen Real Estate**: Bottom tab bars (alternative pattern) consume 60-80px of vertical space on mobile. For reading apps, vertical space is precious. Hamburger menu hides nav until needed.

3. **Shadcn Sheet Optimized for This**: Sheet component has built-in animations, backdrop, focus trap, and keyboard navigation. No need to build custom drawer logic.

4. **Easy Transition to Desktop**: At 768px breakpoint, hide hamburger icon and show horizontal nav. Same navigation items, different layout. No route duplication.

5. **Accessibility Built-In**: Sheet component has ARIA labels, focus management (returns focus on close), and keyboard support (Escape key closes).

### Alternatives Considered

**Alternative 1: Bottom Tab Bar (iOS-style)**
- **Pros**: Always visible; no hamburger menu stigma; thumb-friendly on mobile
- **Cons**: Uses vertical space; limited to 5-6 items; conflicts with browser UI on iOS; less content area for articles
- **Rejected Because**: RSS reader articles need maximum vertical space. Bottom tabs are better for productivity apps (e.g., email), not content consumption.

**Alternative 2: Slide-In Side Menu (Persistent)**
- **Pros**: Always accessible; can show feed list + nav together; tablet-optimized
- **Cons**: Not mobile-first (too wide for phones); conflicts with swipe-to-go-back gesture on iOS
- **Rejected Because**: Mobile-first requirement means phone UX is prioritized. Persistent side menu works on tablets but breaks mobile layout.

**Alternative 3: Top Tabs (Swipeable)**
- **Pros**: Swipe gesture natural on mobile; no hamburger needed; content-aware (e.g., Android Material Design)
- **Cons**: Limited to 3-4 tabs; no hierarchical navigation; hard to surface settings or secondary actions
- **Rejected Because**: App has 6 main sections (Feeds, Favorites, History, Settings, etc.). Top tabs can't accommodate all without overflow.

**Alternative 4: No Mobile Nav (Deep Links Only)**
- **Pros**: Minimal UI; forces user to use back button (native behavior)
- **Cons**: No way to jump between sections; terrible UX for PWA; violates user expectations
- **Rejected Because**: Users need quick access to Favorites, History, and Settings. Back button-only nav is hostile UX.

### Implementation Notes

**Breakpoint Strategy**:
```typescript
// Tailwind breakpoints (tailwind.config.js already has these)
const breakpoints = {
  sm: '640px',  // Small devices (not used for nav)
  md: '768px',  // Tablet (switch to horizontal nav)
  lg: '1024px', // Desktop (full horizontal nav with labels)
};

// Navigation visibility classes:
// Mobile: < 768px → Show hamburger + Sheet
// Desktop: ≥ 768px → Show horizontal NavigationMenu
```

**Navbar Component Structure**:
```typescript
export function Navbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)'); // Hook for responsive logic

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Mobile: Hamburger Icon */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        )}

        {/* Desktop: Horizontal Nav */}
        {!isMobile && <DesktopNav items={navigationItems} />}

        {/* Theme Toggle (always visible) */}
        <ThemeToggle />
      </div>

      {/* Mobile: Sheet Drawer */}
      <MobileNav 
        isOpen={mobileNavOpen} 
        onClose={() => setMobileNavOpen(false)} 
        items={navigationItems} 
      />
    </header>
  );
}
```

**MobileNav Sheet**:
```typescript
export function MobileNav({ isOpen, onClose, items }: MobileNavProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {items.map(item => (
            <Link
              key={item.id}
              to={item.path}
              onClick={onClose} // Close drawer on navigation
              className="flex items-center gap-3 text-lg"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.badge && <Badge>{item.badge}</Badge>}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

**DesktopNav**:
```typescript
export function DesktopNav({ items }: DesktopNavProps) {
  const location = useLocation();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map(item => (
          <NavigationMenuItem key={item.id}>
            <Link to={item.path}>
              <NavigationMenuLink
                className={cn(
                  "flex items-center gap-2 px-4 py-2",
                  location.pathname === item.path && "bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

**Touch Gestures**:
- Sheet automatically supports swipe-to-close on mobile (built into Radix Dialog/Sheet)
- No custom gesture library needed (e.g., react-use-gesture)
- Native browser back button closes Sheet (via Radix Dialog's history integration)

**Performance**:
- Sheet content (nav items) renders conditionally only when `isOpen={true}`
- Desktop nav is lazy-loaded when screen width ≥ 768px (React.lazy wrapping)
- No layout shift when toggling between mobile/desktop (fixed header height)

---

## Decision 5: Testing Approach

### Decision
Use a **three-layer testing strategy** with specific tools and mocking patterns:

1. **Unit Tests (Vitest + Testing Library)**: Test components in isolation with mocked routing context
2. **Integration Tests (Vitest + Testing Library + MSW)**: Test navigation flows with real React Router
3. **E2E Tests (Playwright)**: Test full user journeys across 3 breakpoints (375px, 768px, 1024px)

**Coverage Target**: ≥90% line and branch coverage for all new code (routing, theming, navigation components).

### Rationale

1. **Vitest for Speed**: 10-20x faster than Jest for TypeScript projects. Native ESM support. Built-in UI for debugging. Perfect for TDD red-green-refactor cycles.

2. **Testing Library for Accessibility**: Testing Library's philosophy ("test how users interact") aligns with WCAG compliance. Queries like `getByRole`, `getByLabelText` enforce accessible markup.

3. **MSW for API Mocking**: Mock Service Worker intercepts network requests at the service worker level. Works in both Vitest (node environment) and Playwright (browser environment). No need for duplicate mocking logic.

4. **Playwright for Multi-Viewport**: Playwright natively supports device emulation (375px iPhone, 768px iPad, 1024px desktop). Single test suite covers all breakpoints.

5. **MemoryRouter for Isolation**: Unit tests use `MemoryRouter` with fake history to avoid real browser routing. Fast and deterministic.

### Alternatives Considered

**Alternative 1: Jest + React Testing Library**
- **Pros**: Most popular; huge ecosystem; lots of tutorials
- **Cons**: Slower than Vitest; ESM support requires experimental flags; config complexity
- **Rejected Because**: Vitest is Vite-native, faster, and has better TypeScript support. No reason to add Jest when Vitest exists.

**Alternative 2: Cypress for E2E**
- **Pros**: Great DX; time-travel debugging; visual test runner
- **Cons**: Slower than Playwright; single-browser focus; harder to run in CI; no native multi-viewport API
- **Rejected Because**: Playwright is faster, supports multiple browsers natively, and has better mobile emulation. Constitution requires testing 3 breakpoints—Playwright excels here.

**Alternative 3: Storybook + Chromatic for Visual Testing**
- **Pros**: Visual regression testing; component documentation; shareable stories
- **Cons**: Doesn't test routing or user flows; requires separate CI setup; expensive for visual diffs
- **Rejected Because**: Storybook is great for component libraries, but doesn't validate navigation or theming logic. Playwright covers visual testing via screenshots.

**Alternative 4: Manual Testing Only**
- **Pros**: No test writing overhead; flexible
- **Cons**: Can't achieve 90% coverage; manual tests are slow and error-prone; violates Constitution Principle II
- **Rejected Because**: Constitution mandates TDD with ≥80% coverage. Manual testing alone is non-compliant.

### Implementation Notes

**Vitest Configuration** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', '**/*.test.tsx'],
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
});
```

**Test Setup File** (`tests/setup.ts`):
```typescript
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server'; // MSW server

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, // Default: desktop
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// MSW server setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
  localStorageMock.clear();
});
afterAll(() => server.close());
```

**Unit Test Example** (`tests/unit/components/layout/Navbar.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '@components/layout/Navbar';
import { ThemeProvider } from '@lib/theme/ThemeProvider';

describe('Navbar', () => {
  const renderNavbar = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider>
          <Navbar />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('renders logo and theme toggle', () => {
    renderNavbar();
    expect(screen.getByRole('banner')).toBeInTheDocument(); // <header> landmark
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('shows hamburger menu on mobile', () => {
    // Mock mobile viewport
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(max-width: 767px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    renderNavbar();
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });

  it('shows horizontal nav on desktop', () => {
    // Mock desktop viewport
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query !== '(max-width: 767px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    renderNavbar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /feeds/i })).toBeInTheDocument();
  });
});
```

**Integration Test Example** (`tests/integration/navigation/routing.test.tsx`):
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router-dom';
import { router } from '@lib/router/routes';

describe('Routing Integration', () => {
  it('navigates from feeds to feed detail via link click', async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);

    // Wait for feeds page to load
    await waitFor(() => {
      expect(screen.getByText(/feeds/i)).toBeInTheDocument();
    });

    // Click on a feed link
    const feedLink = screen.getByRole('link', { name: /tech news/i });
    await user.click(feedLink);

    // Verify feed detail page renders
    await waitFor(() => {
      expect(screen.getByText(/tech news articles/i)).toBeInTheDocument();
    });
  });

  it('preserves theme across route navigation', async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);

    // Toggle to dark theme
    const themeButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(themeButton);
    await user.click(screen.getByRole('menuitem', { name: /dark/i }));

    // Verify dark class is applied
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Navigate to settings
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    await user.click(settingsLink);

    // Verify dark theme persists
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
```

**E2E Test Example** (`tests/e2e/navigation.spec.ts`):
```typescript
import { test, expect, devices } from '@playwright/test';

const viewports = [
  { name: 'iPhone 13', ...devices['iPhone 13'] },
  { name: 'iPad Pro', ...devices['iPad Pro'] },
  { name: 'Desktop', viewport: { width: 1280, height: 720 } },
];

viewports.forEach(({ name, ...device }) => {
  test.describe(`Navigation on ${name}`, () => {
    test.use(device);

    test('renders navigation correctly', async ({ page }) => {
      await page.goto('/');
      
      // Desktop shows horizontal nav
      if (name === 'Desktop') {
        await expect(page.locator('nav[role="navigation"]')).toBeVisible();
        await expect(page.locator('button[aria-label*="menu"]')).not.toBeVisible();
      } else {
        // Mobile shows hamburger
        await expect(page.locator('button[aria-label*="menu"]')).toBeVisible();
      }
    });

    test('navigates between pages', async ({ page }) => {
      await page.goto('/');
      
      if (name !== 'Desktop') {
        // Open mobile menu
        await page.click('button[aria-label*="menu"]');
      }
      
      // Click Settings link
      await page.click('a[href="/settings"]');
      
      // Verify URL and page content
      await expect(page).toHaveURL('/settings');
      await expect(page.locator('h1')).toContainText('Settings');
    });

    test('toggles theme', async ({ page }) => {
      await page.goto('/');
      
      // Click theme toggle
      await page.click('button[aria-label*="toggle theme"]');
      await page.click('text=Dark');
      
      // Verify dark class is applied
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toContain('dark');
      
      // Verify theme persists after reload
      await page.reload();
      const htmlClassAfterReload = await page.locator('html').getAttribute('class');
      expect(htmlClassAfterReload).toContain('dark');
    });
  });
});
```

**Coverage Enforcement**:
```json
// package.json scripts
{
  "scripts": {
    "test:coverage": "vitest --run --coverage",
    "test:ci": "vitest --run --coverage --reporter=verbose && npm run test:e2e"
  }
}

// CI pipeline (GitHub Actions example)
- name: Run Tests
  run: npm run test:ci
- name: Check Coverage Threshold
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 90" | bc -l) )); then
      echo "Coverage $COVERAGE% is below 90% threshold"
      exit 1
    fi
```

**Mocking React Router**:
```typescript
// For unit tests: Use MemoryRouter
import { MemoryRouter } from 'react-router-dom';

render(
  <MemoryRouter initialEntries={['/feeds/123']}>
    <ComponentUnderTest />
  </MemoryRouter>
);

// For integration tests: Use real router but mock loaders
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

const mockRouter = createMemoryRouter([
  { path: '/', element: <HomePage />, loader: vi.fn(() => ({ feeds: [] })) },
  { path: '/feeds/:id', element: <FeedDetailPage />, loader: vi.fn(() => ({ feed: mockFeed })) },
]);

render(<RouterProvider router={mockRouter} />);
```

**Mocking Theme System**:
```typescript
// Mock matchMedia for responsive tests
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: query === '(prefers-color-scheme: dark)', // Simulate dark mode
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Mock localStorage for theme persistence
const setItemMock = vi.fn();
global.localStorage.setItem = setItemMock;

// Test theme storage
render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
userEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
userEvent.click(screen.getByText('Dark'));

expect(setItemMock).toHaveBeenCalledWith('theme', 'dark');
```

---

## Decision 6: Migration Strategy for Existing Components

### Decision
Use **progressive enhancement approach** with a three-phase migration:

**Phase 1 (Immediate - Week 1)**:
- Install Shadcn UI components
- Create new layout components (Navbar, MobileNav, DesktopNav, ThemeToggle) using Shadcn primitives
- Integrate React Router with new layout
- **No changes to existing components** (FeedList, ArticleList, etc.)

**Phase 2 (Short-term - Week 2)**:
- Wrap high-impact components with Shadcn equivalents:
  - `AddFeedDialog` → use Shadcn `Dialog`
  - `FeedCard` → use Shadcn `Card`
  - Common buttons → use Shadcn `Button`
- **Keep existing component logic**; only replace UI shell

**Phase 3 (Future Enhancement - Post-launch)**:
- Gradually refactor remaining components as needed
- Replace custom `LoadingSpinner` with Shadcn `Skeleton`
- Standardize form inputs with Shadcn `Input`, `Label`, `Select`

### Rationale

1. **Risk Mitigation**: Big-bang rewrites are risky. Progressive approach allows testing each change independently.

2. **Preserve Business Logic**: Existing components have RSS parsing, feed management, and caching logic. This logic is separate from UI presentation. We only replace the "shell" (HTML structure and styles), not the "core" (business logic).

3. **Backwards Compatibility**: Existing component APIs remain unchanged. Components still accept the same props and emit the same events. Only internal implementation changes.

4. **Testability**: Each phase can be tested independently. Phase 1 validates routing and navigation. Phase 2 validates component integration. Phase 3 is polish.

5. **User Feedback**: Launching Phase 1 quickly gets user feedback on navigation UX. If users report issues, we can iterate without having touched every component.

### Alternatives Considered

**Alternative 1: Big-Bang Rewrite (Replace All Components at Once)**
- **Pros**: Clean slate; no legacy code; full consistency
- **Cons**: High risk; long development time; hard to test incrementally; likely to introduce regressions
- **Rejected Because**: Project has existing functionality that works. Rewriting everything wastes time and risks breaking feed reading, caching, or offline sync.

**Alternative 2: Feature Flag Rollout (A/B Test Old vs New UI)**
- **Pros**: Gradual user rollout; can revert if issues arise; collect metrics on user preference
- **Cons**: Requires maintaining two UI codebases; feature flag overhead; doubles testing surface
- **Rejected Because**: This is a single-user PWA (not a SaaS), so A/B testing isn't applicable. Feature flags add complexity without benefit for a personal RSS reader.

**Alternative 3: New Codebase (Fork and Rewrite)**
- **Pros**: No constraints from existing code; can rethink architecture
- **Cons**: Loses all existing work; need to reimplement RSS parsing, caching, service worker, IndexedDB, etc.; violates user request (they want to enhance existing app, not start over)
- **Rejected Because**: User explicitly said "replace components," not "rebuild entire app." Throwing away working code is wasteful.

**Alternative 4: No Migration (Keep Custom Components)**
- **Pros**: Zero risk; zero effort
- **Cons**: Doesn't fulfill user request; misses opportunity to improve accessibility and theme consistency
- **Rejected Because**: User explicitly requested Shadcn UI. Not migrating ignores the requirement.

### Implementation Notes

**Phase 1: Navigation and Routing (Week 1)**

**Goals**:
- Install React Router and Shadcn UI
- Build Navbar, MobileNav, DesktopNav, ThemeToggle components
- Integrate routing into existing `App.tsx`
- **Zero changes to existing pages** (FeedsPage, Settings, etc.)

**Files to Create**:
- `src/lib/router/routes.tsx` (router config)
- `src/components/layout/AppLayout.tsx` (root layout with Navbar)
- `src/components/layout/Navbar.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/components/layout/DesktopNav.tsx`
- `src/components/layout/ThemeToggle.tsx`
- `src/lib/theme/ThemeProvider.tsx`
- `src/components/ui/*` (Shadcn components via CLI)

**Files to Modify**:
- `src/App.tsx`: Wrap with `RouterProvider` and `ThemeProvider`
- `src/main.tsx`: No changes (entry point remains the same)
- `src/pages/*`: Add `export default` if missing (for lazy loading)

**Migration Steps**:
1. Install dependencies: `npm install react-router-dom`
2. Run Shadcn init: `npx shadcn-ui@latest init`
3. Install components: `npx shadcn-ui@latest add button card dialog sheet dropdown-menu navigation-menu tabs separator badge avatar tooltip skeleton`
4. Create router config with existing pages as routes
5. Build Navbar component (mobile + desktop variants)
6. Build ThemeProvider (replace existing `useTheme`)
7. Wrap App.tsx with providers
8. Test all routes render correctly
9. Test theme switching works
10. Test mobile hamburger menu works

**Validation**:
- All existing pages render without errors
- Navigation between pages works (click links → URL updates → page renders)
- Theme toggle works (light/dark/system)
- Mobile menu opens/closes correctly
- No console errors
- Unit tests pass (≥90% coverage for new components)

---

**Phase 2: High-Impact Component Wrapping (Week 2)**

**Goals**:
- Wrap 3-5 high-visibility components with Shadcn primitives
- Maintain existing component APIs (props, events)
- Improve visual consistency with Shadcn styling

**Components to Wrap** (priority order):
1. **AddFeedDialog**: Wrap with Shadcn `Dialog` → Better accessibility, animation, and theme integration
2. **FeedCard / FeedList**: Use Shadcn `Card` → Consistent card styling across light/dark themes
3. **Buttons throughout app**: Replace `<button>` with Shadcn `Button` → Consistent button styles, loading states, variants
4. **OfflineIndicator**: Use Shadcn `Badge` or `Alert` → Better visual prominence
5. **CategoryList**: Use Shadcn `Tabs` or `Accordion` → Better mobile interaction

**Migration Pattern for AddFeedDialog**:

**Before (custom modal)**:
```typescript
// src/components/AddFeedDialog/AddFeedDialog.tsx (old)
export function AddFeedDialog({ isOpen, onClose }: Props) {
  return isOpen ? (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Add Feed</h2>
        <form>...</form>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  ) : null;
}
```

**After (Shadcn Dialog wrapper)**:
```typescript
// src/components/AddFeedDialog/AddFeedDialog.tsx (new)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Button } from '@components/ui/button';

export function AddFeedDialog({ isOpen, onClose }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Feed</DialogTitle>
        </DialogHeader>
        <form>...</form> {/* Existing form logic unchanged */}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Key Points**:
- **Same props**: `isOpen`, `onClose` props unchanged → existing consumers don't break
- **Same logic**: Form validation, feed URL submission logic unchanged
- **New shell**: Shadcn Dialog provides backdrop, animation, focus trap, Escape key support
- **Better a11y**: Radix Dialog has ARIA labels, keyboard nav, screen reader support built-in

**Validation**:
- AddFeedDialog still opens when "+ Add Feed" button is clicked
- Form submission still works
- Dialog closes on Cancel, on backdrop click, and on Escape key
- Theme styles apply correctly (light/dark)
- Existing unit tests for AddFeedDialog still pass (or are updated to match new DOM structure)

---

**Phase 3: Future Enhancements (Post-Launch)**

**Goals**:
- Refactor remaining components as time permits
- No deadline pressure—this is continuous improvement

**Components to Refactor** (low priority):
- `LoadingSpinner` → Shadcn `Skeleton` (better loading UX)
- Settings form inputs → Shadcn `Input`, `Label`, `Select` (consistent form styling)
- `ErrorMessage` → Shadcn `Alert` (better error presentation)
- `CategorySidebar` → Shadcn `Accordion` or `Collapsible` (better mobile UX)

**Not Urgent**:
- ArticleView (content rendering is working fine; no need to touch)
- FeedList internals (feed parsing logic is separate from UI)

---

## Summary of Research Outputs

All decisions documented above will enable the following Phase 1 artifacts:

1. ✅ **data-model.md**: Entities (Route, Navigation Item, Theme Preference, Navigation State) are defined with attributes, relationships, and state transitions.

2. ✅ **contracts/routes.yaml**: Route definitions extracted from Decision 1 (React Router Data Router).

3. ✅ **contracts/navigation.ts**: Component interfaces extracted from Decision 4 (Mobile Navigation Pattern).

4. ✅ **quickstart.md**: Installation steps extracted from Decisions 2 (Shadcn UI) and 3 (Theme System).

5. ✅ **Migration strategy**: Phase 1/2/3 breakdown from Decision 6 ensures safe, incremental rollout.

6. ✅ **Testing strategy**: Phase 0 research (Decision 5) defines Vitest + Playwright approach to achieve ≥90% coverage.

---

## Constitution Re-Check

All research decisions align with the RSS Reader Constitution:

- **Principle I (PWA Architecture)**: React Router Data Router supports offline loaders; theme system integrates with PWA manifest `theme_color`.
- **Principle II (Test-First)**: Vitest TDD workflow ensures tests are written before implementation; ≥90% coverage target exceeds constitution's 80% minimum.
- **Principle III (Responsive Design)**: Mobile-first navigation (hamburger menu on mobile, horizontal nav on desktop) tested at 375px, 768px, 1024px breakpoints.
- **Principle IV (Modern Tech)**: React Router v6 and Shadcn UI are latest stable versions; TypeScript 5.7.2 strict mode; no deprecated dependencies.
- **Principle V (Observability)**: Existing `@lib/logger` will instrument route changes and theme switches; structured logging maintained.

**Research Phase**: ✅ **COMPLETE**

---

**Next Phase**: Phase 1 (Design & Contracts) - Generate data-model.md, contracts/, and quickstart.md based on research decisions documented above.

**Document Version**: 1.0.0  
**Author**: Research Workflow  
**Last Updated**: 2026-02-05
