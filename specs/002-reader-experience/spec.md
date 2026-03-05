# Feature Specification: v1.1 Reader Experience

**Feature Branch**: `002-reader-experience`
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "v1.1 Reader Experience — 基于竞品 Medium 的对比分析，升级文章阅读体验。包含阅读进度条、预计阅读时长、排版优化、代码高亮、图片灯箱、文章卡片信息增强等功能。"

**Note on Scope**: All user stories align with core features FR-003 (Read RSS Content) and secondary features FR-006 (Theme & Appearance). Competitive gap analysis in [docs/medium-comparison-report.md](../../docs/medium-comparison-report.md).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reading Progress Bar (Priority: P1) - FR-003

A user reading a long article sees a thin progress bar fixed at the top of the viewport. As they scroll through the article, the bar fills proportionally (0%–100%), providing continuous visual feedback on how much of the article remains.

**Why this priority**: Reading progress is the highest-impact, lowest-effort improvement identified in the Medium comparison. It addresses the #1 reading experience gap.

**Independent Test**: Open any article with scrollable content. Verify bar fills from 0% to 100% proportionally. Short articles (single viewport) show no bar.

**Acceptance Scenarios**:

1. **Given** user opens a long article, **When** the page loads, **Then** a 3px progress bar appears fixed at the very top of the page at 0%
2. **Given** user scrolls to the midpoint, **When** 50% of content is scrolled, **Then** the bar fills to approximately 50%
3. **Given** user scrolls to the bottom, **When** article is fully visible, **Then** the bar reaches 100% and stays there
4. **Given** the article fits within a single viewport, **When** the page loads, **Then** no progress bar is shown

---

### User Story 2 - Reading Time Estimate with CJK Awareness (Priority: P1) - FR-003

The article detail header displays an estimated reading time (e.g., "3 min read" / "3 分钟阅读"). The calculation uses 200 WPM for Latin text and 400 CPM for CJK characters, with bilingual content weighted by proportion.

