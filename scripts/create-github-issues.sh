#!/usr/bin/env bash
# =============================================================================
# create-github-issues.sh
#
# One-shot script that creates:
#   1. Repository labels  (iter/v1.1 … iter/v2.0, tech-debt, enhancement, backend)
#   2. Milestones         (v1.1, v1.2, v1.3, v2.0)
#   3. GitHub Issues      (10 features + 6 tech-debt items from ROADMAP.md)
#   4. GitHub Project     ("RSS Reader Roadmap") with all issues added
#
# Prerequisites:
#   - gh CLI installed and authenticated  (gh auth login)
#   - jq installed
#
# Usage:
#   chmod +x scripts/create-github-issues.sh
#   ./scripts/create-github-issues.sh
# =============================================================================

set -euo pipefail

REPO="chiga0/rss-reader"

echo "▶ Targeting repository: $REPO"
echo ""

# -----------------------------------------------------------------------------
# Helper: create a label if it doesn't already exist
# -----------------------------------------------------------------------------
create_label() {
  local name="$1" color="$2" description="$3"
  if gh label list --repo "$REPO" --json name --jq '.[].name' | grep -qx "$name"; then
    echo "  label '$name' already exists — skipping"
  else
    gh label create "$name" \
      --repo "$REPO" \
      --color "$color" \
      --description "$description"
    echo "  ✓ label '$name' created"
  fi
}

# -----------------------------------------------------------------------------
# Helper: create a milestone if it doesn't already exist, return its number
# -----------------------------------------------------------------------------
create_milestone() {
  local title="$1" due="$2" desc="$3"
  local existing
  existing=$(gh api "repos/$REPO/milestones" --jq ".[] | select(.title==\"$title\") | .number" 2>/dev/null || true)
  if [[ -n "$existing" ]]; then
    echo "  milestone '$title' already exists (#$existing) — skipping" >&2
    echo "$existing"
  else
    local number
    number=$(gh api "repos/$REPO/milestones" \
      --method POST \
      -f title="$title" \
      -f description="$desc" \
      -f due_on="${due}T00:00:00Z" \
      --jq '.number')
    echo "  ✓ milestone '$title' created (#$number)" >&2
    echo "$number"
  fi
}

# -----------------------------------------------------------------------------
# Helper: create an issue, return its node ID (for Project)
# -----------------------------------------------------------------------------
create_issue() {
  local title="$1" body="$2" labels="$3" milestone="$4"
  local extra_args=()
  [[ -n "$milestone" ]] && extra_args+=(--milestone "$milestone")

  local result
  result=$(gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --label "$labels" \
    "${extra_args[@]}" \
    --json number,id \
    --jq '[.number, .id] | @tsv')

  local number node_id
  number=$(echo "$result" | cut -f1)
  node_id=$(echo "$result" | cut -f2)
  echo "  ✓ Issue #$number: $title" >&2
  echo "$node_id"
}

# =============================================================================
# 1. LABELS
# =============================================================================
echo "── Creating labels ────────────────────────────────────────────────────────"
create_label "enhancement"  "84b6eb" "New feature or improvement"
create_label "tech-debt"    "e4e669" "Code quality / refactoring work"
create_label "backend"      "d93f0b" "Requires server-side component"
create_label "iter/v1.1"    "0075ca" "Iteration v1.1 — Reader Experience"
create_label "iter/v1.2"    "0052cc" "Iteration v1.2 — Content Enrichment"
create_label "iter/v1.3"    "003999" "Iteration v1.3 — Platform Expansion"
create_label "iter/v2.0"    "001f6a" "Iteration v2.0 — New Content Formats"
echo ""

