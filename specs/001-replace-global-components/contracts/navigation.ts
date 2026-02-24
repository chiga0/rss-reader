/**
 * Navigation Component API Contract
 * ============================================================================
 * Defines TypeScript interfaces for Navbar, MobileNav, DesktopNav, and
 * ThemeToggle components after Shadcn UI integration.
 * 
 * Version: 1.0.0
 * Last Updated: 2026-02-05
 * ============================================================================
 */

import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Core Navigation Types
// ============================================================================

/**
 * Navigation Item
 * 
 * Represents a single item in the navigation menu.
 * Used by both mobile and desktop navigation components.
 * 
 * @example
 * ```typescript
 * const feedsNavItem: NavigationItem = {
 *   id: 'nav-feeds',
 *   label: 'Feeds',
 *   path: '/feeds',
 *   icon: Rss, // from lucide-react
 *   badge: 5, // 5 unread items
 *   group: 'main',
 * };
 * ```
 */
export interface NavigationItem {
  /**
   * Unique identifier for the navigation item
   * Should be prefixed with 'nav-' for consistency
   */
  id: string;

  /**
   * Display text for the navigation item
   * Should be 3-20 characters for mobile display constraints
   * Will be used for ARIA labels and tooltips
   */
  label: string;

  /**
   * Route path (matches React Router route definition)
   * Must correspond to an existing route in routes.yaml
   * 
   * @example "/feeds", "/favorites", "/settings"
   */
  path: string;

  /**
   * Lucide React icon component
   * Icon will be displayed before the label on desktop
   * Icon-only display on mobile in some layouts
   * 
   * @example Rss, Star, Clock, Settings (from lucide-react)
   */
  icon: LucideIcon;

  /**
   * Optional numeric badge (e.g., unread count)
   * - If undefined, no badge is displayed
   * - If 0, no badge is displayed (don't show "0")
   * - If > 999, display as "999+" to prevent overflow
   * 
   * Badge is positioned on the top-right of the icon
   */
  badge?: number;

  /**
   * Visual grouping in navigation menu
   * - 'main': Primary app sections (Feeds, Favorites, History)
   * - 'user': User-related sections (Settings, Profile)
   * 
   * Groups may be visually separated (e.g., with Separator component)
   */
  group?: 'main' | 'user';
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

/**
 * Navbar Props
 * 
 * Props for the main Navbar component (src/components/layout/Navbar.tsx)
 * Navbar is responsive: shows MobileNav on mobile, DesktopNav on desktop
 * 
 * @example
 * ```tsx
 * <Navbar
 *   items={navigationItems}
 *   currentPath={location.pathname}
 *   onNavigate={(path) => navigate(path)}
 *   actions={<Button>Add Feed</Button>}
 * />
 * ```
 */
export interface NavbarProps {
  /**
   * Array of navigation items to display
   * Items will be filtered based on viewport:
   * - Mobile (< 768px): Shown in Sheet (hamburger menu)
   * - Desktop (≥ 768px): Shown inline in horizontal navigation
   * 
   * Items should be sorted by `group` and then by display order
   */
  items: NavigationItem[];

  /**
   * Current active route path (from React Router's useLocation())
   * Used to highlight the active navigation item
   * Should match one of the items' `path` properties
   * 
   * @example "/feeds", "/favorites", "/settings"
   */
  currentPath: string;

  /**
   * Callback when navigation item is clicked
   * Should integrate with React Router's navigate() function
   * 
   * Implementation should:
   * 1. Call navigate(path)
   * 2. Close mobile drawer (if open)
   * 3. Log navigation event
   * 
   * @param path - The route path to navigate to
   */
  onNavigate: (path: string) => void;

