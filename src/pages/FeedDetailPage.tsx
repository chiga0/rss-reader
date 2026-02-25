/**
 * Feed Detail Page - Articles from a specific feed
 * Shows article list with read/unread status, mark-as-read, and favorites
 */

import { useCallback } from 'react';
import { useLoaderData, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, RefreshCw } from 'lucide-react';
import { useStore } from '@hooks/useStore';
import { formatRelativeTime } from '@utils/dateFormat';
import type { Feed, Article } from '@/models';

interface FeedDetailLoaderData {
  feed: Feed;
  articles: Article[];
  isOffline: boolean;
}

export function FeedDetailPage() {
  const { feed, articles, isOffline } = useLoaderData() as FeedDetailLoaderData;
  const navigate = useNavigate();
  const { toggleArticleFavorite } = useStore();

  const handleFavoriteToggle = useCallback(async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleArticleFavorite(articleId);
  }, [toggleArticleFavorite]);

  // Sort articles by publishedAt descending
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const unreadCount = sortedArticles.filter(a => !a.readAt).length;

  return (
    <div className="mx-auto max-w-4xl">
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
            <h1 className="text-2xl font-bold text-foreground">{feed.title}</h1>
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

      {isOffline && (
        <div className="mb-4 rounded-md border border-border bg-secondary p-3 text-sm text-secondary-foreground">
          Offline Mode — Showing cached articles
        </div>
      )}

      {/* Article List */}
      {sortedArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
          <RefreshCw className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">No articles yet</h2>
          <p className="text-sm text-muted-foreground">
            Articles will appear here after the feed is refreshed
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {sortedArticles.map((article) => {
            const isUnread = !article.readAt;
            return (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-accent"
              >
                {/* Unread Indicator */}
                <div className="mt-2 flex h-2 w-2 shrink-0 items-center justify-center">
                  {isUnread && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>

                {/* Article Content */}
                <div className="min-w-0 flex-1">
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
                </div>

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
                  title={article.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className="h-4 w-4" fill={article.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
