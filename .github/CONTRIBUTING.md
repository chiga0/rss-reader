# Contributing to RSS Reader

Thank you for contributing to the RSS Reader PWA project! This guide explains how to contribute code, report bugs, and propose features in a way that aligns with our project governance.

**First, read this**: Our project is governed by the [Constitution](../.specify/memory/constitution.md). All contributions MUST comply with the five core principles, especially **Principle II (Test-First Development)**, which is non-negotiable.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. Discrimination, harassment, and disruptive behavior will not be tolerated.

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/rss-reader.git
cd rss-reader
pnpm install
```

### 2. Create a Feature Branch

Branch naming format: `[###]-[feature-name]`

```bash
git checkout -b 001-add-feed-subscriptions
```

### 3. Set Up Local Development

```bash
pnpm dev          # Start dev server on http://localhost:5173
pnpm test         # Run tests in watch mode
pnpm lint         # Check code quality
```

## Before You Start

### Check Feature Scope

All features MUST map to one of the constitutional Feature Scope items (FR-001 through FR-008). If your idea doesn't fit:

- **Core MVP (non-negotiable)**: FR-001 (Add RSS subscriptions), FR-002 (Auto-refresh), FR-003 (Read content)
- **Secondary (planned)**: FR-004 (Caching), FR-005 (OPML), FR-006 (Themes), FR-007 (Grouping), FR-008 (History/Favorites)

**Open an issue first** if you want to propose something outside this scope.

### Look for Existing Work

Search existing pull requests and issues to avoid duplicate work:

```bash
git log --oneline | grep -i "your feature"
```

## Development Workflow

### Step 1: Write Tests First (MANDATORY)

Per Principle II, **ALWAYS write tests before implementing**:

```typescript
// Example: tests/unit/feedService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { addFeed, validateRssUrl } from '../../src/services/feedService';

describe('feedService', () => {
  describe('validateRssUrl', () => {
    it('should reject invalid URLs', () => {
      expect(validateRssUrl('not-a-url')).toBe(false);
    });

    it('should accept valid RSS feed URLs', () => {
      expect(validateRssUrl('https://example.com/feed.xml')).toBe(true);
    });
  });
});
```

Run tests and confirm they FAIL:

```bash
pnpm test feedService
# Expected output: FAIL ✗ (tests don't pass yet)
```

### Step 2: Implement Code

Write the minimum code needed to make tests pass (Green phase):

```typescript
// src/services/feedService.ts
export const validateRssUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};
```

Run tests again:

```bash
pnpm test feedService
# Expected output: PASS ✓
```

### Step 3: Refactor & Optimize

Improve code while keeping tests green:

```bash
pnpm lint --fix   # Auto-fix linting issues
pnpm format       # Format code
pnpm test         # Verify tests still pass
```

### Step 4: Check Coverage

Minimum 80% coverage required:

```bash
pnpm test:coverage

# Output example:
# ----------|----------|----------|----------|----------|
# File      | % Stmts  | % Branch | % Funcs  | % Lines  |
# ----------|----------|----------|----------|----------|
# feedService.ts | 95 | 90 | 100 | 95 | ← ✓ PASS
```

### Step 5: Responsive Design Testing

If UI changes, test across three breakpoints:

```bash
# In DevTools, test at:
# 1. Mobile (375px) — use iPhone SE or Moto G4 preset
# 2. Tablet (768px) — use iPad or Galaxy Tab preset
# 3. Desktop (1024px) — normal window or set custom width

# Or run E2E tests across viewports:
pnpm test:e2e
```

### Step 6: Commit with Conventional Message

Format: `type(scope): subject`

```bash
git add src/services/feedService.ts tests/unit/feedService.test.ts

git commit -m "feat(feedService): add RSS URL validation

- Validates RSS 2.0 and Atom feed URLs
- Rejects invalid domains and protocols
- Test coverage: 95%"
```

**Commit types**:
- `feat`: New feature (FR-001, FR-004, etc.)
- `fix`: Bug fix
- `test`: Add/update tests (doesn't count toward feature implementation)
- `docs`: Documentation updates
- `refactor`: Code cleanup (no behavioral changes)
- `perf`: Performance improvements

### Step 7: Push & Create Pull Request

```bash
git push origin 001-add-feed-subscriptions
```

Then open a PR on GitHub. Use this template:

---

## Pull Request Template

```markdown
## What does this PR do?

Brief description: "Adds RSS URL validation to prevent invalid feeds"

## Which feature(s) does this address?

- [ ] FR-001: Add RSS Feed Subscriptions
- [ ] FR-002: Automatic Feed Refresh
- [ ] FR-003: Read RSS Content
- [ ] FR-004: Content Caching
- [ ] FR-005: OPML Import/Export
- [ ] FR-006: Theme & Appearance
- [ ] FR-007: Subscription Management
- [ ] FR-008: Reading History & Favorites

## Constitution Compliance Checklist

- [x] **Principle I (PWA)**: Does this work offline or support multi-platform?
- [x] **Principle II (Test-First)**: Tests written FIRST; coverage ≥ 80%?
- [x] **Principle III (Responsive)**: Tested at 375px, 768px, 1024px?
- [x] **Principle IV (Modern Tech)**: Uses TypeScript, no deprecated deps?
- [x] **Principle V (Observability)**: Includes error handling & logging?

## Testing

- [x] Unit tests passing (`pnpm test`)
- [x] Integration tests passing (if applicable)
- [x] Coverage threshold met (≥ 80%)
- [x] E2E tests passing (`pnpm test:e2e`)
- [x] Responsive testing complete (375px, 768px, 1024px)

## Related Issues

Closes #XXX
References #YYY
```

---

## Code Review Guidelines

### What Reviewers Look For

1. **Test-First Compliance (Non-Negotiable)**
   - ✓ Tests written before implementation
   - ✓ Tests initially failed, then passed with implementation
   - ✓ Coverage ≥ 80%
   - ✗ Implementation without tests → REJECT

2. **Principle Alignment**
   - ✓ PWA-compatible (offline, multi-platform where applicable)
   - ✓ Responsive at all breakpoints
   - ✓ Uses modern stack (TypeScript strict, React 18+, etc.)
   - ✓ Includes structured logging/error handling

3. **Code Quality**
   - ✓ Passes `pnpm lint` and `pnpm format`
   - ✓ TypeScript strict mode—no `any` types without justification
   - ✓ Meaningful variable/function names
   - ✓ Comments for non-obvious logic

4. **Performance**
   - ✓ Bundle size reasonable
   - ✓ No N+1 queries or unnecessary re-renders
   - ✓ Lighthouse score impact minimal

### Responding to Review Comments

- Thank reviewers for feedback
- Explain your reasoning if you disagree (don't argue)
- Make requested changes promptly
- Re-request review after updates
- It's OK to ask for clarification!

## Reporting Bugs

### How to Report

1. **Check existing issues** to avoid duplicates
2. **Use clear title**: "RSS feed fails to parse when title contains emoji" ✓ (not "Bug in feed parsing" ✗)
3. **Include reproduction steps**:
   ```
   1. Click "Add Feed"
   2. Enter "https://example.com/feed.xml"
   3. Click Submit
   4. Expected: Feed loads; Actual: Error message shows
   ```
4. **Include environment**:
   ```
   - Device: iPhone 12 (Safari 15)
   - OS: iOS 15.2
   - Browser: Safari
   - Network: 4G
   ```
5. **Include error details**:
   - Console errors (paste full stack trace)
   - Network errors (show request/response)
   - IndexedDB state if relevant

### Bug Report Template

```markdown
## Description
What doesn't work?

## Reproduction Steps
1. ...
2. ...
3. ...

## Expected Behavior
What should happen?

## Actual Behavior
What actually happened?

## Environment
- Device: [e.g., iPhone 12, Windows 10 PC]
- Browser: [e.g., Safari 15, Chrome 105]
- Network: [e.g., 4G, WiFi]
- Offline: [Yes/No]

## Screenshots / Logs
[Paste console errors, network logs, etc.]
```

## Proposing Features

### Before Opening an Issue

1. **Check Feature Scope** — Does it fit FR-001 to FR-008?
2. **Search issues** — Has this been discussed?
3. **Read Constitution** — Does it align with principles?

### Feature Proposal Template

```markdown
## Feature Description
What would you like to add?

## Why?
What problem does this solve?

## Relates to
- FR-001: Add RSS Feed Subscriptions?
- FR-004: Content Caching?
- [Pick the relevant feature(s)]

## Implementation Ideas
How might this work? (optional, don't over-detail)

## Acceptance Criteria
How would we know if this works?
```

## Development Tips

### Useful Commands

```bash
pnpm dev              # Start dev server
pnpm test             # Run tests (watch mode)
pnpm test --run       # Run tests once
pnpm test:coverage    # Check coverage
pnpm test:e2e         # Run end-to-end tests
pnpm test:e2e --ui    # E2E with visual interface
pnpm lint             # Check code quality
pnpm format           # Auto-format code
pnpm type-check       # TypeScript validation
pnpm build            # Production build
pnpm preview          # Preview production build
```

### Local Testing on Mobile

Test PWA locally on an actual device:

```bash
# Get your local IP (macOS/Linux)
ifconfig | grep "inet " | grep -v 127.0.0.1

# Start dev server and note the URL
pnpm dev
# Output: Local: http://YOUR_IP:5173

# On mobile device, visit http://YOUR_IP:5173
# Open DevTools (long-press → Inspect) and test responsiveness
```

### Debugging Service Worker

```bash
# Check Service Worker status
# DevTools → Application → Service Workers

# Force-update Service Worker
# DevTools → Application → Service Workers → Update on reload ✓

# Clear all caches
# DevTools → Application → Cache Storage → [delete all]

# Test offline mode
# DevTools → Application → Service Workers → Offline ✓
# Reload page—should work without network
```

## Questions?

- **Technical help**: Open a GitHub Discussion
- **Issue with contribution process**: Comment on your PR
- **Governance questions**: Reference `.specify/memory/constitution.md`

## License

By contributing, you agree that your contributions will be licensed under the project's license. (TBD)

---

## Summary: The Contribution Workflow

```
1. Create feature branch (001-feature-name)
   ↓
2. Write failing tests (Red phase)
   ↓
3. Implement code (Green phase)
   ↓
4. Refactor & test coverage ≥ 80% (Refactor phase)
   ↓
5. Test responsive design (375px, 768px, 1024px)
   ↓
6. Lint & format (pnpm lint --fix, pnpm format)
   ↓
7. Commit with conventional message
   ↓
8. Push & create PR with checklist
   ↓
9. Address review feedback
   ↓
10. Merge when approved & tests pass ✓
```

**Thank you for contributing!** 🎉