  /**
   * Optional user profile section
   * Typically includes:
   * - Avatar (Shadcn Avatar component)
   * - User name or email
   * - Dropdown menu with logout, profile settings
   * 
   * Displayed in:
   * - Desktop: Top-right corner next to theme toggle
   * - Mobile: Sheet footer (bottom of drawer)
   * 
   * @example
   * ```tsx
   * <DropdownMenu>
   *   <DropdownMenuTrigger asChild>
   *     <Avatar>
   *       <AvatarImage src="/avatar.jpg" />
   *       <AvatarFallback>JD</AvatarFallback>
   *     </Avatar>
   *   </DropdownMenuTrigger>
   *   <DropdownMenuContent>
   *     <DropdownMenuItem>Profile</DropdownMenuItem>
   *     <DropdownMenuItem>Logout</DropdownMenuItem>
   *   </DropdownMenuContent>
   * </DropdownMenu>
   * ```
   */
  userSection?: React.ReactNode;

  /**
   * Optional additional actions
   * Examples: "Add Feed" button, search icon, refresh button
   * 
   * Displayed in:
   * - Desktop: Next to theme toggle in header
   * - Mobile: Sheet header (top of drawer)
   * 
   * Should use Shadcn Button component with appropriate variant
   * 
   * @example
   * ```tsx
   * <Button variant="outline" onClick={handleAddFeed}>
   *   <Plus className="h-4 w-4 mr-2" />
   *   Add Feed
   * </Button>
   * ```
   */
  actions?: React.ReactNode;
}

/**
 * MobileNav Props
 * 
 * Props for the MobileNav component (src/components/layout/MobileNav.tsx)
 * Renders as a Shadcn Sheet (drawer) that slides in from the left
 * 
 * @example
 * ```tsx
 * <MobileNav
 *   items={navigationItems}
 *   isOpen={isMobileNavOpen}
 *   onClose={() => setIsMobileNavOpen(false)}
 *   onNavigate={(path) => { navigate(path); setIsMobileNavOpen(false); }}
 *   currentPath={location.pathname}
 *   footer={<AppVersion />}
 * />
 * ```
 */
export interface MobileNavProps {
  /**
   * Navigation items (same as Navbar)
   * Displayed as a vertical list in the Sheet
   */
  items: NavigationItem[];

  /**
   * Whether mobile drawer (Sheet) is open
   * Controlled by parent component (AppLayout or Navbar)
   * 
   * When true, Sheet slides in from left with backdrop
   * When false, Sheet slides out and unmounts
   */
  isOpen: boolean;

  /**
   * Callback to close the drawer
   * Should set isOpen state to false
   * 
   * Called when:
   * - User clicks backdrop
   * - User presses Escape key
   * - User clicks close icon (X) in sheet
   * 
   * Shadcn Sheet handles these events via onOpenChange prop
   */
  onClose: () => void;

  /**
   * Same navigation callback as Navbar
   * Should:
   * 1. Call navigate(path)
   * 2. Call onClose() to dismiss drawer
   * 3. Log navigation event
   */
  onNavigate: (path: string) => void;

  /**
   * Current active route path
   * Used to highlight active item in the drawer
   */
  currentPath: string;

  /**
   * Optional footer content
   * Displayed at the bottom of the Sheet
   * 
   * Typical use cases:
   * - User profile (avatar + name)
   * - App version number
   * - Social links
   * 
   * @example
   * ```tsx
   * <div className="text-sm text-muted-foreground">
   *   Version 1.0.0
   * </div>
   * ```
   */
  footer?: React.ReactNode;
}

/**
 * DesktopNav Props
 * 
 * Props for the DesktopNav component (src/components/layout/DesktopNav.tsx)
 * Renders as a horizontal Shadcn NavigationMenu (≥ 768px viewport)
 * 
 * @example
 * ```tsx
 * <DesktopNav
 *   items={navigationItems}
 *   currentPath={location.pathname}
 *   onNavigate={(path) => navigate(path)}
 * />
 * ```
 */
export interface DesktopNavProps {
  /**
   * Navigation items (same as Navbar)
   * Displayed as horizontal list with icon + label
   */
  items: NavigationItem[];

  /**
   * Same navigation callback as Navbar
   * Should call navigate(path) and log event
   */
  onNavigate: (path: string) => void;

