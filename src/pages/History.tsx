/**
 * History Page
 * Shows reading history - articles that have been read, ordered by read time
 */

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart } from 'lucide-react';
import { storage } from '@lib/storage';
import type { Article, Feed } from '@models/Feed';

export function HistoryPage() {
  const [history, setHistory] = useState<(Article & { feedTitle?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const allArticles = await storage.getAll('articles') as Article[];
      const allFeeds = await storage.getAll('feeds') as Feed[];
      const feedMap = new Map(allFeeds.map(f => [f.id, f.title]));

      const readArticles = allArticles
        .filter(a => a.readAt)
        .sort((a, b) => {
          const aTime = a.readAt ? new Date(a.readAt).getTime() : 0;
          const bTime = b.readAt ? new Date(b.readAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 50) // Last 50 read articles
        .map(a => ({ ...a, feedTitle: feedMap.get(a.feedId) }));
      setHistory(readArticles);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try { await storage.init(); } catch { /* already init */ }
      await loadHistory();
    };
    init();
  }, [loadHistory]);

  const formatReadTime = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Reading History {history.length > 0 && <span className="text-muted-foreground">({history.length})</span>}
      </h1>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
          <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">No reading history</h2>
          <p className="text-sm text-muted-foreground">
            Articles you read will appear here
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {history.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.id}`}
              className="flex items-start gap-3 p-4 transition-colors hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="line-clamp-2 text-sm font-medium text-card-foreground">
                    {article.title}
                  </h3>
                  {article.isFavorite && (
                    <Heart className="h-3.5 w-3.5 shrink-0 fill-red-500 text-red-500" />
                  )}
                </div>
                {article.summary && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {article.summary}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  {article.feedTitle && <span>{article.feedTitle}</span>}
                  {article.author && <span>• {article.author}</span>}
                  <span>• Read {formatReadTime(article.readAt)}</span>
                </div>
              </div>

              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
