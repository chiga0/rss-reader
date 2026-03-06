# Implementation Plan: v1.1 Reader Experience

**Branch**: `002-reader-experience` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)

## Summary

Upgrade article reading experience to close the gap with Medium identified in the competitive analysis. Six user stories covering: reading progress bar, CJK-aware reading time, typography optimization, code syntax highlighting, image lightbox, and enhanced article cards. All changes are front-end only with no database schema modifications.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode)
**Primary Dependencies**: React 18.3, Vite 7.3, Tailwind CSS 4.1, Zustand 4.5
**Storage**: IndexedDB (existing, no changes)
**Testing**: Vitest 4.0 (unit), Playwright 1.48 (e2e)
**Target Platform**: PWA (Chrome/Firefox/Safari, Android, iOS)
**Performance Goals**: 60fps scroll tracking, < 5ms reading time calculation
**Constraints**: No new CSS files (Constitution VI), no new Zustand stores

## Constitution Check

- [x] **Principle I (PWA Architecture)**: All features work offline with cached articles
- [x] **Principle II (Test-First)**: Each user story includes unit tests; ≥ 90% coverage target
- [x] **Principle III (Responsive Design)**: Typography adapts to mobile/tablet/desktop breakpoints
- [x] **Principle IV (Modern Tech)**: Uses existing TypeScript 5.7 + React 18 stack
- [x] **Principle V (Observability)**: No new logging needed (UI-only changes)
- [x] **Principle VI (Styling)**: All CSS in globals.css, no new CSS files
- [x] **Principle VII (Routing)**: No route changes required
- [x] **Principle VIII (Formatting)**: npm run format after all changes

## Architecture Decisions

1. **No database changes** — all new state is transient (progress, lightbox) or derived (reading time)
2. **No new CSS files** — all style enhancements go into src/styles/globals.css per Constitution VI
3. **No new dependencies for lightbox** — built with existing React + Lucide icons
4. **Reading time utility enhanced in-place** — maintains backward compatibility
5. **Code copy button** — uses native Clipboard API with execCommand fallback

## Project Structure

### New Files
```
src/hooks/useReadingProgress.ts          # Scroll tracking hook
src/hooks/useImageLightbox.ts            # Lightbox state management hook
src/components/ArticleView/ReadingProgressBar.tsx  # Progress bar component
src/components/ArticleView/CodeBlockEnhancer.tsx   # Code block copy button
src/components/ArticleView/ImageLightbox.tsx       # Lightbox overlay component
tests/unit/useReadingProgress.test.ts    # Progress hook tests
tests/unit/useImageLightbox.test.ts      # Lightbox hook tests
tests/unit/codeBlockCopy.test.ts         # Code copy tests
```

### Modified Files
```
src/utils/readingTime.ts                 # Add CJK-aware calculation
src/styles/globals.css                   # Typography enhancements
src/pages/ArticleDetailPage.tsx          # Integrate all features
src/components/ArticleList/ArticleItem.tsx  # Enhanced cards
tests/unit/readingTime.test.ts           # Additional CJK tests
```
