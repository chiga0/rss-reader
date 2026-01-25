/**
 * Favorites Page
 * Shows all favorited articles
 */

import { useEffect, useState } from 'react';
import { useStore } from '@hooks/useStore';
import { storage } from '@lib/storage';
import type { Article } from '@models/Feed';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectArticle, selectedArticleId } = useStore();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const allArticles = await storage.getAll('articles');
      const favoriteArticles = allArticles
        .filter(a => a.isFavorite)
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
      setFavorites(favoriteArticles);
    } catch (error) {
      console.error('Failed to load favorites', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If article is selected, show it
  if (selectedArticleId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => selectArticle(null)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>返回收藏列表</span>
        </button>
        {/* Article will be shown in ArticleView component */}
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 className="mb-2 text-xl font-semibold">暂无收藏</h2>
        <p className="text-gray-600 dark:text-gray-400">
          点击文章上的收藏按钮来保存您喜欢的文章
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">我的收藏 ({favorites.length})</h1>
      <div className="space-y-4">
        {favorites.map(article => (
          <article
            key={article.id}
            onClick={() => selectArticle(article.id)}
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <h3 className="font-semibold mb-2">{article.title}</h3>
            {article.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {article.summary}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
              {article.author && <span>{article.author}</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
