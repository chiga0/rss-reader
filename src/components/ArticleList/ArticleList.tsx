/**
 * ArticleList Component
 * Scrollable list of articles for the selected feed
 */

import { useTranslation } from 'react-i18next';
import { useStore } from '../../hooks/useStore';
import { ArticleItem } from './ArticleItem';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';

export function ArticleList() {
  const { t } = useTranslation('article');
  const { articles, selectedFeedId, feeds, isLoading, error, selectArticle, selectFeed, setError } = useStore();

  // Get selected feed
  const selectedFeed = feeds.find((f) => f.id === selectedFeedId);

  // Filter articles for selected feed
  const feedArticles = selectedFeedId
    ? articles
        .filter((a) => a.feedId === selectedFeedId && !a.deletedAt)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    : [];

  // Handle article click
  const handleArticleClick = (articleId: string) => {
    selectArticle(articleId);
  };

  // Handle back to feed list
  const handleBack = () => {
    selectFeed(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header with Back Button */}
      {selectedFeed && (
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors tablet:hidden"
              title={t('backToFeeds')}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {selectedFeed.imageUrl && (
              <img
                src={selectedFeed.imageUrl}
                alt={`${selectedFeed.title} logo`}
                className="h-10 w-10 rounded-lg object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {selectedFeed.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('articleCount', { count: feedArticles.length })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && <LoadingSpinner message={t('loadingArticles')} />}

      {/* Empty State - No Feed Selected */}
      {!isLoading && !selectedFeedId && (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <svg
            className="mb-4 h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            No feed selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a feed to view its articles
          </p>
        </div>
      )}

      {/* Empty State - Feed Has No Articles */}
      {!isLoading && selectedFeedId && feedArticles.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <svg
            className="mb-4 h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            No articles yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This feed doesn&apos;t have any articles
          </p>
        </div>
      )}

      {/* Article List */}
      {!isLoading && feedArticles.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          {feedArticles.map((article) => (
            <ArticleItem
              key={article.id}
              article={article}
              onClick={() => handleArticleClick(article.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}