  /**
   * Current active route path
   * Used to highlight active item with background color
   */
  currentPath: string;
}

/**
 * ThemeToggle Props
 * 
 * Props for the ThemeToggle component (src/components/layout/ThemeToggle.tsx)
 * Renders as a Shadcn Button + DropdownMenu with theme options
 * 
 * @example
 * ```tsx
 * <ThemeToggle
 *   mode={theme.mode}
 *   onToggle={(mode) => setTheme(mode)}
 *   showLabel={false}
 * />
 * ```
 */
export interface ThemeToggleProps {
  /**
   * Current theme mode (from ThemeProvider context)
   * - 'light': Explicit light theme
   * - 'dark': Explicit dark theme
   * - 'system': Follow system preference (auto-detect)
   */
  mode: 'light' | 'dark' | 'system';

  /**
   * Callback when theme is toggled
   * Should:
   * 1. Update theme context state
   * 2. Update CSS variables and <html> class
   * 3. Persist to localStorage
   * 4. Update PWA manifest theme_color
   * 
   * @param mode - The new theme mode to apply
   */
  onToggle: (mode: 'light' | 'dark' | 'system') => void;

  /**
   * Optional: Display theme label next to icon on desktop
   * - true: Show "Light", "Dark", or "System" text
   * - false: Icon only (default)
   * 
   * Mobile always shows icon only (space constraints)
   */
  showLabel?: boolean;
}

// ============================================================================
// Component Function Signatures
// ============================================================================

/**
 * Expected component exports
 * 
 * All components should be default exports from their respective files
 * and should implement the interfaces defined above.
 * 
 * File structure:
 * - src/components/layout/Navbar.tsx → export function Navbar(props: NavbarProps): JSX.Element
 * - src/components/layout/MobileNav.tsx → export function MobileNav(props: MobileNavProps): JSX.Element
 * - src/components/layout/DesktopNav.tsx → export function DesktopNav(props: DesktopNavProps): JSX.Element
 * - src/components/layout/ThemeToggle.tsx → export function ThemeToggle(props: ThemeToggleProps): JSX.Element
 * 
 * Usage in AppLayout:
 * ```tsx
 * import { Navbar } from '@components/layout/Navbar';
 * import { useLocation, useNavigate } from 'react-router-dom';
 * import { useTheme } from '@lib/theme/ThemeProvider';
 * 
 * function AppLayout() {
 *   const location = useLocation();
 *   const navigate = useNavigate();
 *   const { mode, setTheme } = useTheme();
 * 
 *   return (
 *     <div>
 *       <Navbar
 *         items={navigationItems}
 *         currentPath={location.pathname}
 *         onNavigate={navigate}
 *       />
 *       <main>
 *         <Outlet /> {/* React Router outlet */}
 *       </main>
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================================================
// Navigation Item Configuration
// ============================================================================

/**
 * Default Navigation Items
 * 
 * Suggested initial configuration for navigation items.
 * Can be extended or modified based on app requirements.
 * 
 * Badge values should be computed dynamically from Zustand store:
 * 
 * @example
 * ```typescript
 * import { Rss, Star, Clock, Settings } from 'lucide-react';
 * import { useStore } from '@hooks/useStore';
 * 
 * export function useNavigationItems(): NavigationItem[] {
 *   const unreadCount = useStore(state => state.unreadCount);
 * 
 *   return [
 *     {
 *       id: 'nav-feeds',
 *       label: 'Feeds',
 *       path: '/feeds',
 *       icon: Rss,
 *       badge: unreadCount,
 *       group: 'main',
 *     },
 *     {
 *       id: 'nav-favorites',
 *       label: 'Favorites',
 *       path: '/favorites',
 *       icon: Star,
 *       group: 'main',
 *     },
 *     {
 *       id: 'nav-history',
 *       label: 'History',
 *       path: '/history',
 *       icon: Clock,
 *       group: 'main',
 *     },
 *     {
 *       id: 'nav-settings',
 *       label: 'Settings',
 *       path: '/settings',
 *       icon: Settings,
 *       group: 'user',
 *     },
 *   ];
 * }
 * ```
 */

// ============================================================================
// Responsive Behavior
// ============================================================================