**Why this priority**: Already planned in ROADMAP v1.1 (#1). Quick win that helps users decide whether to read now or save for later.

**Independent Test**: Open English and Chinese articles of known length; verify displayed times match expected ranges.

**Acceptance Scenarios**:

1. **Given** a 1000-word English article, **When** user opens it, **Then** header shows "5 min read"
2. **Given** a 2000-character Chinese article, **When** user opens it, **Then** header shows "5 分钟阅读"
3. **Given** a mixed English/Chinese article, **When** user opens it, **Then** reading time is calculated using weighted average of both speeds
4. **Given** a very short article (< 200 words), **When** user opens it, **Then** header shows "1 min read" (minimum)

---

### User Story 3 - Typography & Readability Upgrade (Priority: P1) - FR-003, FR-006

Article body typography is refined for optimal readability: 18px base font on desktop (16px mobile), 42rem max content width for optimal line length, enhanced heading hierarchy (h1–h4), and wider line spacing for CJK content.

**Why this priority**: Typography quality is the most fundamental reading experience factor. Medium's typographic excellence is its defining feature.

**Independent Test**: Open articles on desktop and mobile viewports; verify line width, text size, heading hierarchy, and paragraph spacing.

**Acceptance Scenarios**:

1. **Given** a desktop viewport (≥768px), **When** user reads an article, **Then** body text is 18px with max-width 42rem
2. **Given** a mobile viewport (<768px), **When** user reads an article, **Then** body text is 16px with full-width layout
3. **Given** a CJK-dominant article, **When** the page renders, **Then** line-height increases to 2.0 for improved readability
4. **Given** an article with multiple heading levels, **When** the page renders, **Then** h1 > h2 > h3 > h4 follow a clear visual hierarchy

---

### User Story 4 - Code Syntax Highlighting (Priority: P2) - FR-003

Code blocks (`<pre><code>`) in article content are automatically syntax-highlighted with language auto-detection. A copy-to-clipboard button appears on each code block. Highlighting themes adapt to light/dark mode.

**Why this priority**: Important for tech-focused RSS feeds but not essential for all users. Adds significant value for developer audience.

**Independent Test**: Open an article with code blocks; verify syntax colouring, copy button functionality, and theme adaptation.

**Acceptance Scenarios**:

1. **Given** an article with a JavaScript code block, **When** the page renders, **Then** the code is syntax-highlighted with appropriate colours
2. **Given** any code block, **When** user clicks the copy button, **Then** code text is copied to clipboard and button shows "Copied!" feedback for 2 seconds
3. **Given** user toggles dark mode, **When** viewing highlighted code, **Then** the highlighting theme switches accordingly

---

### User Story 5 - Image Lightbox (Priority: P2) - FR-003

Users can click on any image in an article to view it in a full-screen lightbox overlay. The lightbox supports navigation between images, close via ESC or backdrop click, and basic zoom on touch devices.

**Why this priority**: Enhances media-rich article experience but not critical for text-focused reading.

**Independent Test**: Open an article with images; click an image; verify lightbox opens with correct image, navigation works, ESC closes.

**Acceptance Scenarios**:

1. **Given** an article with images, **When** user clicks an image, **Then** a full-screen overlay opens showing the image at full resolution
2. **Given** the lightbox is open with multiple images, **When** user clicks next/previous arrows, **Then** the next/previous image displays
3. **Given** the lightbox is open, **When** user presses ESC or clicks the backdrop, **Then** the lightbox closes

---

### User Story 6 - Enhanced Article Cards (Priority: P2) - FR-003

Article list cards are enriched with reading time estimate, favourite indicator (filled heart), and improved unread styling (bold title + subtle background tint).

**Why this priority**: Improves information density and scannability but relies on reading time utility from US2.

**Independent Test**: View feed list; verify cards show reading time, favourite hearts, and clear unread indicators.

**Acceptance Scenarios**:

1. **Given** a feed list with articles, **When** user views the list, **Then** each card shows reading time estimate
2. **Given** a favourited article, **When** user views the list, **Then** the card shows a filled heart icon
3. **Given** an unread article, **When** user views the list, **Then** the card has a bold title and subtle background tint

---

### Edge Cases

- What happens when article content is empty or only contains images? → Reading time shows "1 min read" minimum
- What happens when a code block has no language class? → Falls back to plain text display without highlighting
- What happens when an article has no images? → No lightbox functionality, no visual change
- What happens when the progress bar is on a very short article? → Bar is hidden (isFullyVisible = true)
- What happens when CJK and Latin text are equally mixed (50/50)? → Weighted average of both reading speeds
- What happens on extremely slow scroll? → Progress bar updates smoothly via requestAnimationFrame
- What happens if clipboard API is not available? → Copy button falls back to document.execCommand('copy')
- What happens with broken/missing images in lightbox? → Shows fallback placeholder

## Requirements *(mandatory)*

### Functional Requirements

- **REQ-001**: System MUST display a reading progress bar that tracks scroll position (0%–100%) on the article detail page
- **REQ-002**: Progress bar MUST be fixed at the top of the viewport, 3px height, using theme-aware primary colour
- **REQ-003**: Progress bar MUST be hidden when article fits within a single viewport
- **REQ-004**: Progress bar MUST use requestAnimationFrame and passive scroll listeners for performance
- **REQ-005**: System MUST calculate reading time using 200 WPM for Latin text and 400 CPM for CJK characters
- **REQ-006**: System MUST detect CJK character ratio to determine dominant language for display format
- **REQ-007**: Reading time MUST be displayed in article detail header alongside author and date
- **REQ-008**: Minimum displayed reading time MUST be 1 minute
- **REQ-009**: Article content MUST use 18px base font size on desktop and 16px on mobile
- **REQ-010**: Article content MUST have a max-width of 42rem for optimal line length
- **REQ-011**: CJK-dominant articles MUST use increased line-height (2.0) for readability
- **REQ-012**: Headings MUST follow clear visual hierarchy: h1 (2rem) > h2 (1.75rem) > h3 (1.5rem) > h4 (1.25rem)
- **REQ-013**: Code blocks MUST be syntax-highlighted with auto-detected language
- **REQ-014**: Each code block MUST include a copy-to-clipboard button
- **REQ-015**: Code highlighting MUST adapt to light/dark theme
- **REQ-016**: Clicking an article image MUST open a full-screen lightbox overlay
- **REQ-017**: Lightbox MUST support navigation between images in the same article
- **REQ-018**: Lightbox MUST close via ESC key, backdrop click, or close button
- **REQ-019**: Article cards MUST show estimated reading time
- **REQ-020**: Article cards MUST show favourite indicator (filled heart) when applicable
- **REQ-021**: Unread articles MUST have visually distinct styling (bold title)

### Key Entities

- **ReadingProgress**: Transient state — progress (0.0–1.0), isFullyVisible (boolean)
- **ReadingTimeResult**: Derived value — minutes, cjkCharCount, wordCount, isCjkDominant
- **LightboxState**: Transient state — isOpen, currentIndex, images array, zoom level

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Progress bar renders at 60fps during scroll (no jank)
- **SC-002**: Reading time calculation adds < 5ms to article load time
- **SC-003**: Typography changes pass WCAG AA contrast requirements
- **SC-004**: CJK reading time accuracy within ±20% of manual estimate
- **SC-005**: Code highlighting loads lazily, adding 0ms to initial page load
- **SC-006**: Image lightbox opens within 100ms of click
- **SC-007**: All new code has ≥ 90% unit test coverage
- **SC-008**: No regressions to existing 245 passing tests