# =============================================================================
# 2. MILESTONES
# =============================================================================
echo "── Creating milestones ────────────────────────────────────────────────────"
MS_V11=$(create_milestone "v1.1" "2026-03-16" "Reader Experience — reading time, keyboard shortcuts, advanced search")
MS_V12=$(create_milestone "v1.2" "2026-04-13" "Content Enrichment — annotations, feed discovery, social sharing")
MS_V13=$(create_milestone "v1.3" "2026-05-11" "Platform Expansion — browser extension, multi-device sync")
MS_V20=$(create_milestone "v2.0" "2026-07-06" "New Content Formats — podcast, newsletter")
echo ""

# =============================================================================
# 3. ISSUES
# =============================================================================
echo "── Creating feature issues ────────────────────────────────────────────────"
ISSUE_IDS=()

# ---- v1.1 ------------------------------------------------------------------

BODY=$(cat <<'EOF'
## Summary
Show an estimated reading time (e.g. "5 min read") in the article detail header so users can decide whether to read now or save for later.

## Acceptance Criteria
- [ ] Appears in `ArticleDetailPage` alongside author and date
- [ ] Calculated client-side from word count (`ceil(words / 200)`, minimum 1 min)
- [ ] No impact on article loading performance
- [ ] Unit tested (empty input, boundaries at 200/201 words, HTML stripping, format output)

## Implementation Notes
- New utility `src/utils/readingTime.ts` → `calculateReadingTime(html: string): number` + `formatReadingTime(minutes: number): string`
- Memoised in `ArticleDetailPage` via `useMemo`
EOF
)
ISSUE_IDS+=( "$(create_issue "Reading time estimate" "$BODY" "iter/v1.1,enhancement" "$MS_V11")" )

BODY=$(cat <<'EOF'
## Summary
Add keyboard shortcuts to speed up navigation for power users.

## Shortcuts

| Key | Action |
|-----|--------|
| `j` / `k` | Next / previous article in list |
| `o` or `Enter` | Open selected article |
| `f` | Toggle favourite on open article |
| `r` | Mark article as read / unread |
| `Escape` | Go back |
| `?` | Show shortcuts help overlay |

## Acceptance Criteria
- [ ] Shortcuts only active when focus is not inside an `<input>` / `<textarea>`
- [ ] Help overlay accessible via `?` key
- [ ] No conflicts with browser shortcuts
- [ ] E2E tested
EOF
)
ISSUE_IDS+=( "$(create_issue "Keyboard shortcuts" "$BODY" "iter/v1.1,enhancement" "$MS_V11")" )

BODY=$(cat <<'EOF'
## Summary
Extend the current full-text search with filter controls so users can narrow results without manual scrolling.

## Filters
- Feed (multi-select)
- Date range (today / last 7 days / last 30 days / custom)
- Read status (all / unread / read)
- Starred only toggle

## Acceptance Criteria
- [ ] Filter bar visible on `SearchPage`
- [ ] URL query params reflect active filters (shareable / bookmarkable)
- [ ] "Clear filters" button resets to defaults
- [ ] Integration tested
EOF
)
ISSUE_IDS+=( "$(create_issue "Advanced article search with filters" "$BODY" "iter/v1.1,enhancement" "$MS_V11")" )

# ---- v1.2 ------------------------------------------------------------------

BODY=$(cat <<'EOF'
## Summary
Allow users to highlight passages in articles and attach personal notes. Annotations are stored locally (IndexedDB) and survive offline sessions.

## Acceptance Criteria
- [ ] Text selection in article body shows "Highlight" action
- [ ] Notes can be typed per highlight
- [ ] Highlights visible with yellow tint on revisit
- [ ] All annotations listed on a dedicated Annotations page
- [ ] Annotated article count shown on feed card
- [ ] Annotations exportable as JSON backup
EOF
)
ISSUE_IDS+=( "$(create_issue "Article annotations & highlights" "$BODY" "iter/v1.2,enhancement" "$MS_V12")" )

