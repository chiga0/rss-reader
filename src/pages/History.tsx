/**
 * History Page
 * Shows reading history (read articles)
 */

import { useEffect, useState } from 'react';
import { useStore } from '@hooks/useStore';
import { storage } from '@lib/storage';
import type { Article } from '@models/Feed';

export function HistoryPage() {
  const [history, setHistory] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectArticle, selectedArticleId } = useStore();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const allArticles = await storage.getAll('articles');
      const readArticles = allArticles
        .filter(a => a.readAt)
        .sort((a, b) => {
          const aTime = a.readAt ? new Date(a.readAt).getTime() : 0;
          const bTime = b.readAt ? new Date(b.readAt).getTime() : 0;
          return bTime - aTime;
        });
      setHistory(readArticles);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If article is selected, show back button
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
          <span>返回历史记录</span>
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="mb-2 text-xl font-semibold">暂无历史记录</h2>
        <p className="text-gray-600 dark:text-gray-400">
          您阅读过的文章将显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">阅读历史 ({history.length})</h1>
      <div className="space-y-4">
        {history.map(article => (
          <article
            key={article.id}
            onClick={() => selectArticle(article.id)}
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{article.title}</h3>
                {article.summary && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {article.summary}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>阅读于: {new Date(article.readAt!).toLocaleString('zh-CN')}</span>
                  {article.author && <span>{article.author}</span>}
                </div>
              </div>
              {article.isFavorite && (
                <svg className="h-5 w-5 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
