# RSS Reader — Product Iteration Plan

> **Status**: Draft — v1.0.0 is live. This document defines the roadmap for subsequent releases.  
> **Tracking**: Each feature below corresponds to a GitHub Issue. Labels follow the pattern `iter/v1.x`.  
> **Competitive analysis**: See [Medium Comparison Report](docs/medium-comparison-report.md) for the detailed feature gap analysis that informed this roadmap.

---

## Current State (v1.0.0)

| Area | Status |
|------|--------|
| RSS 2.0 / Atom 1.0 parsing | ✅ |
| Offline-first (IndexedDB + Service Worker) | ✅ |
| Auto-refresh & background sync | ✅ |
| Category management | ✅ |
| OPML import / export | ✅ |
| Dark / light / system theme | ✅ |
| Favorites & reading history | ✅ |
| Full-text search (feeds + articles) | ✅ |
| AI translation & summarisation (streaming) | ✅ |
| PWA install (iOS, Android, Desktop) | ✅ |
| React Router v6 navigation | ✅ |
| i18n (Chinese + English) | ✅ |

---

## Iteration v1.1 — Reader Experience (Priority: High)

**Goal**: Make every article faster and more comfortable to read.  
**Target release**: 2 weeks after kickoff

### Issues

#### #1 · Reading time estimate
**Label**: `iter/v1.1`, `enhancement`  
**Description**: Show an estimated reading time (e.g. "5 min read") in the article detail header so users can decide whether to read now or save for later.  
**Acceptance criteria**:
- Appears in `ArticleDetailPage` alongside author and date
- Calculated client-side from word count (≥ 1 min)
- No impact on article loading performance
- Unit tested

---

#### #2 · Keyboard shortcuts
**Label**: `iter/v1.1`, `enhancement`  
**Description**: Add keyboard shortcuts to speed up navigation for power users.  
**Shortcuts to implement**:

| Key | Action |
|-----|--------|
| `j` / `k` | Next / previous article in list |
| `o` or `Enter` | Open selected article |
| `f` | Toggle favourite on open article |
| `r` | Mark article as read / unread |
| `Escape` | Go back |
| `?` | Show shortcuts help overlay |

**Acceptance criteria**:
- Shortcuts only active when focus is not inside an input
- Help overlay accessible via `?` key
- No conflicts with browser shortcuts
- E2E tested

---

#### #3 · Advanced article search with filters
**Label**: `iter/v1.1`, `enhancement`  
**Description**: Extend the current full-text search with filter controls so users can narrow results without manual scrolling.  
**Filters**:
- Feed (multi-select)
- Date range (today / last 7 days / last 30 days / custom)
- Read status (all / unread / read)
- Starred only toggle

**Acceptance criteria**:
- Filter bar visible on `SearchPage`
- URL query params reflect active filters (shareable / bookmarkable)
- "Clear filters" button resets to defaults
- Integration tested

---

#### #3.1 · Reading progress bar *(new — from Medium comparison)*
**Label**: `iter/v1.1`, `enhancement`  
**Description**: Display a thin progress bar at the top of the article detail page that fills as the user scrolls through the article, matching Medium's signature reading progress indicator.  
**Acceptance criteria**:
- Fixed 3px bar at top of `ArticleDetailPage`
- Smoothly fills from 0% to 100% based on scroll position
- Colour adapts to current theme (green in light mode, blue in dark mode)
- Uses `requestAnimationFrame` + passive scroll listener for performance
- Stays at 100% when article is fully scrolled
- Unit tested

---

#### #3.2 · Typography & readability upgrade *(new — from Medium comparison)*
**Label**: `iter/v1.1`, `enhancement`  
**Description**: Refine article body typography to match Medium-level reading comfort: optimal line width (42rem), improved line-height for CJK content, larger base font size, and better heading hierarchy.  
**Acceptance criteria**:
- Article body max-width reduced from 48rem to 42rem
- Base font size: 18px desktop / 16px mobile
- Line-height: 1.7 for CJK, 1.58 for Latin scripts
- Heading sizes and spacing visually improved
- No breaking changes to existing article rendering
- Visual regression tested

---