BODY=$(cat <<'EOF'
## Summary
When a user subscribes to a feed (or visits its detail page), suggest similar feeds from a curated list or by parsing the source site's `<link rel="alternate">` tags.

## Acceptance Criteria
- [ ] "Suggested feeds" section appears on `FeedDetailPage`
- [ ] Suggestions derived from site HTML autodiscovery first, then a static seed list
- [ ] Each suggestion can be subscribed in one tap
- [ ] No telemetry or external tracking
EOF
)
ISSUE_IDS+=( "$(create_issue "Feed discovery" "$BODY" "iter/v1.2,enhancement" "$MS_V12")" )

BODY=$(cat <<'EOF'
## Summary
Add a share action to articles so users can send links via the native OS share sheet or copy to clipboard.

## Acceptance Criteria
- [ ] Share button in `ArticleActionBar`
- [ ] Uses Web Share API when available, falls back to clipboard copy
- [ ] Shared URL points to the original article, not the app
- [ ] Works on iOS Safari, Android Chrome, and desktop
EOF
)
ISSUE_IDS+=( "$(create_issue "Social sharing" "$BODY" "iter/v1.2,enhancement" "$MS_V12")" )

# ---- v1.3 ------------------------------------------------------------------

BODY=$(cat <<'EOF'
## Summary
A lightweight browser extension that detects RSS/Atom feeds on the current page and lets users subscribe in one click, without copy-pasting the URL.

## Acceptance Criteria
- [ ] Extension icon turns active when a feed is detected on the page
- [ ] One-click subscribe opens the app's `AddFeedDialog` (or posts directly to IndexedDB if app is open)
- [ ] Manifest V3 (Chrome) + WebExtensions API (Firefox)
- [ ] No permissions beyond `activeTab` and `storage`
EOF
)
ISSUE_IDS+=( "$(create_issue "Browser extension (Chrome & Firefox)" "$BODY" "iter/v1.3,enhancement" "$MS_V13")" )

BODY=$(cat <<'EOF'
## Summary
Sync read status, favourites, categories, and OPML subscriptions across devices using a lightweight, self-hostable backend.

## Acceptance Criteria
- [ ] Optional: users can opt in; all data remains local-only by default
- [ ] Sync via user-provided server URL + API key (no centralised account required)
- [ ] Conflict resolution: last-write-wins with per-field timestamps
- [ ] Full offline capability preserved; sync happens in background
- [ ] OpenAPI spec published for self-hosters
EOF
)
ISSUE_IDS+=( "$(create_issue "Multi-device sync" "$BODY" "iter/v1.3,enhancement,backend" "$MS_V13")" )

# ---- v2.0 ------------------------------------------------------------------

BODY=$(cat <<'EOF'
## Summary
Parse `<enclosure>` tags in RSS feeds to detect podcast episodes. Provide an in-app audio player with playback speed control and a persistent mini-player.

## Acceptance Criteria
- [ ] Podcast feeds auto-detected when `<enclosure type="audio/*">` is present
- [ ] Audio player: play/pause, seek, 1×/1.5×/2× speed, skip ±30 s
- [ ] Mini-player persists while browsing other articles
- [ ] Playback position saved per-episode (resumes on reopen)
- [ ] Background audio playback (Media Session API)
EOF
)
ISSUE_IDS+=( "$(create_issue "Podcast support" "$BODY" "iter/v2.0,enhancement" "$MS_V20")" )

BODY=$(cat <<'EOF'
## Summary
Generate a unique inbound email address that converts newsletter emails into RSS-style articles inside the app (using a lightweight forwarding service or self-hosted Cloudflare Worker).

## Acceptance Criteria
- [ ] User can generate a forwarding address in Settings
- [ ] Incoming emails appear as articles in a special "Newsletters" feed
- [ ] Images and inline HTML preserved
- [ ] Unsubscribing from the newsletter removes the forwarding address
EOF
)
ISSUE_IDS+=( "$(create_issue "Newsletter integration" "$BODY" "iter/v2.0,enhancement,backend" "$MS_V20")" )

