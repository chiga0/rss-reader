/**
 * Feed Detail Page - Articles from a specific feed
 * Shows article list with read/unread status, mark-as-read, and favorites
 */

import { useCallback } from 'react';
import { useLoaderData, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, RefreshCw, ExternalLink } from 'lucide-react';
import { useStore } from '@hooks/useStore';
import { sanitizeHTML } from '@utils/sanitize';
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
        <div className="space-y-6">
          {sortedArticles.map((article) => {
            const isUnread = !article.readAt;
            const articleContent = article.content
              ? sanitizeHTML(article.content)
              : article.summary || '';
            return (
              <article
                key={article.id}
                className="rounded-lg border border-border bg-card p-6"
              >
                {/* Article Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {isUnread && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      <Link
                        to={`/articles/${article.id}`}
                        className={`text-lg font-semibold transition-colors hover:text-primary ${
                          isUnread ? 'text-card-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {article.title}
                      </Link>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {article.author && <span>{article.author}</span>}
                      <span>{formatRelativeTime(new Date(article.publishedAt))}</span>
                    </div>
                  </div>
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
                </div>

                {/* Featured Image */}
                {article.imageUrl && (
                  <figure className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="w-full object-cover"
                      loading="lazy"
                    />
                  </figure>
                )}

                {/* Article Content */}
                <div
                  className="prose prose-neutral max-w-none dark:prose-invert
                    prose-headings:text-foreground prose-headings:font-semibold
                    prose-p:text-foreground prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-lg prose-img:my-4
                    prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                    prose-code:text-foreground prose-code:bg-secondary prose-code:rounded prose-code:px-1
                    prose-pre:bg-secondary prose-pre:text-foreground"
                  dangerouslySetInnerHTML={{ __html: articleContent }}
                />

                {/* Article Footer */}
                {article.link && (
                  <div className="mt-4 border-t border-border pt-4">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Read original article
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