#### #3.3 · Code syntax highlighting *(new — from Medium comparison)*
**Label**: `iter/v1.1`, `enhancement`  
**Description**: Add syntax highlighting for code blocks inside articles using a lightweight library (e.g. highlight.js). Includes a copy-to-clipboard button on each code block.  
**Acceptance criteria**:
- Code blocks in article HTML are auto-highlighted
- Language auto-detected where possible
- "Copy" button appears on hover/focus for each code block
- Theme-aware (light/dark highlighting styles)
- Bundle size increase ≤ 30 KB gzipped
- Unit tested

---

#### #3.4 · Image lightbox *(new — from Medium comparison)*
**Label**: `iter/v1.1`, `enhancement`  
**Description**: Allow users to click on images inside articles to view them in a full-screen lightbox overlay. Supports pinch-to-zoom on mobile.  
**Acceptance criteria**:
- Clicking any `<img>` in article body opens a full-screen overlay
- Overlay supports swipe between images in the same article
- Close via ESC key, backdrop click, or close button
- Pinch-to-zoom on touch devices
- Minimal bundle impact (use `medium-zoom` or equivalent, ~4 KB)
- Unit tested

---

#### #3.5 · Enhanced article cards *(new — from Medium comparison)*
**Label**: `iter/v1.1`, `enhancement`  
**Description**: Enrich article list cards with more metadata: thumbnail image, estimated reading time, 2-line summary preview, and visual unread/favourite indicators.  
**Acceptance criteria**:
- Thumbnail image shown when available (lazy-loaded)
- Reading time estimate displayed (clock icon + "X min")
- Summary preview truncated to 2 lines
- Unread articles: bold title + left blue accent bar
- Favourited articles: heart badge on card corner
- Hover: subtle lift + shadow animation
- Responsive across mobile, tablet, desktop breakpoints
- Unit tested

---

## Iteration v1.2 — Content Enrichment (Priority: Medium)

**Goal**: Let users annotate, discover, and share content they find valuable.  
**Target release**: 4 weeks after v1.1

### Issues

#### #4 · Article annotations & highlights
**Label**: `iter/v1.2`, `enhancement`  
**Description**: Allow users to highlight passages in articles and attach personal notes. Annotations are stored locally (IndexedDB) and survive offline sessions.  
**Acceptance criteria**:
- Text selection in article body shows "Highlight" action
- Notes can be typed per highlight
- Highlights visible with yellow tint on revisit
- All annotations listed on a dedicated Annotations page
- Annotated article count shown on feed card
- Exported in OPML extension or dedicated JSON backup

---

#### #5 · Feed discovery
**Label**: `iter/v1.2`, `enhancement`  
**Description**: When a user subscribes to a feed (or visits its detail page), suggest similar feeds from a curated list or by parsing the source site's `<link rel="alternate">` tags.  
**Acceptance criteria**:
- "Suggested feeds" section appears on `FeedDetailPage`
- Suggestions derived from site HTML autodiscovery first, then a static seed list
- Each suggestion can be subscribed in one tap
- No telemetry or external tracking

---

#### #6 · Social sharing
**Label**: `iter/v1.2`, `enhancement`  
**Description**: Add a share action to articles so users can send links via native OS share sheet or copy to clipboard.  
**Acceptance criteria**:
- Share button in `ArticleActionBar`
- Uses Web Share API when available, falls back to clipboard copy
- Shared URL points to the original article, not the app
- Works on iOS Safari, Android Chrome, and desktop

---

#### #6.1 · Recommended feed sources & onboarding *(new — from Medium comparison)*
**Label**: `iter/v1.2`, `enhancement`  
**Description**: Provide a curated list of popular RSS feeds organised by category (Tech, Design, Business, Lifestyle, etc.) and show an onboarding flow for first-time users so they can subscribe to feeds without manually finding URLs.  
**Acceptance criteria**:
- JSON config file with 6–8 categories, each containing 3–5 curated feeds
- First-time user sees a step-by-step guide: Welcome → Pick categories → One-click subscribe → Enter main app
- Onboarding can be skipped
- `onboardingComplete` flag stored in localStorage to prevent re-display
- Recommended feeds section also accessible from Settings for returning users
- No external API calls required
- Unit tested

---

