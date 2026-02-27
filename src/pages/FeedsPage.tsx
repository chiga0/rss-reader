/**
 * Feeds Page - Main landing page
 * Shows all subscribed feeds grouped by category with add/refresh/delete support
 * Features: floating add button, category grouping, bottom filter banner
 * Auto-refreshes feeds on mount
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Rss, Trash2, Star, BookOpen, List } from 'lucide-react';
import { useStore } from '@hooks/useStore';
import { storage } from '@lib/storage';
import { syncService } from '@services/syncService';
import { AddFeedDialog } from '@components/AddFeedDialog/AddFeedDialog';
import type { Article } from '@models/Feed';

export function FeedsPage() {
  const {
    feeds,
    categories,
    isLoading,
    error,
    isAddFeedDialogOpen,
    feedsFilter,
    loadFeeds,
    loadCategories,
    openAddFeedDialog,
    closeAddFeedDialog,
    unsubscribeFeed,
    setError,
    setFeedsFilter,
  } = useStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [articleCounts, setArticleCounts] = useState<Record<string, { total: number; unread: number; starred: number }>>({});
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Load feeds, categories and start auto-refresh on mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await storage.init().catch(() => { /* already initialized */ });
      await Promise.all([loadFeeds(), loadCategories()]);
      if (cancelled) return;
      setIsRefreshing(true);
      await syncService.refreshAllFeeds().catch(() => { /* background refresh failure */ });
      if (cancelled) return;
      await loadFeeds();
      setIsRefreshing(false);
    };
    init();
    return () => { cancelled = true; };
  }, [loadFeeds, loadCategories]);

  // Load article counts whenever feeds change
  useEffect(() => {
    const loadCounts = async () => {
      const counts: Record<string, { total: number; unread: number; starred: number }> = {};
      for (const feed of feeds) {
        try {
          const articles = await storage.getAllByIndex('articles', 'feedId', feed.id) as Article[];
          counts[feed.id] = {
            total: articles.length,
            unread: articles.filter(a => !a.readAt).length,
            starred: articles.filter(a => a.isFavorite).length,
          };
        } catch {
          counts[feed.id] = { total: 0, unread: 0, starred: 0 };
        }
      }
      setArticleCounts(counts);
    };
    if (feeds.length > 0) {
      loadCounts();
    }
  }, [feeds]);

  // Scroll handler for hiding/showing bottom bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsBottomBarVisible(currentScrollY <= lastScrollY.current || currentScrollY < 10);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await syncService.refreshAllFeeds();
      await loadFeeds();
    } catch {
      setError('Failed to refresh feeds');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadFeeds, setError]);

  const handleDelete = useCallback(async (feedId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to unsubscribe from this feed?')) {
      await unsubscribeFeed(feedId);
    }
  }, [unsubscribeFeed]);

  // Filter feeds based on the current filter
  const filteredFeeds = useMemo(() => {
    if (feedsFilter === 'all') return feeds;
    return feeds.filter(feed => {
      const counts = articleCounts[feed.id];
      if (!counts) return feedsFilter === 'unread'; // show by default when counts not loaded
      if (feedsFilter === 'unread') return counts.unread > 0;
      if (feedsFilter === 'starred') return counts.starred > 0;
      return true;
    });
  }, [feeds, feedsFilter, articleCounts]);

  // Group filtered feeds by category
  const groupedFeeds = useMemo(() => {
    const groups: { id: string; name: string; feeds: typeof filteredFeeds }[] = [];
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // Group by category
    const grouped = new Map<string, typeof filteredFeeds>();
    for (const feed of filteredFeeds) {
      const key = feed.categoryId || '__uncategorized__';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(feed);
    }

    // Ordered categories first
    for (const category of [...categories].sort((a, b) => a.order - b.order)) {
      const categoryFeeds = grouped.get(category.id);
      if (categoryFeeds && categoryFeeds.length > 0) {
        groups.push({ id: category.id, name: category.name, feeds: categoryFeeds });
      }
    }

    // Uncategorized last
    const uncategorized = grouped.get('__uncategorized__');
    if (uncategorized && uncategorized.length > 0) {
      groups.push({ id: '__uncategorized__', name: 'Uncategorized', feeds: uncategorized });
    }

    return groups;
  }, [filteredFeeds, categories]);

  const filterTabs = [
    { key: 'starred' as const, label: 'Starred', icon: Star },
    { key: 'unread' as const, label: 'Unread', icon: BookOpen },
    { key: 'all' as const, label: 'All', icon: List },
  ];

  return (
    <div className="mx-auto max-w-4xl pb-20">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Feeds</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent disabled:opacity-50"
            title="Refresh all feeds"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Loading */}
      {isLoading && !feeds.length && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && feeds.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
          <Rss className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">No feeds yet</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Get started by adding your first RSS feed subscription
          </p>
          <button
            onClick={openAddFeedDialog}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Your First Feed
          </button>
        </div>
      )}

      {/* Feed List grouped by category */}
      {feeds.length > 0 && (
        <div className="space-y-6">
          {groupedFeeds.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-center">
              <Rss className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {feedsFilter === 'starred' ? 'No feeds with starred articles' : 'No feeds with unread articles'}
              </p>
            </div>
          )}
          {groupedFeeds.map((group) => (
            <div key={group.id}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {group.name}
              </h2>
              <div className="space-y-3">
                {group.feeds.map((feed) => {
                  const counts = articleCounts[feed.id] || { total: 0, unread: 0, starred: 0 };
                  return (
                    <Link
                      key={feed.id}
                      to={`/feeds/${feed.id}`}
                      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent group"
                    >
                      {/* Feed Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        {feed.iconUrl ? (
                          <img src={feed.iconUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <Rss className="h-5 w-5" />
                        )}
                      </div>

                      {/* Feed Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-card-foreground">
                            {feed.title}
                          </h3>
                          {counts.unread > 0 && (
                            <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                              {counts.unread}
                            </span>
                          )}
                        </div>
                        {feed.description && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {feed.description}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{counts.total} articles</span>
                          {feed.lastFetchedAt && (
                            <span>Updated {new Date(feed.lastFetchedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(feed.id, e)}
                        className="shrink-0 rounded-md p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                        title="Unsubscribe"
                        aria-label={`Unsubscribe from ${feed.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Feed Button (FAB) */}
      <button
        onClick={openAddFeedDialog}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 active:scale-95"
        title="Add Feed"
        aria-label="Add Feed"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Filter Banner */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm transition-transform duration-300 ${
          isBottomBarVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-around px-4 py-2">
          {filterTabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFeedsFilter(key)}
              className={`inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                feedsFilter === key
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={label}
              aria-pressed={feedsFilter === key}
            >
              <Icon className="h-5 w-5" fill={feedsFilter === key ? 'currentColor' : 'none'} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Feed Dialog */}
      <AddFeedDialog isOpen={isAddFeedDialogOpen} onClose={closeAddFeedDialog} />
    </div>
  );
}