# ---- tech-debt -------------------------------------------------------------
echo ""
echo "── Creating tech-debt issues ──────────────────────────────────────────────"

TD_IDS=()
TD_IDS+=( "$(create_issue "TD-1 Complete Shadcn UI migration" \
  "Complete the remaining Shadcn UI migration phases (Phase 3–6) to fully replace custom component styles." \
  "tech-debt" "")" )

TD_IDS+=( "$(create_issue "TD-2 Page/layout test coverage ≥ 90%" \
  "Raise test coverage for page and layout components to ≥ 90%." \
  "tech-debt" "")" )

TD_IDS+=( "$(create_issue "TD-3 E2E tests for mobile & desktop navigation" \
  "Add E2E tests covering mobile and desktop navigation flows using Playwright." \
  "tech-debt" "")" )

TD_IDS+=( "$(create_issue "TD-4 Error boundaries" \
  "Implement React error boundaries to prevent full-page crashes on unexpected runtime errors." \
  "tech-debt" "")" )

TD_IDS+=( "$(create_issue "TD-5 Skeleton loading states" \
  "Add skeleton loading states for all data-fetching pages (feeds list, article list, article detail, favorites)." \
  "tech-debt" "")" )

TD_IDS+=( "$(create_issue "TD-6 Lighthouse audit baseline" \
  "Run Lighthouse audit after each iteration. Target: all scores 100 (Performance, Accessibility, Best Practices, SEO)." \
  "tech-debt" "")" )

echo ""

# =============================================================================
# 4. GITHUB PROJECT (ProjectV2)
# =============================================================================
echo "── Creating GitHub Project ────────────────────────────────────────────────"

# Retrieve the owner's node ID
OWNER_ID=$(gh api graphql \
  -f query='query { repositoryOwner(login: "chiga0") { id } }' \
  --jq '.data.repositoryOwner.id')
echo "  owner node id: $OWNER_ID"

# Check if project already exists
EXISTING_PROJECT=$(gh api graphql \
  -f query='query($login: String!) {
    user(login: $login) {
      projectsV2(first: 20) {
        nodes { id title }
      }
    }
  }' \
  -f login="chiga0" \
  --jq '.data.user.projectsV2.nodes[] | select(.title=="RSS Reader Roadmap") | .id' 2>/dev/null || true)

if [[ -n "$EXISTING_PROJECT" ]]; then
  PROJECT_ID="$EXISTING_PROJECT"
  echo "  Project 'RSS Reader Roadmap' already exists (id: $PROJECT_ID) — skipping creation"
else
  PROJECT_ID=$(gh api graphql \
    -f query='mutation($ownerId: ID!, $title: String!) {
      createProjectV2(input: { ownerId: $ownerId, title: $title }) {
        projectV2 { id }
      }
    }' \
    -f ownerId="$OWNER_ID" \
    -f title="RSS Reader Roadmap" \
    --jq '.data.createProjectV2.projectV2.id')
  echo "  ✓ Project 'RSS Reader Roadmap' created (id: $PROJECT_ID)"
fi

echo ""
echo "── Adding issues to project ───────────────────────────────────────────────"

add_to_project() {
  local content_id="$1"
  gh api graphql \
    -f query='mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item { id }
      }
    }' \
    -f projectId="$PROJECT_ID" \
    -f contentId="$content_id" \
    --jq '.data.addProjectV2ItemById.item.id' > /dev/null
  echo "  ✓ added issue to project"
}

for nid in "${ISSUE_IDS[@]}" "${TD_IDS[@]}"; do
  [[ -z "$nid" ]] && continue
  add_to_project "$nid"
done

echo ""
echo "✅ Done!"
echo "   Issues   → https://github.com/$REPO/issues"
echo "   Milestones → https://github.com/$REPO/milestones"
echo "   Project  → https://github.com/users/chiga0/projects"