#### #6.2 · Article table of contents (TOC) *(new — from Medium comparison)*
**Label**: `iter/v1.2`, `enhancement`  
**Description**: Auto-generate a floating table of contents from article headings (h1–h3). Desktop: fixed right sidebar. Mobile: floating button that opens a drawer. Current heading highlighted based on scroll position.  
**Acceptance criteria**:
- TOC only appears when article has ≥ 3 headings
- Click TOC item → smooth scroll to heading
- Current section highlighted via IntersectionObserver
- Desktop: right-side sticky panel, does not overlap article body
- Mobile: floating button → bottom drawer
- Long headings truncated with ellipsis
- Unit tested

---

#### #6.3 · Batch mark-as-read *(new — from Medium comparison)*
**Label**: `iter/v1.2`, `enhancement`  
**Description**: Allow users to mark all articles as read at the feed or category level, and support multi-select mode for batch operations (mark read, favourite, delete).  
**Acceptance criteria**:
- "Mark all as read" button on feed detail and category views
- Long-press (mobile) or checkbox (desktop) enters multi-select mode
- Batch actions: mark read, favourite, remove
- Confirmation dialog before destructive batch actions
- Unit tested

---

#### #6.4 · Pull-to-refresh on mobile *(new — from Medium comparison)*
**Label**: `iter/v1.2`, `enhancement`  
**Description**: Implement native-feeling pull-to-refresh gesture on article list pages for mobile users, replacing the need to tap the refresh button.  
**Acceptance criteria**:
- Pull down ≥ 60px at the top of the feed list triggers refresh
- Animated spinner during refresh
- Only active when scrolled to top
- Works on iOS Safari and Android Chrome
- Does not interfere with normal scrolling
- Unit tested

---

## Iteration v1.3 — Platform Expansion (Priority: Medium)

**Goal**: Reach users on more surfaces and make the product stickier across devices.  
**Target release**: 6 weeks after v1.2

### Issues

#### #7 · Browser extension (Chrome & Firefox)
**Label**: `iter/v1.3`, `enhancement`  
**Description**: A lightweight browser extension that detects RSS/Atom feeds on the current page and lets users subscribe in one click, without having to copy-paste the URL.  
**Acceptance criteria**:
- Extension icon turns active when a feed is detected on the page
- One-click subscribe opens the app's `AddFeedDialog` (or posts directly to IndexedDB if app is open)
- Manifest V3 (Chrome) + WebExtensions API (Firefox)
- No permissions beyond `activeTab` and `storage`

---

#### #8 · Multi-device sync
**Label**: `iter/v1.3`, `enhancement`, `backend`  
**Description**: Sync read status, favourites, categories, and OPML subscriptions across devices using a lightweight backend (self-hostable).  
**Acceptance criteria**:
- Optional: users can opt in; all data remains local-only by default
- Sync via user-provided server URL + API key (no centralised account required)
- Conflict resolution: last-write-wins with per-field timestamps
- Full offline capability preserved; sync happens in background
- OpenAPI spec published for self-hosters

---

#### #8.1 · Immersive reading mode *(new — from Medium comparison)*
**Label**: `iter/v1.3`, `enhancement`  
**Description**: Provide a distraction-free reading mode that hides navigation, sidebars, and action bars, leaving only the article body and a floating back button. Triggered by a dedicated button or auto-hide on scroll-down.  
**Acceptance criteria**:
- Hides: top navbar, sidebar, bottom action bar
- Shows: article body only + floating "exit" button
- Toggle via dedicated button in article toolbar
- Auto-hide UI on scroll down, show on scroll up
- ESC key exits immersive mode
- Keyboard shortcut (`F11` or `z`) to toggle
- Unit tested

---

#### #8.2 · Font & reading preferences *(new — from Medium comparison)*
**Label**: `iter/v1.3`, `enhancement`  
**Description**: Allow users to customise article typography: font family (serif / sans-serif / system), font size (4 presets), and line spacing (3 presets). Persisted in localStorage and applied globally.  
**Acceptance criteria**:
- Settings section: "Reading Preferences"
- Font size: Small (14px) / Medium (16px) / Large (18px) / Extra Large (20px)
- Font family: System Default / Serif / Sans-Serif
- Line spacing: Compact / Normal / Relaxed
- Stored in localStorage, applied to all article views
- Preview in settings page
- Unit tested

---