/**
 * Responsive Breakpoints
 * 
 * Navigation components should respond to these viewport widths:
 * 
 * - **Mobile (< 768px)**:
 *   - Show hamburger menu icon (Menu from lucide-react)
 *   - Navbar renders MobileNav (Sheet drawer)
 *   - DesktopNav is hidden (display: none)
 *   - ThemeToggle shown in header (icon only)
 * 
 * - **Tablet/Desktop (≥ 768px)**:
 *   - Hide hamburger menu icon
 *   - Navbar renders DesktopNav (horizontal NavigationMenu)
 *   - MobileNav is hidden (display: none)
 *   - ThemeToggle shown in header (icon + optional label)
 * 
 * Use Tailwind breakpoints for responsive visibility:
 * ```tsx
 * <button className="md:hidden">Hamburger</button> // Mobile only
 * <nav className="hidden md:flex">Desktop Nav</nav> // Desktop only
 * ```
 * 
 * Or use JavaScript media query hook:
 * ```typescript
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * return isMobile ? <MobileNav {...props} /> : <DesktopNav {...props} />;
 * ```
 */

// ============================================================================
// Accessibility Requirements
// ============================================================================

/**
 * Accessibility Checklist
 * 
 * All navigation components MUST meet these accessibility standards:
 * 
 * **Keyboard Navigation**:
 * - Tab: Move focus between navigation items
 * - Enter/Space: Activate focused navigation item
 * - Escape: Close mobile drawer (MobileNav)
 * - Arrow keys: Navigate within DropdownMenu (ThemeToggle)
 * 
 * **ARIA Labels**:
 * - Navbar: <header role="banner">
 * - MobileNav Sheet: aria-label="Mobile navigation menu"
 * - DesktopNav: <nav role="navigation" aria-label="Main navigation">
 * - ThemeToggle: aria-label="Toggle theme" on button
 * - Hamburger button: aria-label="Open menu" / "Close menu"
 * 
 * **Focus Management**:
 * - When MobileNav opens, focus moves to first navigation item
 * - When MobileNav closes, focus returns to hamburger button
 * - Active navigation item has visible focus ring (Tailwind: focus:ring-2)
 * 
 * **Screen Reader Announcements**:
 * - Route changes announced via <title> updates
 * - Badge counts announced (e.g., "Feeds, 5 unread items")
 * - Theme toggle states announced (e.g., "Theme set to dark")
 * 
 * **Color Contrast**:
 * - Active navigation item: ≥ 4.5:1 contrast ratio (WCAG AA)
 * - Badge text: ≥ 4.5:1 contrast ratio
 * - Focus indicators: ≥ 3:1 contrast ratio
 * 
 * Shadcn components have built-in accessibility via Radix UI primitives.
 * Additional ARIA labels may be needed for custom wrappers.
 */

// ============================================================================
// Testing Utilities
// ============================================================================

/**
 * Mock Props for Testing
 * 
 * Example mock props for unit tests with React Testing Library
 * 
 * @example
 * ```typescript
 * import { render, screen } from '@testing-library/react';
 * import { Navbar } from './Navbar';
 * import { Rss, Star, Settings } from 'lucide-react';
 * 
 * const mockNavigationItems: NavigationItem[] = [
 *   { id: 'nav-feeds', label: 'Feeds', path: '/feeds', icon: Rss },
 *   { id: 'nav-favorites', label: 'Favorites', path: '/favorites', icon: Star, badge: 3 },
 *   { id: 'nav-settings', label: 'Settings', path: '/settings', icon: Settings, group: 'user' },
 * ];
 * 
 * const mockOnNavigate = vi.fn();
 * 
 * test('renders navigation items', () => {
 *   render(
 *     <Navbar
 *       items={mockNavigationItems}
 *       currentPath="/feeds"
 *       onNavigate={mockOnNavigate}
 *     />
 *   );
 *   
 *   expect(screen.getByRole('banner')).toBeInTheDocument();
 *   expect(screen.getByRole('link', { name: /feeds/i })).toBeInTheDocument();
 *   expect(screen.getByText('3')).toBeInTheDocument(); // Badge
 * });
 * 
 * test('calls onNavigate when item clicked', async () => {
 *   const user = userEvent.setup();
 *   render(<Navbar items={mockNavigationItems} currentPath="/feeds" onNavigate={mockOnNavigate} />);
 *   
 *   await user.click(screen.getByRole('link', { name: /favorites/i }));
 *   expect(mockOnNavigate).toHaveBeenCalledWith('/favorites');
 * });
 * ```
 */

