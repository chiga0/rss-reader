/**
 * Search Page
 * Secondary page with back button, search input, and results
 * Searches across feed titles and article titles/summaries with advanced filters
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Rss, FileText, SlidersHorizontal, X } from 'lucide-react';
import { storage } from '@lib/storage';
import type { Feed, Article } from '@models/Feed';

type DateFilter = 'all' | 'today' | '7days' | '30days';
type ReadStatus = 'all' | 'unread' | 'read';

interface SearchResults {
  feeds: Feed[];
  articles: (Article & { feedTitle?: string })[];
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const [feedFilter, setFeedFilter] = useState<string[]>(() =>
    searchParams.getAll('feed')
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>(
    () => (searchParams.get('date') as DateFilter) ?? 'all'
  );
  const [readStatus, setReadStatus] = useState<ReadStatus>(
    () => (searchParams.get('read') as ReadStatus) ?? 'all'
  );
  const [starredOnly, setStarredOnly] = useState(() => searchParams.get('starred') === '1');

  const [allFeeds, setAllFeeds] = useState<Feed[]>([]);
  const [results, setResults] = useState<SearchResults>({ feeds: [], articles: [] });
  const [hasSearched, setHasSearched] = useState(false);

  // Load all feeds once for the filter list
  useEffect(() => {
    storage.init().catch(() => {}).then(() =>
      storage.getAll('feeds').then((feeds) => setAllFeeds(feeds.filter((f) => !f.deletedAt)))
    );
  }, []);

  // Sync state → URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    feedFilter.forEach((id) => params.append('feed', id));
    if (dateFilter !== 'all') params.set('date', dateFilter);
    if (readStatus !== 'all') params.set('read', readStatus);
    if (starredOnly) params.set('starred', '1');
    setSearchParams(params, { replace: true });
  }, [query, feedFilter, dateFilter, readStatus, starredOnly, setSearchParams]);

  const hasActiveFilters = feedFilter.length > 0 || dateFilter !== 'all' || readStatus !== 'all' || starredOnly;

  const clearFilters = useCallback(() => {
    setFeedFilter([]);
    setDateFilter('all');
    setReadStatus('all');
    setStarredOnly(false);
  }, []);

  const performSearch = useCallback(async (
    searchQuery: string,
    feeds: string[],
    date: DateFilter,
    read: ReadStatus,
    starred: boolean,
  ) => {
    if (!searchQuery.trim()) {
      setResults({ feeds: [], articles: [] });
      setHasSearched(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    setHasSearched(true);

    try {
      await storage.init().catch(() => {});

      const allFeedsData = (await storage.getAll('feeds')).filter((f) => !f.deletedAt);
      const matchedFeeds = allFeedsData.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.url.toLowerCase().includes(q)
      );

      const allArticles = (await storage.getAll('articles')).filter((a) => !a.deletedAt);
      const now = Date.now();
      const feedMap = new Map(allFeedsData.map((f) => [f.id, f.title]));

      const matchedArticles = allArticles
        .filter((a) => a.title.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q))
        .filter((a) => (feeds.length === 0 ? true : feeds.includes(a.feedId)))
        .filter((a) => {
          if (date === 'all') return true;
          const ms = now - new Date(a.publishedAt).getTime();
          if (date === 'today') return ms < 86_400_000;
          if (date === '7days') return ms < 7 * 86_400_000;
          if (date === '30days') return ms < 30 * 86_400_000;
          return true;
        })
        .filter((a) => {
          if (read === 'all') return true;
          if (read === 'unread') return !a.readAt;
          if (read === 'read') return !!a.readAt;
          return true;
        })
        .filter((a) => (starred ? a.isFavorite : true))
        .slice(0, 50);

      const articlesWithFeedTitle = matchedArticles.map((a) => ({
        ...a,
        feedTitle: feedMap.get(a.feedId),
      }));

      setResults({ feeds: matchedFeeds, articles: articlesWithFeedTitle });
    } catch {
      setResults({ feeds: [], articles: [] });
    }
  }, []);

  // Debounced search with filters
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, feedFilter, dateFilter, readStatus, starredOnly);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, feedFilter, dateFilter, readStatus, starredOnly, performSearch]);

  const DATE_OPTIONS: { label: string; value: DateFilter }[] = useMemo(() => [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: '7 days', value: '7days' },
    { label: '30 days', value: '30days' },
  ], []);

  const READ_OPTIONS: { label: string; value: ReadStatus }[] = useMemo(() => [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Read', value: 'read' },
  ], []);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Search Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search feeds and articles..."
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`shrink-0 rounded-md p-2 transition-colors hover:bg-accent ${hasActiveFilters ? 'text-primary' : 'text-muted-foreground hover:text-accent-foreground'}`}
          aria-label="Toggle filters"
          title="Filters"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4 space-y-4">
          {/* Feed filter */}
          {allFeeds.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feeds</p>
              <div className="flex flex-wrap gap-2">
                {allFeeds.map((feed) => (
                  <label key={feed.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feedFilter.includes(feed.id)}
                      onChange={(e) =>
                        setFeedFilter((prev) =>
                          e.target.checked ? [...prev, feed.id] : prev.filter((id) => id !== feed.id)
                        )
                      }
                      className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    <span className="text-card-foreground">{feed.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Date filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
            <div className="flex gap-2 flex-wrap">
              {DATE_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setDateFilter(value)}
                  className={`rounded-md px-3 py-1 text-sm transition-colors ${
                    dateFilter === value
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Read status filter */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
            <div className="flex gap-2 flex-wrap">
              {READ_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setReadStatus(value)}
                  className={`rounded-md px-3 py-1 text-sm transition-colors ${
                    readStatus === value
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Starred toggle + clear */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={starredOnly}
                onChange={(e) => setStarredOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              <span className="text-card-foreground">Starred only</span>
            </label>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && results.feeds.length === 0 && results.articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No results found for &quot;{query}&quot;</p>
        </div>
      )}

      {/* Feed Results */}
      {results.feeds.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Feeds ({results.feeds.length})
          </h2>
          <div className="space-y-2">
            {results.feeds.map((feed) => (
              <Link
                key={feed.id}
                to={`/feeds/${feed.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  {feed.iconUrl ? (
                    <img src={feed.iconUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <Rss className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-card-foreground">{feed.title}</h3>
                  {feed.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{feed.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Article Results */}
      {results.articles.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Articles ({results.articles.length})
          </h2>
          <div className="space-y-2">
            {results.articles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-card-foreground">{article.title}</h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {article.feedTitle && <span>{article.feedTitle}</span>}
                    {article.publishedAt && (
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