#### #8.3 · Multiple reading lists *(new — from Medium comparison)*
**Label**: `iter/v1.3`, `enhancement`  
**Description**: Allow users to create named reading lists (e.g. "Read Later", "Tech Articles", "Weekend Reads") beyond the single favourites collection. Articles can be saved to one or more lists.  
**Acceptance criteria**:
- Create / rename / delete reading lists
- Save article to a specific list (or multiple lists)
- Default list = existing Favourites (backwards compatible)
- Dedicated page to browse all lists and their articles
- Drag-to-reorder lists
- Data stored in IndexedDB
- Unit tested

---

## Iteration v2.0 — New Content Formats (Priority: Low)

**Goal**: Expand beyond text articles to audio and email content.  
**Target release**: After v1.3 stabilisation

### Issues

#### #9 · Podcast support
**Label**: `iter/v2.0`, `enhancement`  
**Description**: Parse `<enclosure>` tags in RSS feeds to detect podcast episodes. Provide an in-app audio player with playback speed control and a persistent mini-player.  
**Acceptance criteria**:
- Podcast feeds auto-detected when `<enclosure type="audio/*">` is present
- Audio player: play/pause, seek, 1×/1.5×/2× speed, skip ±30s
- Mini-player persists while browsing other articles
- Playback position saved per-episode (resumes on reopen)
- Background audio playback (Media Session API)

---

#### #10 · Newsletter integration
**Label**: `iter/v2.0`, `enhancement`  
**Description**: Generate a unique inbound email address that converts newsletter emails into RSS-style articles inside the app (using a lightweight forwarding service or self-hosted Cloudflare Worker).  
**Acceptance criteria**:
- User can generate a `@reader.example.com` address in Settings
- Incoming emails appear as articles in a special "Newsletters" feed
- Images and inline HTML preserved
- Unsubscribe from newsletter removes the forwarding address

---

## Tech Debt & Quality Issues

Track these as separate issues with label `tech-debt`:

| # | Item |
|---|------|
| TD-1 | Complete Shadcn UI migration (Phase 3–6 of current plan) |
| TD-2 | Raise page/layout component test coverage to ≥ 90 % |
| TD-3 | Add E2E tests for mobile & desktop navigation |
| TD-4 | Implement error boundaries to prevent full-page crashes |
| TD-5 | Add skeleton loading states for all data-fetching pages |
| TD-6 | Lighthouse audit after each iteration (target: all 100) |

---

## Prioritisation Matrix

| Issue | User Value | Dev Effort | Priority Score |
|-------|-----------|------------|---------------|
| #1 Reading time | Medium | Low | **High** |
| #2 Keyboard shortcuts | High | Low | **High** |
| #3 Advanced search | High | Medium | **High** |
| #3.1 Reading progress bar | High | Very Low | **High** |
| #3.2 Typography upgrade | High | Low | **High** |
| #3.3 Code syntax highlighting | Medium | Low | **High** |
| #3.4 Image lightbox | Medium | Very Low | **High** |
| #3.5 Enhanced article cards | High | Low | **High** |
| #4 Annotations | High | High | Medium |
| #5 Feed discovery | Medium | Medium | Medium |
| #6 Social sharing | Medium | Low | **High** |
| #6.1 Recommended feeds & onboarding | Very High | Medium | **High** |
| #6.2 Article TOC | High | Medium | **High** |
| #6.3 Batch mark-as-read | High | Low | **High** |
| #6.4 Pull-to-refresh | Medium | Low | Medium |
| #7 Browser extension | High | High | Medium |
| #8 Multi-device sync | Very High | Very High | Low (needs backend) |
| #8.1 Immersive reading mode | Medium | Low | Medium |
| #8.2 Font & reading preferences | Medium | Low | Medium |
| #8.3 Multiple reading lists | Medium | Medium | Medium |
| #9 Podcast | High | High | Low |
| #10 Newsletter | Medium | Very High | Low |

---

## How to Use This Document

1. **Product manager / repo owner**: Convert each issue section above into a GitHub Issue. Use the issue title, labels, and acceptance criteria verbatim.
2. **Developers**: Reference the acceptance criteria as the definition of done before opening a PR.
3. **Project board**: Create a GitHub Project with columns `Backlog → In Progress → Review → Done` and assign each issue to the appropriate iteration milestone.
4. **Competitive analysis**: See [docs/medium-comparison-report.md](docs/medium-comparison-report.md) for the full feature gap analysis and rationale behind the new items marked *(from Medium comparison)*.

---

*Last updated: 2026-03-04 · Maintainer: @chiga0*
