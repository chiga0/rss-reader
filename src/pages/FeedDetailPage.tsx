/**
 * Feed Detail Page - Articles from a specific feed
 * Shows article list with read/unread status, mark-as-read, and favorites
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { useLoaderData, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, RefreshCw } from 'lucide-react';
import { useStore } from '@hooks/useStore';
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts';
import { formatRelativeTime } from '@utils/dateFormat';
import { fetchAndStoreArticles, getArticlesForFeed } from '@services/feedService';
import { storage } from '@lib/storage';
import { KeyboardShortcutsHelp } from '@components/Common/KeyboardShortcutsHelp';
import { ArticleCardSkeleton } from '@components/Common/Skeleton';
import { discoverFeeds } from '@utils/feedDiscovery';
import type { Feed, Article } from '@/models';

interface FeedDetailLoaderData {
  feed: Feed;
  articles: Article[];
  isOffline: boolean;
}

const FALLBACK_FEEDS = [
  { url: 'https://feeds.feedburner.com/TechCrunch', title: 'TechCrunch' },
  { url: 'https://www.theverge.com/rss/index.xml', title: 'The Verge' },
  { url: 'https://hnrss.org/frontpage', title: 'Hacker News' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', title: 'Ars Technica' },
  { url: 'https://www.wired.com/feed/rss', title: 'Wired' },
];

export function FeedDetailPage() {
  const loaderData = useLoaderData() as FeedDetailLoaderData;
  const navigate = useNavigate();
  const { toggleArticleFavorite, subscribeFeed } = useStore();
  const [articles, setArticles] = useState<Article[]>(loaderData.articles);
  const [feed, setFeed] = useState<Feed>(loaderData.feed);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingArticles, setIsLoadingArticles] = useState(loaderData.articles.length === 0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [suggestedFeeds, setSuggestedFeeds] = useState<{ url: string; title: string }[]>([]);
  const [subscribingUrl, setSubscribingUrl] = useState<string | null>(null);

  // Sync with loader data when navigating to a different feed
  useEffect(() => {
    setArticles(loaderData.articles);
    setFeed(loaderData.feed);
    setIsLoadingArticles(loaderData.articles.length === 0);
  }, [loaderData]);

  useEffect(() => {
    if (!feed.link) {
      setSuggestedFeeds(FALLBACK_FEEDS.slice(0, 5));
      return;
    }
    discoverFeeds(feed.link).then((discovered) => {
      setSuggestedFeeds(discovered.length > 0 ? discovered.slice(0, 5) : FALLBACK_FEEDS.slice(0, 5));
    });
  }, [feed.id, feed.link]);

  const handleSubscribeSuggested = useCallback(async (url: string) => {
    setSubscribingUrl(url);
    await subscribeFeed(url);
    setSubscribingUrl(null);
  }, [subscribeFeed]);

  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      await fetchAndStoreArticles(feed.id);
      const updatedArticles = await getArticlesForFeed(feed.id);
      setArticles(updatedArticles);
      const updatedFeed = await storage.get('feeds', feed.id);
      if (updatedFeed) {
        setFeed(updatedFeed);
      }
    } catch {
      setRefreshError('Failed to refresh feed');
    } finally {
      setIsRefreshing(false);
    }
  }, [feed.id]);

  const handleFavoriteToggle = useCallback(async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleArticleFavorite(articleId);
    setArticles(prev =>
      prev.map(a => a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a)
    );
  }, [toggleArticleFavorite]);

  // Sort articles by publishedAt descending
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const unreadCount = sortedArticles.filter(a => !a.readAt).length;

  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;

  useKeyboardShortcuts({
    j: () => setSelectedIndex((i) => Math.min(i + 1, sortedArticles.length - 1)),
    k: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
    o: () => {
      const article = sortedArticles[selectedIndexRef.current];
      if (article) navigate(`/articles/${article.id}`);
    },
    Enter: () => {
      const article = sortedArticles[selectedIndexRef.current];
      if (article) navigate(`/articles/${article.id}`);
    },
    '?': () => setShowHelp((v) => !v),
    Escape: () => navigate('/feeds'),
  });

  return (
    <div className="mx-auto max-w-4xl">
      {showHelp && <KeyboardShortcutsHelp onClose={() => setShowHelp(false)} />}
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/feeds')}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feeds
        </button>
        <div className="flex items-start gap-3">
          {feed.iconUrl && (
            <img src={feed.iconUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">{feed.title}</h1>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent disabled:opacity-50"
                title="Refresh feed"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            {feed.description && (
              <p className="mt-1 text-sm text-muted-foreground">{feed.description}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{sortedArticles.length} articles</span>
              {unreadCount > 0 && <span>{unreadCount} unread</span>}
              {feed.lastFetchedAt && (
                <span>Updated {formatRelativeTime(new Date(feed.lastFetchedAt))}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {loaderData.isOffline && (
        <div className="mb-4 rounded-md border border-border bg-secondary p-3 text-sm text-secondary-foreground">
          Offline Mode — Showing cached articles
        </div>
      )}

      {refreshError && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {refreshError}
          <button onClick={() => setRefreshError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Article List */}
      {isLoadingArticles ? (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : sortedArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
          <RefreshCw className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">No articles yet</h2>
          <p className="text-sm text-muted-foreground">
            Articles will appear here after the feed is refreshed
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {sortedArticles.map((article, index) => {
            const isUnread = !article.readAt;
            const isSelected = index === selectedIndex;
            return (
              <div
                key={article.id}
                className={`flex items-start gap-3 p-4 transition-colors hover:bg-accent ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}`}
              >
                {/* Unread Indicator */}
                <div className="mt-2 flex h-2 w-2 shrink-0 items-center justify-center">
                  {isUnread && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>

                {/* Article Content - clickable link */}
                <Link
                  to={`/articles/${article.id}`}
                  className="min-w-0 flex-1"
                >
                  <h3
                    className={`line-clamp-2 text-sm ${
                      isUnread
                        ? 'font-semibold text-card-foreground'
                        : 'font-normal text-muted-foreground'
                    }`}
                  >
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {article.summary}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {article.author && <span>{article.author}</span>}
                    <span>{formatRelativeTime(new Date(article.publishedAt))}</span>
                  </div>
                </Link>

                {/* Thumbnail */}
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-md object-cover"
                    loading="lazy"
                  />
                )}

                {/* Favorite */}
                <button
                  onClick={(e) => handleFavoriteToggle(article.id, e)}
                  className={`shrink-0 rounded-md p-1.5 transition-colors ${
                    article.isFavorite
                      ? 'text-red-500'
                      : 'text-muted-foreground hover:text-red-500'
                  }`}
                  title={article.isFavorite ? '取消收藏' : '收藏'}
                >
                  <Heart className="h-4 w-4" fill={article.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* Suggested Feeds */}
      {suggestedFeeds.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-base font-semibold text-foreground">Suggested Feeds</h2>
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {suggestedFeeds.map((sf) => (
              <div key={sf.url} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">{sf.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{sf.url}</p>
                </div>
                <button
                  onClick={() => handleSubscribeSuggested(sf.url)}
                  disabled={subscribingUrl === sf.url}
                  className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {subscribingUrl === sf.url ? 'Subscribing…' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