// ============================================================================
// Integration with React Router
// ============================================================================

/**
 * React Router Integration Pattern
 * 
 * Navigation components should integrate with React Router hooks:
 * 
 * @example
 * ```tsx
 * import { useLocation, useNavigate } from 'react-router-dom';
 * import { Navbar } from '@components/layout/Navbar';
 * import { navigationItems } from '@lib/router/navigationItems';
 * 
 * function AppLayout() {
 *   const location = useLocation();
 *   const navigate = useNavigate();
 * 
 *   const handleNavigate = (path: string) => {
 *     navigate(path);
 *     logger.info('Navigation', { from: location.pathname, to: path });
 *   };
 * 
 *   return (
 *     <div>
 *       <Navbar
 *         items={navigationItems}
 *         currentPath={location.pathname}
 *         onNavigate={handleNavigate}
 *       />
 *       <main>
 *         <Outlet /> {/* React Router outlet for nested routes */}
 *       </main>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Navigation items can use React Router's <Link> component internally:
 * ```tsx
 * import { Link } from 'react-router-dom';
 * 
 * {items.map(item => (
 *   <Link
 *     key={item.id}
 *     to={item.path}
 *     onClick={() => onNavigate(item.path)}
 *     className={currentPath === item.path ? 'active' : ''}
 *   >
 *     <item.icon />
 *     {item.label}
 *     {item.badge && <Badge>{item.badge}</Badge>}
 *   </Link>
 * ))}
 * ```
 */

// ============================================================================
// Performance Considerations
// ============================================================================

/**
 * Performance Optimization Guidelines
 * 
 * 1. **Memoization**:
 *    - Memoize navigation items array to prevent re-renders
 *    - Use React.memo() for MobileNav and DesktopNav components
 *    - Example:
 *      ```tsx
 *      const memoizedItems = useMemo(() => navigationItems, [navigationItems]);
 *      ```
 * 
 * 2. **Lazy Loading**:
 *    - Shadcn Sheet (MobileNav) should only render when isOpen={true}
 *    - Don't mount Sheet content until drawer is opened
 *    - Example:
 *      ```tsx
 *      {isOpen && <MobileNav {...props} />}
 *      ```
 * 
 * 3. **Debouncing**:
 *    - Debounce theme toggle to prevent rapid localStorage writes
 *    - Example:
 *      ```tsx
 *      const debouncedToggle = useDebouncedCallback(setTheme, 300);
 *      ```
 * 
 * 4. **Badge Updates**:
 *    - Badge counts should update via Zustand selectors (not full store re-render)
 *    - Example:
 *      ```tsx
 *      const unreadCount = useStore(state => state.unreadCount); // Selective subscription
 *      ```
 * 
 * 5. **Animation Performance**:
 *    - Use CSS transforms for Sheet slide-in animation (GPU-accelerated)
 *    - Shadcn Sheet uses Framer Motion with optimized animations
 *    - Avoid animating width/height (causes layout reflow)
 */

// ============================================================================
// Notes
// ============================================================================

/**
 * Implementation Notes:
 * 
 * - All interfaces in this file are contracts for implementation
 * - Component implementations should be in src/components/layout/
 * - Type definitions should be exported from src/types/navigation.ts
 * - Navigation items configuration should be in src/lib/router/navigationItems.ts
 * - Theme provider context should be in src/lib/theme/ThemeProvider.tsx
 * 
 * Dependencies:
 * - React Router v6 (useLocation, useNavigate, Link)
 * - Lucide React (icon components)
 * - Shadcn UI (Sheet, NavigationMenu, Button, DropdownMenu, Badge)
 * - Zustand (for unread count and app state)
 * 
 * Browser Support:
 * - Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
 * - iOS Safari 14+ (PWA support)
 * - Android Chrome 90+ (PWA support)
 * 
 * No IE11 support (React 18 dropped support)
 */
