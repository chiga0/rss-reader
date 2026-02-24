/**
 * Favorites Page
 * Shows all favorited articles with unfavorite support
 */

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, HeartOff } from 'lucide-react';
import { storage } from '@lib/storage';
import { formatRelativeTime } from '@utils/dateFormat';
import type { Article, Feed } from '@models/Feed';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<(Article & { feedTitle?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const allArticles = await storage.getAll('articles') as Article[];
      const allFeeds = await storage.getAll('feeds') as Feed[];
      const feedMap = new Map(allFeeds.map(f => [f.id, f.title]));

      const favoriteArticles = allArticles
        .filter(a => a.isFavorite)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .map(a => ({ ...a, feedTitle: feedMap.get(a.feedId) }));
      setFavorites(favoriteArticles);
    } catch (error) {
      console.error('Failed to load favorites', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await storage.init().catch(() => { /* already initialized */ });
      await loadFavorites();
    };
    init();
  }, [loadFavorites]);

  const handleUnfavorite = useCallback(async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const article = await storage.get('articles', articleId) as Article;
      if (article) {
        article.isFavorite = false;
        await storage.put('articles', article);
        setFavorites(prev => prev.filter(a => a.id !== articleId));
      }
    } catch (error) {
      console.error('Failed to unfavorite article', error);
    }
  }, []);

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
        Favorites {favorites.length > 0 && <span className="text-muted-foreground">({favorites.length})</span>}
      </h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
          <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">No favorites yet</h2>
          <p className="text-sm text-muted-foreground">
            Articles you favorite will appear here for easy access
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {favorites.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.id}`}
              className="flex items-start gap-3 p-4 transition-colors hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-semibold text-card-foreground">
                  {article.title}
                </h3>
                {article.summary && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {article.summary}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  {article.feedTitle && <span>{article.feedTitle}</span>}
                  {article.author && <span>• {article.author}</span>}
                  <span>• {formatRelativeTime(new Date(article.publishedAt))}</span>
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

              <button
                onClick={(e) => handleUnfavorite(article.id, e)}
                className="shrink-0 rounded-md p-1.5 text-red-500 transition-colors hover:bg-destructive/10"
                title="Remove from favorites"
              >
                <HeartOff className="h-4 w-4" />
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
