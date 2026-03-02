# RSS Reader — Product Iteration Plan

> **Status**: Draft — v1.0.0 is live. This document defines the roadmap for subsequent releases.  
> **Tracking**: Each feature below corresponds to a GitHub Issue. Labels follow the pattern `iter/v1.x`.

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
| #4 Annotations | High | High | Medium |
| #5 Feed discovery | Medium | Medium | Medium |
| #6 Social sharing | Medium | Low | **High** |
| #7 Browser extension | High | High | Medium |
| #8 Multi-device sync | Very High | Very High | Low (needs backend) |
| #9 Podcast | High | High | Low |
| #10 Newsletter | Medium | Very High | Low |

---

## How to Use This Document

1. **Product manager / repo owner**: Convert each issue section above into a GitHub Issue. Use the issue title, labels, and acceptance criteria verbatim.
2. **Developers**: Reference the acceptance criteria as the definition of done before opening a PR.
3. **Project board**: Create a GitHub Project with columns `Backlog → In Progress → Review → Done` and assign each issue to the appropriate iteration milestone.

---

*Last updated: 2026-03-02 · Maintainer: @chiga0*
